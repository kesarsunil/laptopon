# Ransomware Detection Backend

## Overview
This backend service provides advanced ransomware detection capabilities using machine learning and signature-based analysis. It can analyze various file types including executables (.exe), PDFs, images, and documents.

## Features
- **Multi-layered Detection**: Combines signature-based, entropy analysis, and behavioral pattern detection
- **File Type Support**: Analyzes .exe, .pdf, .jpg, .png, .doc, .zip and many other file formats
- **REST API**: Simple HTTP API for file upload and analysis
- **Real-time Analysis**: Immediate analysis results upon file upload
- **Comprehensive Reporting**: Detailed scan reports with threat levels and recommendations

## Installation

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Setup Instructions

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install required packages:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Install additional system dependencies:**
   
   **On Windows:**
   - Download and install Visual C++ Build Tools
   - Install python-magic-bin: `pip install python-magic-bin`
   
   **On Ubuntu/Debian:**
   ```bash
   sudo apt-get update
   sudo apt-get install libmagic1 python3-dev
   ```
   
   **On macOS:**
   ```bash
   brew install libmagic
   ```

## Running the Server

1. **Start the Flask development server:**
   ```bash
   python api/app.py
   ```

2. **The server will start on:**
   ```
   http://localhost:5000
   ```

3. **For production deployment:**
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 api.app:app
   ```

## API Endpoints

### Health Check
- **GET** `/api/health`
- Returns server status and version

### File Upload and Analysis
- **POST** `/api/upload`
- Upload a file for ransomware analysis
- **Form Data**: `file` (multipart/form-data)
- **Response**: Analysis results with threat level and confidence

### Get Scan Results
- **GET** `/api/scan/{scan_id}`
- Retrieve detailed results for a specific scan

### List Recent Scans
- **GET** `/api/scans`
- Get list of recent scans

### Statistics
- **GET** `/api/stats`
- Get scanning statistics and metrics

## Supported File Types
- Executables: .exe
- Documents: .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx
- Images: .jpg, .jpeg, .png, .gif, .bmp
- Archives: .zip, .rar, .7z, .tar, .gz
- Text files: .txt, .rtf, .csv, .xml, .json

## Detection Methods

### 1. Signature-Based Detection
- Scans for known ransomware family signatures
- Detects common ransomware strings and patterns
- Identifies suspicious file extensions

### 2. Entropy Analysis
- Calculates Shannon entropy to detect encrypted content
- High entropy may indicate encrypted/packed malware
- Section-wise entropy analysis for PE files

### 3. PE Header Analysis (for .exe files)
- Analyzes executable structure and imports
- Detects suspicious API calls
- Examines section characteristics

### 4. Behavioral Pattern Analysis
- Searches for ransomware-related strings
- Detects C&C communication patterns
- Analyzes file modification behaviors

## Threat Levels
- **CLEAN**: No threats detected
- **LOW**: Minor suspicious indicators
- **MEDIUM**: Moderate risk indicators
- **HIGH**: Strong ransomware indicators
- **CRITICAL**: Confirmed ransomware detection

## Security Considerations
- Files are temporarily stored during analysis and immediately deleted
- Maximum file size limit of 100MB
- Input validation and sanitization
- Secure filename generation
- CORS protection for web integration

## Example Usage

### Upload a file for analysis:
```bash
curl -X POST -F "file=@suspicious_file.exe" http://localhost:5000/api/upload
```

### Get scan results:
```bash
curl http://localhost:5000/api/scan/{scan_id}
```

## Troubleshooting

### Common Issues:

1. **ImportError: failed to find libmagic**
   - Install system libmagic library (see installation instructions)

2. **ModuleNotFoundError: No module named 'pefile'**
   - Run: `pip install -r requirements.txt`

3. **Permission denied when starting server**
   - Use a different port: `python api/app.py --port 5001`

4. **File too large error**
   - Check file size limit in configuration (default 100MB)

## Development

### Adding New Detection Methods:
1. Extend the `RansomwareDetector` class in `models/ransomware_detector.py`
2. Add new feature extraction methods
3. Update the risk scoring algorithm
4. Test with known samples

### Model Training:
To improve detection accuracy, you can train the ML model with labeled datasets:
1. Collect ransomware and benign file samples
2. Extract features using the existing methods
3. Train the RandomForest classifier
4. Save the trained model using pickle

## License
This project is for educational and research purposes. Use responsibly and in accordance with local laws and regulations.