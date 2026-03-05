from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import sys
import json
import logging
from datetime import datetime

# Add the backend directory to the Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(backend_dir))

try:
    from models.ransomware_detector import RansomwareDetector
except ImportError:
    # Fallback to simplified detector if main one has import issues
    from models.simple_detector import SimpleRansomwareDetector as RansomwareDetector
    print("Using simplified ransomware detector due to import issues")

from utils.file_handler import FileHandler, create_scan_report

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size
app.config['UPLOAD_FOLDER'] = os.path.join(backend_dir, '..', 'uploads')

# Initialize components
ransomware_detector = RansomwareDetector()
file_handler = FileHandler(app.config['UPLOAD_FOLDER'])

# In-memory storage for scan results (in production, use a database)
scan_results = {}

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file upload and initiate ransomware analysis"""
    try:
        # Check if file is present in request
        if 'file' not in request.files:
            return jsonify({
                'error': 'No file provided',
                'success': False
            }), 400
        
        file = request.files['file']
        
        # Check if filename is provided
        if file.filename == '':
            return jsonify({
                'error': 'No file selected',
                'success': False
            }), 400
        
        # Validate file type
        if not file_handler.is_allowed_file(file.filename):
            return jsonify({
                'error': f'File type not supported: {file.filename}',
                'success': False,
                'supported_types': list(file_handler.allowed_extensions)
            }), 400
        
        # Read file data
        file_data = file.read()
        
        # Save file temporarily
        file_path = file_handler.save_uploaded_file(file_data, file.filename)
        if not file_path:
            return jsonify({
                'error': 'Failed to save uploaded file',
                'success': False
            }), 500
        
        # Get file information
        file_info = file_handler.get_file_info(file_path)
        
        # Perform ransomware analysis
        logger.info(f"Starting analysis for file: {file.filename}")
        analysis_result = ransomware_detector.analyze_file(file_path)
        
        # Create comprehensive scan report
        scan_report = create_scan_report(analysis_result, file_info)
        
        # Store results (in production, use a database)
        scan_id = scan_report['scan_id']
        scan_results[scan_id] = scan_report
        
        # Clean up the uploaded file
        file_handler.cleanup_file(file_path)
        
        # Return results
        response_data = {
            'success': True,
            'scan_id': scan_id,
            'result': {
                'filename': file.filename,
                'file_size': file_info['size'],
                'file_type': analysis_result.get('file_type', 'unknown'),
                'is_ransomware': analysis_result['is_ransomware'],
                'threat_level': analysis_result['threat_level'],
                'confidence': analysis_result['confidence'],
                'detection_methods': analysis_result['detection_methods'],
                'matched_families': analysis_result['matched_families'],
                'recommendations': analysis_result['recommendations'],
                'scan_timestamp': scan_report['timestamp']
            }
        }
        
        logger.info(f"Analysis completed for {file.filename}. Threat level: {analysis_result['threat_level']}")
        
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"Error processing upload: {str(e)}")
        return jsonify({
            'error': f'Internal server error: {str(e)}',
            'success': False
        }), 500

@app.route('/api/scan/<scan_id>', methods=['GET'])
def get_scan_result(scan_id):
    """Retrieve detailed scan results by scan ID"""
    try:
        if scan_id not in scan_results:
            return jsonify({
                'error': 'Scan ID not found',
                'success': False
            }), 404
        
        scan_report = scan_results[scan_id]
        
        return jsonify({
            'success': True,
            'scan_report': scan_report
        }), 200
        
    except Exception as e:
        logger.error(f"Error retrieving scan result: {str(e)}")
        return jsonify({
            'error': f'Internal server error: {str(e)}',
            'success': False
        }), 500

@app.route('/api/scans', methods=['GET'])
def list_scans():
    """List all recent scans"""
    try:
        # Get recent scans (limit to last 100)
        recent_scans = []
        for scan_id, report in list(scan_results.items())[-100:]:
            recent_scans.append({
                'scan_id': scan_id,
                'filename': report['file_info']['filename'],
                'timestamp': report['timestamp'],
                'threat_level': report['analysis_result']['threat_level'],
                'is_ransomware': report['analysis_result']['is_ransomware']
            })
        
        # Sort by timestamp (most recent first)
        recent_scans.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return jsonify({
            'success': True,
            'scans': recent_scans,
            'total_count': len(scan_results)
        }), 200
        
    except Exception as e:
        logger.error(f"Error listing scans: {str(e)}")
        return jsonify({
            'error': f'Internal server error: {str(e)}',
            'success': False
        }), 500

@app.route('/api/stats', methods=['GET'])
def get_statistics():
    """Get scanning statistics"""
    try:
        total_scans = len(scan_results)
        ransomware_detected = sum(1 for report in scan_results.values() 
                                 if report['analysis_result']['is_ransomware'])
        clean_files = total_scans - ransomware_detected
        
        # Threat level distribution
        threat_levels = {}
        for report in scan_results.values():
            level = report['analysis_result']['threat_level']
            threat_levels[level] = threat_levels.get(level, 0) + 1
        
        # Recent activity (last 24 hours)
        from datetime import datetime, timedelta
        now = datetime.now()
        recent_scans = 0
        for report in scan_results.values():
            scan_time = datetime.fromisoformat(report['timestamp'])
            if now - scan_time <= timedelta(hours=24):
                recent_scans += 1
        
        stats = {
            'total_scans': total_scans,
            'threats_detected': ransomware_detected,
            'clean_files': clean_files,
            'recent_scans_24h': recent_scans,
            'threat_level_distribution': threat_levels,
            'detection_rate': (ransomware_detected / total_scans * 100) if total_scans > 0 else 0
        }
        
        return jsonify({
            'success': True,
            'statistics': stats
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting statistics: {str(e)}")
        return jsonify({
            'error': f'Internal server error: {str(e)}',
            'success': False
        }), 500

@app.errorhandler(413)
def file_too_large(error):
    """Handle file too large error"""
    return jsonify({
        'error': 'File too large. Maximum size is 100MB.',
        'success': False
    }), 413

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Endpoint not found',
        'success': False
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle internal server errors"""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({
        'error': 'Internal server error',
        'success': False
    }), 500

if __name__ == '__main__':
    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Run the Flask app
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )