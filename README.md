# Geo Billing Software

A premium Billing and POS solution built with Django (Backend) and React (Frontend).

## Project Structure

- `backend/`: Django REST Framework API with JWT and OTP authentication.
- `frontend/`: React web application with Framer Motion and Tailwind CSS.
- `scripts/`: Utility scripts for system maintenance.

## Getting Started

### 1. Backend Setup (Django)

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv .venv

# Activate the virtual environment
# Windows:
.venv\Scripts\activate
# Unix/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start the development server
python manage.py runserver 0.0.0.0:8000
```

### 2. Frontend Setup (React)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
# Using --legacy-peer-deps to handle React 19 compatibility with some plugins
npm install --legacy-peer-deps

# Start the development application
npm start
```

## Features

- **Owner Portal**: Dashboard, inventory management, and reports.
- **Sales & POS Portal**: Fast billing interface, barcode search, and staff login.
- **Security**: JWT-based session management and OTP-based resets.
- **Support System**: Integrated ticketing & notification system.

## Environment Configuration

Ensure you have `.env` files in both `backend/` and `frontend/` directories with the appropriate configurations (see `.env.example` in respective folders).



