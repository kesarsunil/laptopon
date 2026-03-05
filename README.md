# File Shield Watch

A real-time file security and ransomware detection system with an intuitive web interface.

## Features

- 🛡️ **Advanced Ransomware Detection** - Machine learning-powered detection of malicious files
- 📁 **File Upload & Analysis** - Drag-and-drop interface for quick file scanning
- 📊 **Security Dashboard** - Real-time monitoring and threat visualization
- ⚡ **Fast Analysis** - Instant file security assessment
- 🎨 **Modern UI** - Clean, responsive interface built with React and Tailwind CSS

## Tech Stack

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- Shadcn UI Components

### Backend
- Python Flask
- Machine Learning Models
- File Analysis Engine

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/kesarsunil/laptopon.git
cd file-shield-watchs
```

2. Install frontend dependencies
```bash
npm install
```

3. Install backend dependencies
```bash
cd backend
pip install -r requirements.txt
cd ..
```

### Running the Application

1. Start the backend server
```bash
cd backend
python start_server.py
```

2. Start the frontend development server
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   └── lib/               # Utilities
├── backend/               # Python backend
│   ├── api/              # Flask API
│   ├── models/           # ML models
│   └── utils/            # Backend utilities
└── public/               # Static assets
```

## Usage

1. Upload a file using the drag-and-drop interface
2. Wait for the analysis to complete
3. View the security assessment and threat level
4. Review detailed scan results on the dashboard

## Security

This application uses advanced machine learning algorithms to detect potential ransomware and malicious files. Always exercise caution when handling suspicious files.

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
