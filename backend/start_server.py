#!/usr/bin/env python3
"""
Ransomware Detection Backend Server
Run this script to start the Flask API server
"""

import os
import sys
import subprocess
import platform
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_python_version():
    """Check if Python version is 3.8 or higher"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        print(f"Current version: {sys.version}")
        sys.exit(1)
    print(f"✅ Python version: {sys.version_info.major}.{sys.version_info.minor}")

def install_requirements():
    """Install required packages"""
    print("📦 Installing requirements...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Requirements installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing requirements: {e}")
        sys.exit(1)

def check_system_dependencies():
    """Check if system dependencies are available"""
    system = platform.system().lower()
    print(f"🖥️  Detected system: {system}")
    
    if system == "windows":
        print("💡 On Windows, you may need to install Visual C++ Build Tools")
        print("💡 Consider installing python-magic-bin: pip install python-magic-bin")
    elif system == "linux":
        print("💡 On Linux, ensure libmagic1 is installed: sudo apt-get install libmagic1")
    elif system == "darwin":  # macOS
        print("💡 On macOS, ensure libmagic is installed: brew install libmagic")

def create_directories():
    """Create necessary directories"""
    dirs = ["uploads", "../uploads"]
    for dir_path in dirs:
        os.makedirs(dir_path, exist_ok=True)
        print(f"📁 Created directory: {dir_path}")

def start_server():
    """Start the Flask development server"""
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV', 'development') != 'production'
    
    print("🚀 Starting Flask development server...")
    print(f"📡 Server will be available at: http://localhost:{port}")
    print("🔗 API endpoints:")
    print("   - Health check: GET /api/health")
    print("   - File upload: POST /api/upload")
    print("   - Scan results: GET /api/scan/{scan_id}")
    print("   - Statistics: GET /api/stats")
    print(f"\n🔍 Make sure your React frontend is configured to use: http://localhost:{port}/api")
    print("\n⚠️  Press Ctrl+C to stop the server\n")
    
    try:
        # Import and run the Flask app
        from api.app import app
        app.run(host='0.0.0.0', port=port, debug=debug)
    except ImportError as e:
        print(f"❌ Error importing Flask app: {e}")
        print("💡 Make sure you're running from the backend directory")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("🛡️  Ransomware Detection Backend Server")
    print("=" * 50)
    
    # Change to script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # Run checks and setup
    check_python_version()
    check_system_dependencies()
    create_directories()
    
    # Ask user if they want to install requirements
    response = input("\n📦 Install/update requirements? (y/n): ").lower().strip()
    if response in ['y', 'yes']:
        install_requirements()
    
    print("\n🚀 Starting server...")
    start_server()