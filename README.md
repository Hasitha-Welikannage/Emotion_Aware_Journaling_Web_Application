# Emotion-Aware Journaling Web Application

A full-stack web application that allows users to write journal entries and automatically detects emotions from their text using machine learning. The application consists of three main components: a React frontend, a Flask backend API, and an emotion detection microservice powered by Hugging Face transformers.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────────────┐
│   Frontend      │────▶│   Backend API   │────▶│ Emotion Detection Service│
│  (React/Vite)   │     │    (Flask)      │     │   (Flask + Transformers) │
│   Port: 3000    │     │   Port: 5000    │     │       Port: 5001         │
└─────────────────┘     └─────────────────┘     └──────────────────────────┘
```

## Features

- **User Authentication**: Secure registration and login system with session management
- **Journal Entries**: Create, read, update, and delete personal journal entries
- **Emotion Detection**: Automatic emotion analysis of journal content using ML
- **Responsive Design**: Modern UI built with Tailwind CSS
- **RESTful API**: Well-structured backend API with proper error handling

## Prerequisites

- **Python 3.12+**
- **Node.js 18+** and **npm**
- **Git**

## Project Structure

```
.
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── assets/ 
│   │   ├── auth/               # Authentication components
│   │   ├── components/         # Reusable UI components
│   │   ├── layout/             # Layout components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API calls
│   │   ├── App.jsx  
│   │   ├── index.css
│   │   └── main.jsx          
│   ├── package.json
│   └── vite.config.js
├── backend/                     # Main Flask API
│   ├── app/
│   │   ├── auth/               # Authentication routes and services
│   │   ├── journals/           # Journal CRUD operations
│   │   ├── users/              # User management
│   │   ├── emotion_analysis/   # Emotion analysis integration
│   │   ├── utils/              # Utility functions and error handlers
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── extentions.py
│   │   └── models.py
│   ├── tests/
│   ├── requirements.txt
│   └── run.py
└── emotion_detection_service/   # ML emotion detection microservice
    ├── app/
    │   ├── emotion/            # Emotion detection logic
    │   ├── utils
    │   ├── __init__.py
    │   ├── config.py
    │   └── extentions.py
    ├── model                   # Add the downloaded emotion detection model here
    ├── requirements.txt
    └── run.py
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Hasitha-Welikannage/Emotion_Aware_Journaling_Web_Application.git
cd Emotion_Aware_Journaling_Web_Application
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv .venv

# On macOS/Linux:
source .venv/bin/activate

# On Windows:
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Flask Settings
FLASK_APP=app.py
FLASK_ENV=dev

# Security - Generate a secure random string
SECRET_KEY=your-secret-key-here

# Database
SQLALCHEMY_DATABASE_URI=sqlite:///app.db
```

Initialize the database:

```bash
# Initialize migrations (only needed once)
flask db init

# Generate migration script
flask db migrate -m "Initial migration"

# Apply migrations to database
flask db upgrade
```

### 3. Emotion Detection Service Setup

#### 3.1. Download Pre-trained Model

The emotion detection model needs to be downloaded from Google Drive and placed in the correct directory.

1. **Download the model** from Google Drive:
   - **Google Drive Link**: ``
   - The download will be a compressed file (`.zip`)

2. **Extract and place the model**:
   ```bash
   # Navigate to emotion detection service directory
   cd emotion_detection_service

   # Create model directory if it doesn't exist
   mkdir -p model

   # Extract the downloaded model into the model directory
   ```

   The final structure should look like:
   ```
   emotion_detection_service/
   └── model/
       ├── config.json
       ├── pytorch_model.bin (or model.safetensors)
       ├── tokenizer_config.json
       ├── vocab.txt
       └── other model files...
   ```

#### 3.2. Install Dependencies

```bash
# Make sure you're in the emotion_detection_service directory
cd emotion_detection_service

# Create and activate virtual environment
python -m venv .venv

# On macOS/Linux:
source .venv/bin/activate

# On Windows:
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
echo "SECRET_KEY=your-secret-key-here" > .env
```

> **Important:** Make sure the model files are placed in the `emotion_detection_service/model/` directory before running the service. The application will load the model from this local directory.

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

## Running the Application

> **Prerequisites:** Ensure you have completed all setup steps above, including downloading and placing the emotion detection model in the `emotion_detection_service/model/` directory.

You need to run all three services simultaneously. Open three separate terminal windows:

### Terminal 1: Backend API (Port 5000)

```bash
cd backend
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
flask run
```

The backend API will be available at `http://localhost:5000`

### Terminal 2: Emotion Detection Service (Port 5001)

```bash
cd emotion_detection_service
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
flask run --port 5001
```

The emotion detection service will be available at `http://localhost:5001`

### Terminal 3: Frontend (Port 3000)

```bash
cd frontend
npm run dev
```

The frontend application will be available at `http://localhost:3000`

## Accessing the Application

Once all services are running, open your browser and navigate to:

```
http://localhost:3000
```

## Running Tests

### Backend Tests

```bash
cd backend
source .venv/bin/activate
python -m pytest tests/
```

## Tech Stack

### Frontend
- **React 19** - UI library
- **Vite 7** - Build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **React Icons** - Icon library

### Backend
- **Flask 3.1** - Web framework
- **Flask-SQLAlchemy** - ORM for database operations
- **Flask-Login** - User session management
- **Flask-Migrate** - Database migrations (Alembic)
- **Flask-Bcrypt** - Password hashing
- **Flask-CORS** - Cross-origin resource sharing
- **PostgreSQL/SQLite** - Database

### Emotion Detection Service
- **Flask 3.1** - Web framework
- **Hugging Face transformers** - transformers library
- **DistilBERT fine tuned model** - Pre-trained emotion detection model
- **PyTorch** - Deep learning framework
- **Flask-CORS** - Cross-origin resource sharing

## Environment Variables

### Backend (.env)

| Variable | Description | Default |
|---------------------------|-----------------------------------|--------------------|
| `FLASK_APP`               | Flask application entry point     | `app.py`           |
| `FLASK_ENV`               | Environment (`dev` or `prod`)     | `dev`              |
| `SECRET_KEY`              | Secret key for session management | Required           |
| `SQLALCHEMY_DATABASE_URI` | Database connection string        | `sqlite:///app.db` |

### Emotion Detection Service (.env)

| Variable     | Description                | Default  |
|--------------|----------------------------|----------|
| `SECRET_KEY` | Secret key for the service | Required |

## Development

### Frontend Development

The frontend uses Vite's dev server with hot module replacement. Any changes to React components will automatically refresh in the browser.

```bash
cd frontend
npm run dev
```

### Backend Development

Flask runs in debug mode by default in development, providing auto-reload on code changes:

```bash
cd backend
source .venv/bin/activate
python run.py
```

### API Proxy Configuration

The frontend Vite dev server is configured to proxy API requests to the backend. All requests to `/api/*` are forwarded to `http://127.0.0.1:5000`.

## Troubleshooting

### Database Issues

If you encounter database issues, reset the database:

```bash
cd backend
rm -rf migrations/
rm instance/app.db
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

### Model Loading Issues

If the emotion detection service fails to start or shows model-related errors:

**Model Not Found Error:**
```
FileNotFoundError: [Errno 2] No such file or directory: '.../emotion_detection_service/model'
```
- Ensure you've downloaded the model from the Google Drive link
- Verify the model files are extracted to `emotion_detection_service/model/` directory
- Check that the model directory contains files like `config.json`, `pytorch_model.bin`, and `tokenizer_config.json`

**Model Structure:**
The model directory should contain:
```
model/
├── config.json
├── pytorch_model.bin (or model.safetensors)
├── tokenizer_config.json
├── vocab.txt
└── special_tokens_map.json
```

**Disk Space Issues:**
- The model requires approximately 500MB of disk space
- Ensure you have sufficient space in the `emotion_detection_service` directory

### CORS Issues

If you encounter CORS errors:
- Ensure the backend is running on port 5000
- Check that the frontend proxy configuration in `vite.config.js` is correct
- Verify that Flask-CORS is properly configured in the backend



