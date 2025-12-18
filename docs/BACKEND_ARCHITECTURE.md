# SmartAttend Hub - Backend Architecture & Data Storage

## System Overview

SmartAttend Hub implements a hierarchical role-based access system where:
- **HOD** has complete administrative access to both Faculty and Student portals
- **Faculty** can access and manage Student data within their assigned classes
- **Students** have access to their personal data and class information

## Backend Architecture

### API Structure
```
/api
├── /auth
│   ├── /hod/login
│   ├── /faculty/login
│   └── /student/login
├── /hod
│   ├── /faculty (CRUD operations)
│   ├── /students (CRUD operations)
│   ├── /analytics/department
│   └── /surveillance
├── /faculty
│   ├── /students (assigned classes only)
│   ├── /attendance
│   └── /analytics/class
└── /student
    ├── /profile
    ├── /attendance/view
    └── /requests
```

### Role-Based Access Control

#### HOD Portal Access
- **Faculty Management**: Full CRUD operations on faculty data
- **Student Management**: Complete access to all student records
- **Department Analytics**: System-wide reporting and analytics
- **Surveillance**: Real-time monitoring of faculty and student activities
- **System Configuration**: Manage departments, classes, subjects

#### Faculty Portal Access
- **Assigned Students**: Access only to students in their classes
- **Attendance Management**: Mark and modify attendance for their subjects
- **Class Analytics**: Performance metrics for assigned classes
- **Student Monitoring**: Track student progress and behavior

#### Student Portal Access
- **Personal Profile**: View and update personal information
- **Attendance View**: Read-only access to their attendance records
- **Academic Progress**: View grades and performance metrics
- **Requests**: Submit leave requests, attendance corrections

## Database Schema

### Core Tables

#### 1. Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('hod', 'faculty', 'student') NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Departments Table
```sql
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    hod_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. Faculty Table
```sql
CREATE TABLE faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    designation VARCHAR(50),
    department_id UUID REFERENCES departments(id),
    biometric_id VARCHAR(50) UNIQUE,
    phone VARCHAR(15),
    address TEXT,
    date_of_joining DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. Students Table
```sql
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    roll_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    department_id UUID REFERENCES departments(id),
    batch_year INTEGER NOT NULL,
    semester INTEGER DEFAULT 1,
    class_id UUID REFERENCES classes(id),
    biometric_id VARCHAR(50) UNIQUE,
    phone VARCHAR(15),
    parent_phone VARCHAR(15),
    address TEXT,
    date_of_birth DATE,
    admission_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. Classes Table
```sql
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    department_id UUID REFERENCES departments(id),
    batch_year INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    section VARCHAR(5),
    class_teacher_id UUID REFERENCES faculty(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. Subjects Table
```sql
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    department_id UUID REFERENCES departments(id),
    semester INTEGER NOT NULL,
    credits INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 7. Faculty Subject Assignments
```sql
CREATE TABLE faculty_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES faculty(id),
    subject_id UUID REFERENCES subjects(id),
    class_id UUID REFERENCES classes(id),
    academic_year VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(faculty_id, subject_id, class_id, academic_year)
);
```

#### 8. Attendance Records
```sql
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id),
    subject_id UUID REFERENCES subjects(id),
    faculty_id UUID REFERENCES faculty(id),
    class_id UUID REFERENCES classes(id),
    date DATE NOT NULL,
    time_slot VARCHAR(20),
    status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
    marked_by UUID REFERENCES faculty(id),
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    biometric_verified BOOLEAN DEFAULT false,
    notes TEXT,
    UNIQUE(student_id, subject_id, date, time_slot)
);
```

#### 9. Timetable
```sql
CREATE TABLE timetable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id),
    subject_id UUID REFERENCES subjects(id),
    faculty_id UUID REFERENCES faculty(id),
    day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number VARCHAR(20),
    academic_year VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 10. Leave Requests
```sql
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by UUID REFERENCES faculty(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Data Access Patterns

### HOD Access Patterns
```python
# HOD can access all faculty data
GET /api/hod/faculty
POST /api/hod/faculty
PUT /api/hod/faculty/{id}
DELETE /api/hod/faculty/{id}

# HOD can access all student data
GET /api/hod/students
GET /api/hod/students/department/{dept_id}
POST /api/hod/students
PUT /api/hod/students/{id}

# Department-wide analytics
GET /api/hod/analytics/attendance
GET /api/hod/analytics/performance
GET /api/hod/surveillance/real-time
```

### Faculty Access Patterns
```python
# Faculty can only access assigned students
GET /api/faculty/students/assigned
GET /api/faculty/classes/{class_id}/students

# Attendance management for assigned subjects
POST /api/faculty/attendance/mark
PUT /api/faculty/attendance/{id}
GET /api/faculty/attendance/class/{class_id}

# Class-specific analytics
GET /api/faculty/analytics/class/{class_id}
GET /api/faculty/students/{student_id}/performance
```

### Student Access Patterns
```python
# Personal data access
GET /api/student/profile
PUT /api/student/profile

# Attendance viewing
GET /api/student/attendance
GET /api/student/attendance/summary

# Request submissions
POST /api/student/leave-request
POST /api/student/attendance-correction
GET /api/student/requests
```

## Security Implementation

### Authentication & Authorization
- JWT tokens with role-based claims
- Biometric verification for attendance
- Session management with refresh tokens
- API rate limiting per role

### Data Protection
- Encrypted sensitive data (biometric IDs, personal info)
- Audit trails for all data modifications
- Role-based data filtering at database level
- Secure API endpoints with proper validation