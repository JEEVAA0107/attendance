# SmartAttend Hub - Organized Project Structure

## Project Organization

This project has been reorganized into a clean, modular structure:

```
attendance/
├── frontend/           # React frontend application
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   ├── package.json   # Frontend dependencies
│   └── ...           # Frontend config files
├── backend/           # Backend services and database
│   ├── *.js          # Database scripts
│   ├── *.ts          # TypeScript utilities
│   ├── *.sql         # SQL migrations
│   ├── .env          # Environment variables
│   └── drizzle.config.ts
├── docs/              # Documentation
│   ├── README.md
│   ├── DEPLOYMENT.md
│   └── *.md          # All documentation files
└── .gitignore
```

## Getting Started

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
# Configure your .env file
# Run database migrations
```

## Features

- **Frontend**: React 18 with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Serverless with Neon DB (PostgreSQL)
- **Authentication**: Biometric and role-based access
- **Real-time**: Live attendance monitoring
- **Analytics**: Comprehensive reporting dashboard

## Architecture

- **Serverless Design**: No backend server required
- **Direct Database Operations**: Through Drizzle ORM to Neon DB
- **Role-based Access**: HOD, Faculty, and Student portals
- **Responsive Design**: Works on all devices