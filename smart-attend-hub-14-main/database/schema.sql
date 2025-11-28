-- SmartAttend Hub Database Schema
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS students CASCADE;

-- Students table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    roll_no VARCHAR(50) NOT NULL,
    reg_no VARCHAR(50),
    email VARCHAR(255),
    phone VARCHAR(20),
    parent_phone VARCHAR(20),
    department VARCHAR(100),
    batch VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance records table
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    attendance_date DATE NOT NULL,
    batch VARCHAR(10),
    period1 BOOLEAN DEFAULT FALSE,
    period2 BOOLEAN DEFAULT FALSE,
    period3 BOOLEAN DEFAULT FALSE,
    period4 BOOLEAN DEFAULT FALSE,
    period5 BOOLEAN DEFAULT FALSE,
    period6 BOOLEAN DEFAULT FALSE,
    period7 BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, attendance_date)
);

-- Indexes
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_roll_no ON students(roll_no);
CREATE INDEX idx_attendance_student_id ON attendance_records(student_id);
CREATE INDEX idx_attendance_date ON attendance_records(attendance_date);

-- Sample data
INSERT INTO students (user_id, name, roll_no, reg_no, email, phone, parent_phone, department, batch) VALUES
('test-user-1', 'AABIYA AMRIN S', '122UAD001', '221161001', 'aabiya@example.com', '9790121985', '9876543210', 'Computer Science', '2024');