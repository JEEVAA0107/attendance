# SmartAttend Hub Backend

Flask backend for the SmartAttend Hub attendance management system.

## Setup

1. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Linux/Mac
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python app.py
```

## API Endpoints

- `GET /api/students` - Get all students
- `POST /api/students` - Add new student
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance

## Environment Variables

Create a `.env` file with:
- `DATABASE_URL` - PostgreSQL connection string
- `FLASK_ENV` - development/production
- `FLASK_DEBUG` - True/False