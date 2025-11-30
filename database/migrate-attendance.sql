-- Add new columns to attendance_records
ALTER TABLE attendance_records 
ADD COLUMN IF NOT EXISTS total_hours DECIMAL(4,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_full_day BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS computed_by VARCHAR(50) DEFAULT 'system',
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create faculty table with biometric authentication
CREATE TABLE IF NOT EXISTS faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    biometric_id VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    batch VARCHAR(10),
    faculty_id UUID REFERENCES faculty(id),
    credits INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create timetable table for faculty-subject-period mapping
CREATE TABLE IF NOT EXISTS timetable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES faculty(id),
    batch VARCHAR(10) NOT NULL,
    day_of_week INTEGER NOT NULL, -- 1-7 (Monday-Sunday)
    period INTEGER NOT NULL, -- 1-7
    start_time VARCHAR(10),
    end_time VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create attendance_logs table with faculty tracking
CREATE TABLE IF NOT EXISTS attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES faculty(id),
    user_id VARCHAR(255) NOT NULL,
    attendance_date DATE NOT NULL,
    period INTEGER NOT NULL,
    is_present BOOLEAN DEFAULT false,
    hours DECIMAL(3,2) DEFAULT 1,
    marked_by UUID REFERENCES faculty(id),
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_modified BOOLEAN DEFAULT false,
    modified_by UUID REFERENCES faculty(id),
    modified_at TIMESTAMP,
    approved_by UUID REFERENCES faculty(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, subject_id, attendance_date, period)
);

-- Create faculty_sessions table for biometric authentication
CREATE TABLE IF NOT EXISTS faculty_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    biometric_id VARCHAR(50) NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    ip_address VARCHAR(45),
    user_agent TEXT
);



-- Create attendance_reports table
CREATE TABLE IF NOT EXISTS attendance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    report_date DATE NOT NULL,
    batch VARCHAR(10),
    department VARCHAR(100),
    total_students INTEGER DEFAULT 0,
    present_students INTEGER DEFAULT 0,
    absent_students INTEGER DEFAULT 0,
    attendance_percentage DECIMAL(5,2) DEFAULT 0,
    report_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create optimized indexes for Neon DB performance
CREATE INDEX IF NOT EXISTS idx_faculty_user_id ON faculty(user_id);
CREATE INDEX IF NOT EXISTS idx_faculty_biometric ON faculty(biometric_id);
CREATE INDEX IF NOT EXISTS idx_faculty_department ON faculty(department);
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON subjects(code);
CREATE INDEX IF NOT EXISTS idx_subjects_faculty ON subjects(faculty_id);
CREATE INDEX IF NOT EXISTS idx_timetable_user_id ON timetable(user_id);
CREATE INDEX IF NOT EXISTS idx_timetable_subject ON timetable(subject_id);
CREATE INDEX IF NOT EXISTS idx_timetable_faculty ON timetable(faculty_id);
CREATE INDEX IF NOT EXISTS idx_timetable_schedule ON timetable(batch, day_of_week, period);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_student ON attendance_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_subject ON attendance_logs(subject_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_faculty ON attendance_logs(faculty_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_date ON attendance_logs(attendance_date);
CREATE INDEX IF NOT EXISTS idx_faculty_sessions_faculty ON faculty_sessions(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_sessions_token ON faculty_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_faculty_sessions_biometric ON faculty_sessions(biometric_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON attendance_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON attendance_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_date ON attendance_reports(report_date);

-- Enable Row Level Security (RLS) for faculty access control
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for faculty access
CREATE POLICY faculty_own_data ON faculty FOR ALL USING (user_id = current_setting('app.current_user_id'));
CREATE POLICY faculty_own_subjects ON subjects FOR ALL USING (faculty_id = current_setting('app.current_faculty_id')::UUID OR user_id = current_setting('app.current_user_id'));
CREATE POLICY faculty_own_timetable ON timetable FOR ALL USING (faculty_id = current_setting('app.current_faculty_id')::UUID OR user_id = current_setting('app.current_user_id'));
CREATE POLICY faculty_own_logs ON attendance_logs FOR ALL USING (faculty_id = current_setting('app.current_faculty_id')::UUID OR user_id = current_setting('app.current_user_id'));