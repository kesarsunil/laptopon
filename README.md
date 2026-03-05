# 🛡️ File Shield Watch - Advanced Ransomware Detection System

A comprehensive file security scanner that combines React frontend with Python backend for real-time ransomware detection and analysis.

## 🌟 Features

### Frontend (React + TypeScript)
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Drag & Drop Upload**: Intuitive file upload interface
- **Real-time Results**: Live scanning progress and results
- **Detailed Reports**: Comprehensive threat analysis with recommendations
- **Responsive Design**: Works on desktop and mobile devices

### Backend (Python + Flask)
- **Advanced Detection**: Multi-layered ransomware analysis
- **File Type Support**: Analyzes .exe, .pdf, .jpg, .png, .doc, .zip and more
- **Machine Learning**: Entropy analysis and behavioral pattern detection
- **Signature Database**: Known ransomware family detection
- **REST API**: Clean HTTP API for integration

## 🔍 Detection Methods

1. **Signature-Based Detection**
   - Known ransomware family signatures
   - Suspicious string pattern matching
   - File extension analysis

2. **Entropy Analysis**
   - Shannon entropy calculation
   - Encrypted content detection
   - Section-wise analysis for PE files

3. **PE Header Analysis** (for .exe files)
   - Executable structure examination
   - Suspicious API import detection
   - Section characteristics analysis

4. **Behavioral Pattern Analysis**
   - Ransomware-related string detection
   - C&C communication pattern analysis
   - File modification behavior analysis

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ and npm
- **Python** 3.8+ and pip
- **Git** (optional)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd file-shield-watch
```

### 2. Frontend Setup
```bash
# Install frontend dependencies
npm install

# Start React development server
npm run dev
```
The frontend will be available at `http://localhost:8081`

### 3. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start Flask server
python start_server.py
```
The backend API will be available at `http://localhost:5000`

## 📁 Project Structure

```
file-shield-watch/
├── src/                          # React frontend source
│   ├── components/               # React components
│   │   ├── FileUpload.tsx       # Main file upload component
│   │   ├── Header.tsx           # Application header
│   │   ├── SecurityDashboard.tsx # Statistics dashboard
│   │   └── ui/                  # UI components (buttons, cards, etc.)
│   ├── pages/                   # Application pages
│   ├── hooks/                   # Custom React hooks
│   └── lib/                     # Utility functions
├── backend/                     # Python backend
│   ├── api/                     # Flask API endpoints
│   │   └── app.py              # Main Flask application
│   ├── models/                  # ML models and detection logic
│   │   └── ransomware_detector.py # Core detection engine
│   ├── utils/                   # Utility functions
│   │   └── file_handler.py     # File handling utilities
│   ├── uploads/                 # Temporary file storage
│   ├── requirements.txt         # Python dependencies
│   ├── start_server.py         # Server startup script
│   └── README.md               # Backend documentation
├── public/                      # Static assets
├── package.json                # Frontend dependencies
└── README.md                   # This file
```

## 🔧 Configuration

### Frontend Configuration
- **API Base URL**: Configure in `src/components/FileUpload.tsx`
- **File Size Limit**: 100MB (configurable in dropzone)
- **Supported File Types**: All types accepted

### Backend Configuration
- **Port**: 5000 (configurable in `api/app.py`)
- **File Size Limit**: 100MB (configurable in Flask app)
- **Upload Directory**: `backend/uploads/`
- **CORS**: Enabled for frontend integration

## 📊 API Endpoints

### Health Check
```http
GET /api/health
```

### File Upload & Analysis
```http
POST /api/upload
Content-Type: multipart/form-data

Form Data:
- file: <binary file data>
```

### Get Scan Results
```http
GET /api/scan/{scan_id}
```

### List Recent Scans
```http
GET /api/scans
```

### Get Statistics
```http
GET /api/stats
```

## 🛡️ Threat Levels

- **CLEAN**: No threats detected
- **LOW**: Minor suspicious indicators
- **MEDIUM**: Moderate risk indicators  
- **HIGH**: Strong ransomware indicators
- **CRITICAL**: Confirmed ransomware detection

## 🔒 Security Features

- **Input Validation**: File type and size validation
- **Secure Upload**: Temporary file storage with cleanup
- **Safe Analysis**: Files analyzed in isolated environment
- **Error Handling**: Comprehensive error handling and logging
- **CORS Protection**: Configured for frontend integration

## 🧪 Testing

### Test the Backend
```bash
cd backend
python -m pytest tests/  # Run unit tests (if available)

# Manual testing with curl
curl -X POST -F "file=@test_file.exe" http://localhost:5000/api/upload
```

### Test the Frontend
```bash
npm test  # Run React tests
npm run build  # Test production build
```

## 🚀 Production Deployment

### Frontend (React)
```bash
npm run build
# Deploy dist/ folder to web server
```

### Backend (Flask)
```bash
# Using Gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 api.app:app

# Using Docker (create Dockerfile)
docker build -t ransomware-detector .
docker run -p 5000:5000 ransomware-detector
```

## 🛠️ Development

### Adding New Detection Methods
1. Extend `RansomwareDetector` class in `backend/models/ransomware_detector.py`
2. Add feature extraction methods
3. Update risk scoring algorithm
4. Test with known samples

### Frontend Development
1. Components are in `src/components/`
2. Uses TypeScript for type safety
3. Tailwind CSS for styling
4. React Query for API integration

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues
```bash
# ImportError: failed to find libmagic
pip install python-magic-bin  # Windows
sudo apt-get install libmagic1  # Ubuntu
brew install libmagic  # macOS

# Permission denied
# Use different port or run with appropriate permissions

# ModuleNotFoundError
pip install -r requirements.txt
```

#### Frontend Issues
```bash
# Module not found
npm install

# Build errors
npm run build

# CORS errors
# Ensure backend CORS is properly configured
```

## 📝 License

This project is for educational and research purposes. Use responsibly and in accordance with local laws and regulations.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions and support:
- Check the backend README: `backend/README.md`
- Review API documentation
- Check troubleshooting section

## ⚠️ Disclaimer

This tool is for educational and security research purposes only. Always follow responsible disclosure practices and local laws when analyzing files. The authors are not responsible for any misuse of this software.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/f559aa4e-accc-4a3a-bd81-c8f5c1d98806) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/f559aa4e-accc-4a3a-bd81-c8f5c1d98806) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
#   l a p t o p o n  
 