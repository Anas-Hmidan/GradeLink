# GradeLink

An AI-powered exam management and anti-cheating system designed for educational institutions. The platform enables teachers to generate tests from course materials using AI, while ensuring academic integrity through real-time monitoring during exam sessions.

## ⚠️ Development Status

**This project is currently under development.** Some features may be incomplete or subject to change. I'll continue working on it after my exams are finished.

## 🎯 Features

### For Teachers
- **AI-Powered Test Generation**: Upload PDF or Word documents and automatically generate multiple-choice questions using Google Gemini AI
- **Customizable Tests**: Set difficulty levels, question counts, and time limits
- **Results Dashboard**: View student performance, detect potential cheating, and analyze test statistics
- **Test Management**: Create, edit, and manage multiple tests

### For Students
- **Web Interface**: Take tests through a modern, responsive web interfaces
- **Desktop Application**: Secure, monitored exam environment with proctoring features
- **Instant Results**: Get immediate feedback on completed tests
- **Test History**: Track your performance over time

### Anti-Cheating System
- **Real-time Face Detection**: Monitor student presence throughout the exam
- **Privacy-First Design**: Screenshots are captured only when suspicious activity is detected
- **Multiple Detection Triggers**: Detects no face, multiple faces, or face partially out of frame
- **Smart Filtering**: Reduces false positives with persistence checks and cooldown periods

## 🏗️ Architecture

The project consists of four main components:

```
GradeLink/
├── backend/           # Node.js/Next.js API (authentication, test generation, grading)
├── frontend/          # Next.js web application (teacher & student interface)
├── desktop/           # Electron desktop app (proctored exam environment)
└── face-detection-backend/  # Python/Flask API (real-time cheating detection)
```

## 🛠️ Tech Stack

### Backend (Node.js)
- **Framework**: Next.js 16 with App Router
- **Database**: MongoDB with Mongoose
- **AI**: Google Gemini 1.5 Flash
- **Authentication**: JWT with bcrypt
- **File Processing**: pdf-parse, mammoth

### Frontend (Next.js)
- **Framework**: Next.js 16 with TypeScript
- **UI Library**: React 19 with Radix UI components
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios

### Desktop (Electron)
- **Framework**: Electron 28
- **UI**: Next.js + React
- **Real-time Monitoring**: WebRTC for camera access
- **Proctoring**: Integration with face detection API

### Face Detection API (Python)
- **Framework**: Flask
- **Computer Vision**: OpenCV
- **Detection**: Face detection with visibility analysis
- **Storage**: Local filesystem for suspicious frames

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.7+
- MongoDB (local or cloud)
- pnpm or npm
- Google Gemini API key

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Anas-Hmidan/GradeLink.git
   cd GradeLink
   ```

2. **Set up the Backend**
   ```bash
   cd backend
   pnpm install
   cp .env.example .env
   # Edit .env with your MongoDB URI and Gemini API key
   pnpm dev
   ```

3. **Set up the Frontend**
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```

4. **Set up Face Detection API**
   ```bash
   cd face-detection-backend
   python -m venv venv
   venv\Scripts\activate  # On Windows
   pip install -r requirements.txt
   python api.py
   ```

5. **Set up Desktop App (Optional)**
   ```bash
   cd desktop
   pnpm install
   pnpm run electron:dev
   ```

For detailed setup instructions, see the README files in each component's directory.

## 📖 Documentation

Each component has its own detailed documentation:
- [Backend API Documentation](./backend/README.md) - REST API endpoints and database schema
- [Face Detection API](./face-detection-backend/API_DOCUMENTATION.md) - Cheating detection endpoints
- [Frontend Guide](./frontend/QUICK_START.md) - Web interface setup
- [Desktop Setup](./desktop/SETUP_INSTRUCTIONS.md) - Electron app configuration

## 🔐 Security Features

- **Password Hashing**: PBKDF2 with unique salts (100,000 iterations)
- **JWT Authentication**: Secure token-based auth with role-based access control
- **Rate Limiting**: Protection against brute force attacks
- **File Validation**: Type and size checks for uploads
- **CORS Configuration**: Controlled cross-origin access
- **Privacy Protection**: Screenshots only on detected violations

## 🧪 Testing

Run tests for the Python API:
```bash
cd face-detection-backend
python scripts\test_api.py
```


**Note**: This is an academic project currently under active development. Features and documentation may change as the project evolves.
