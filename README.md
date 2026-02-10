# Emotion-Aware Journaling Web Application

A full-stack web application that allows users to write journal entries and automatically detects emotions from their text using machine learning. The application consists of three main components: a React frontend, a Flask backend API, and an emotion detection microservice powered by Hugging Face transformers.

## Architecture Overview

┌─────────────────┐     ┌─────────────────┐     ┌──────────────────────────┐
│   Frontend      │────▶│   Backend API   │────▶│ Emotion Detection Service│
│  (React/Vite)   │     │    (Flask)      │     │   (Flask + Transformers) │
│   Port: 3000    │     │   Port: 5000    │     │       Port: 5001         │
└─────────────────┘     └─────────────────┘     └──────────────────────────┘

## Prerequisites

- **Python 3.12+**
- **Node.js 18+** and **npm**
- **Git**

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
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
Edit the .env file with your configuration:


# Flask Settings
FLASK_APP=app.py
FLASK_ENV=dev

# Security - Generate a secure random string
SECRET_KEY=your-secret-key-here

# Database
SQLALCHEMY_DATABASE_URI=sqlite:///app.db
Initialize the database:


# Run database migrations
flask db upgrade
```
