# Modern Library Management System (Flask + React)

This project has been modernized and decoupled from a legacy Django/SQLite monolith into a RESTful Flask backend and a ReactJS SPA frontend.

## 1. Backend Setup

The backend uses Flask, SQLAlchemy (configured for PostgreSQL but defaults to SQLite locally), and PyJWT.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Initialize the database and Superuser:
   ```bash
   python init_db.py
   ```
5. Run the server:
   ```bash
   python app.py
   ```
   *The server runs on http://localhost:5000*

## 2. Frontend Setup

The frontend uses React (Vite plugin), TailwindCSS, React-Router, and Axios.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The application will dynamically proxy to port `5000` via Axios base URL setup. Start the application by navigating to the address Vite provides.*

## 3. Administrator Credentials
- **Username:** `admin_lms` / **Email:** `admin@library.local`
- **Password:** `AdminSecure2026!`

*(These were generated per the PRD via `backend/init_db.py`)*
