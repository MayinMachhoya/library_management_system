
# Modern Library Management System

A full-stack web application built for seamless library operations. This project features a **RESTful Python/Flask backend** and a **ReactJS SPA frontend**, fully optimized for serverless deployment and high-performance database interactions.

**[ 🔗 Live Demo Link ](https://library-management-system-omega-eosin.vercel.app)**

---

## 🏗️ Architecture & Tech Stack

### **Frontend**
* **ReactJS (Vite):** Powering a fast, responsive Single Page Application (SPA).
* **Tailwind CSS:** For a minimalist, professional, and "classy" user interface.
* **React Router:** For client-side navigation and protected route management.
* **Axios:** Handling asynchronous API communication with JWT authentication.

### **Backend**
* **Flask (Python):** A lightweight, modular REST API using **Blueprints** for organized routing.
* **PostgreSQL (NeonDB):** A serverless relational database for robust data persistence.
* **SQLAlchemy ORM:** For clean, Pythonic database modeling and migrations.
* **PyJWT:** Implementing secure, stateless authentication for Librarians and Students.
* **CORS:** Configured via Vercel Edge Headers for secure cross-origin resource sharing.

---

## 🚀 Key Features

* **Dual Dashboard System:** Tailored interfaces for Librarians (Admin) and Students.
* **JWT Authentication:** Secure login and registration with token-based access control.
* **Dynamic Inventory:** Full CRUD operations for book management including status tracking (Available/Issued).
* **Circulation Logic:** Automated handling of book issues and returns with borrowing history.
* **SPA Routing Fix:** Implemented Vercel rewrites to ensure seamless page refreshes on React Router paths.

---

## 🛠️ Installation & Setup

### **Backend Setup**
1. Navigate to the `/backend` directory.
2. Create a virtual environment: `python -m venv venv`.
3. Install dependencies: `pip install -r requirements.txt`.
4. Configure your `.env` with your `DATABASE_URL` and `SECRET_KEY`.
5. Run locally: `python app.py`.

### **Frontend Setup**
1. Navigate to the `/frontend` directory.
2. Install dependencies: `npm install`.
3. Configure `VITE_API_BASE_URL` in your `.env`.
4. Run locally: `npm run dev`.

---

## ☁️ Deployment

The application is hosted on **Vercel** using a dual-project CI/CD pipeline:
* **Backend:** Deployed as a Serverless Function using the `@vercel/python` runtime.
* **Frontend:** Deployed as a static Vite build with custom rewrites for React Router support.

---

## 👨‍💻 Author

**Mayin Machhoya**
* Computer Engineering Graduate | Web Developer
* [GitHub](https://github.com/MayinMachhoya)
* [LinkedIn](https://www.linkedin.com/in/mayin-machhoya/)

