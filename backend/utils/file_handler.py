import os
import tempfile
import hashlib
import shutil
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class FileHandler:
    """Utility class for handling uploaded files securely"""
    
    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = upload_dir
        self.max_file_size = 100 * 1024 * 1024  # 100MB limit
        self.allowed_extensions = {
            '.exe', '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.bmp',
            '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
            '.zip', '.rar', '.7z', '.tar', '.gz',
            '.txt', '.rtf', '.csv', '.xml', '.json'
        }
        
        # Create upload directory if it doesn't exist
        os.makedirs(self.upload_dir, exist_ok=True)
    
    def is_allowed_file(self, filename: str) -> bool:
        """Check if file extension is allowed"""
        if not filename:
            return False
        
        _, ext = os.path.splitext(filename.lower())
        return ext in self.allowed_extensions
    
    def calculate_file_hash(self, file_path: str) -> Dict[str, str]:
        """Calculate MD5, SHA1, and SHA256 hashes of file"""
        hashes = {'md5': '', 'sha1': '', 'sha256': ''}
        
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
                
                hashes['md5'] = hashlib.md5(content).hexdigest()
                hashes['sha1'] = hashlib.sha1(content).hexdigest()
                hashes['sha256'] = hashlib.sha256(content).hexdigest()
        except Exception as e:
            logger.error(f"Error calculating file hashes: {e}")
        
        return hashes
    
    def save_uploaded_file(self, file_data: bytes, filename: str) -> Optional[str]:
        """Safely save uploaded file and return the file path"""
        try:
            # Validate file size
            if len(file_data) > self.max_file_size:
                raise ValueError(f"File size exceeds maximum limit of {self.max_file_size} bytes")
            
            # Validate filename
            if not self.is_allowed_file(filename):
                raise ValueError(f"File type not allowed: {filename}")
            
            # Generate safe filename
            safe_filename = self.generate_safe_filename(filename)
            file_path = os.path.join(self.upload_dir, safe_filename)
            
            # Save file
            with open(file_path, 'wb') as f:
                f.write(file_data)
            
            logger.info(f"File saved successfully: {file_path}")
            return file_path
            
        except Exception as e:
            logger.error(f"Error saving file: {e}")
            return None
    
    def generate_safe_filename(self, filename: str) -> str:
        """Generate a safe filename to prevent directory traversal attacks"""
        # Remove any path components
        filename = os.path.basename(filename)
        
        # Generate hash prefix to avoid naming conflicts
        hash_prefix = hashlib.md5(filename.encode()).hexdigest()[:8]
        
        # Combine hash with original filename
        name, ext = os.path.splitext(filename)
        safe_filename = f"{hash_prefix}_{name}{ext}"
        
        return safe_filename
    
    def cleanup_file(self, file_path: str) -> bool:
        """Safely remove file after analysis"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"File cleaned up: {file_path}")
                return True
        except Exception as e:
            logger.error(f"Error cleaning up file {file_path}: {e}")
        
        return False
    
    def get_file_info(self, file_path: str) -> Dict[str, Any]:
        """Get comprehensive file information"""
        info = {
            'filename': os.path.basename(file_path),
            'size': 0,
            'extension': '',
            'hashes': {},
            'exists': False
        }
        
        try:
            if os.path.exists(file_path):
                info['exists'] = True
                info['size'] = os.path.getsize(file_path)
                info['extension'] = os.path.splitext(file_path)[1].lower()
                info['hashes'] = self.calculate_file_hash(file_path)
        except Exception as e:
            logger.error(f"Error getting file info: {e}")
        
        return info

class VirusTotalChecker:
    """Integration with VirusTotal API for additional validation"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.base_url = "https://www.virustotal.com/vtapi/v2/file/"
    
    def check_file_hash(self, file_hash: str) -> Dict[str, Any]:
        """Check file hash against VirusTotal database"""
        # This is a placeholder for VirusTotal integration
        # In a real implementation, you would make API calls to VirusTotal
        
        if not self.api_key:
            return {
                'available': False,
                'message': 'VirusTotal API key not configured'
            }
        
        # Placeholder response
        return {
            'available': True,
            'detections': 0,
            'total_scans': 0,
            'scan_date': None,
            'permalink': None
        }

def create_scan_report(analysis_result: Dict[str, Any], file_info: Dict[str, Any]) -> Dict[str, Any]:
    """Create a comprehensive scan report"""
    report = {
        'scan_id': hashlib.md5(f"{file_info['filename']}{analysis_result.get('file_path', '')}".encode()).hexdigest(),
        'timestamp': None,
        'file_info': file_info,
        'analysis_result': analysis_result,
        'status': 'completed'
    }
    
    # Add timestamp
    from datetime import datetime
    report['timestamp'] = datetime.now().isoformat()
    
    return report