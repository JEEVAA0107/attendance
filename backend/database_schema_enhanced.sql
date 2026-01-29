-- ============================================
-- SMARTATTEND HUB - ENHANCED DATABASE SCHEMA
-- Run in Supabase SQL Editor
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. DROP EXISTING TABLES (if migrating)
-- ============================================
-- Uncomment below ONLY if you need to reset the database
-- DROP TABLE IF EXISTS audit_logs CASCADE;
-- DROP TABLE IF EXISTS login_history CASCADE;
-- DROP TABLE IF EXISTS attendance_predictions CASCADE;
-- DROP TABLE IF EXISTS attendance_anomalies CASCADE;
-- DROP TABLE IF EXISTS daily_analytics CASCADE;
-- DROP TABLE IF EXISTS generated_reports CASCADE;
-- DROP TABLE IF EXISTS messages CASCADE;
-- DROP TABLE IF EXISTS announcements CASCADE;
-- DROP TABLE IF EXISTS notifications CASCADE;
-- DROP TABLE IF EXISTS attendance_corrections CASCADE;
-- DROP TABLE IF EXISTS leave_requests CASCADE;
-- DROP TABLE IF EXISTS attendance_summary CASCADE;
-- DROP TABLE IF EXISTS attendance_records CASCADE;
-- DROP TABLE IF EXISTS attendance_sessions CASCADE;
-- DROP TABLE IF EXISTS timetable CASCADE;
-- DROP TABLE IF EXISTS faculty_assignments CASCADE;
-- DROP TABLE IF EXISTS subjects CASCADE;
-- DROP TABLE IF EXISTS student_profiles CASCADE;
-- DROP TABLE IF EXISTS classes CASCADE;
-- DROP TABLE IF EXISTS faculty_profiles CASCADE;
-- DROP TABLE IF EXISTS hod_profiles CASCADE;
-- DROP TABLE IF EXISTS academic_years CASCADE;
-- DROP TABLE IF EXISTS departments CASCADE;
-- DROP TABLE IF EXISTS institutions CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- 2. CORE TABLES
-- ============================================

-- 2.1 Institutions (Multi-tenant support)
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    address TEXT,
    logo_url TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Departments
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(institution_id, code)
);

-- 2.3 Academic Years
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. USER MANAGEMENT TABLES
-- ============================================

-- 3.1 Users (Authentication) - Works with unique ID instead of hardware biometric
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('super_admin', 'hod', 'faculty', 'student', 'parent')) NOT NULL,
    unique_id VARCHAR(100) UNIQUE, -- Universal unique identifier (replaces biometric)
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMPTZ,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMPTZ,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 HOD Profiles
CREATE TABLE IF NOT EXISTS hod_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    department_id UUID REFERENCES departments(id),
    phone VARCHAR(20),
    profile_picture_url TEXT,
    qualification TEXT,
    specialization TEXT,
    date_of_joining DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 Faculty Profiles
CREATE TABLE IF NOT EXISTS faculty_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    department_id UUID REFERENCES departments(id),
    designation VARCHAR(100),
    phone VARCHAR(20),
    profile_picture_url TEXT,
    qualification TEXT,
    specialization TEXT,
    date_of_joining DATE,
    is_class_teacher BOOLEAN DEFAULT false,
    created_by UUID REFERENCES hod_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 Classes/Sections
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    department_id UUID REFERENCES departments(id),
    batch_year INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    section VARCHAR(10),
    academic_year_id UUID REFERENCES academic_years(id),
    class_teacher_id UUID REFERENCES faculty_profiles(id),
    room_number VARCHAR(50),
    max_students INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5 Student Profiles
CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    department_id UUID REFERENCES departments(id),
    class_id UUID REFERENCES classes(id),
    batch_year INTEGER NOT NULL,
    semester INTEGER DEFAULT 1,
    section VARCHAR(10),
    phone VARCHAR(20),
    parent_phone VARCHAR(20),
    parent_email VARCHAR(255),
    profile_picture_url TEXT,
    date_of_birth DATE,
    address TEXT,
    admission_date DATE,
    blood_group VARCHAR(10),
    emergency_contact TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. ACADEMIC STRUCTURE TABLES
-- ============================================

-- 4.1 Subjects
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    department_id UUID REFERENCES departments(id),
    semester INTEGER NOT NULL,
    credits INTEGER DEFAULT 3,
    subject_type VARCHAR(20) CHECK (subject_type IN ('theory', 'practical', 'elective')) DEFAULT 'theory',
    total_hours INTEGER DEFAULT 45,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.2 Faculty-Subject-Class Assignments
CREATE TABLE IF NOT EXISTS faculty_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id UUID REFERENCES faculty_profiles(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id),
    assigned_by UUID REFERENCES hod_profiles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(faculty_id, subject_id, class_id, academic_year_id)
);

-- 4.3 Timetable
CREATE TABLE IF NOT EXISTS timetable (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES faculty_profiles(id),
    day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7),
    period_number INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number VARCHAR(50),
    academic_year_id UUID REFERENCES academic_years(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. ATTENDANCE TABLES
-- ============================================

-- 5.1 Attendance Sessions
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id),
    subject_id UUID REFERENCES subjects(id),
    faculty_id UUID REFERENCES faculty_profiles(id),
    timetable_id UUID REFERENCES timetable(id),
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    status VARCHAR(20) CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
    total_present INTEGER DEFAULT 0,
    total_absent INTEGER DEFAULT 0,
    total_late INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.2 Attendance Records (with unique ID verification)
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('present', 'absent', 'late', 'excused', 'on_duty')) NOT NULL,
    marked_at TIMESTAMPTZ DEFAULT NOW(),
    marked_by UUID REFERENCES faculty_profiles(id),
    unique_id_verified BOOLEAN DEFAULT false, -- Verified via unique ID
    verification_timestamp TIMESTAMPTZ,
    ip_address VARCHAR(50),
    device_info TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, student_id)
);

-- 5.3 Attendance Summary (Cached for performance)
CREATE TABLE IF NOT EXISTS attendance_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id),
    academic_year_id UUID REFERENCES academic_years(id),
    total_classes INTEGER DEFAULT 0,
    classes_attended INTEGER DEFAULT 0,
    classes_absent INTEGER DEFAULT 0,
    classes_late INTEGER DEFAULT 0,
    attendance_percentage DECIMAL(5, 2) DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, subject_id, academic_year_id)
);

-- ============================================
-- 6. REQUEST & APPROVAL TABLES
-- ============================================

-- 6.1 Leave Requests
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) CHECK (leave_type IN ('sick', 'personal', 'emergency', 'academic', 'other')) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    supporting_document_url TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending',
    reviewed_by UUID REFERENCES faculty_profiles(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6.2 Attendance Correction Requests
CREATE TABLE IF NOT EXISTS attendance_corrections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attendance_id UUID REFERENCES attendance_records(id),
    student_id UUID REFERENCES student_profiles(id),
    session_id UUID REFERENCES attendance_sessions(id),
    original_status VARCHAR(20),
    requested_status VARCHAR(20),
    reason TEXT NOT NULL,
    supporting_document_url TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    reviewed_by UUID REFERENCES faculty_profiles(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. NOTIFICATION & COMMUNICATION TABLES
-- ============================================

-- 7.1 Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) CHECK (type IN ('info', 'warning', 'success', 'error', 'attendance', 'request', 'announcement', 'sms')) NOT NULL,
    priority VARCHAR(10) CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    sms_sent BOOLEAN DEFAULT false, -- Track if SMS was sent
    sms_sent_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7.2 SMS Queue (for async SMS sending)
CREATE TABLE IF NOT EXISTS sms_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    notification_id UUID REFERENCES notifications(id),
    status VARCHAR(20) CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')) DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7.3 Announcements
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_by UUID REFERENCES users(id),
    target_audience TEXT[], -- ['all', 'faculty', 'students', 'class:uuid']
    department_id UUID REFERENCES departments(id),
    class_id UUID REFERENCES classes(id),
    priority VARCHAR(10) CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
    is_pinned BOOLEAN DEFAULT false,
    publish_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7.4 Messages (Direct communication)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES users(id),
    recipient_id UUID REFERENCES users(id),
    subject VARCHAR(200),
    content TEXT NOT NULL,
    parent_message_id UUID REFERENCES messages(id),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. ANALYTICS & REPORTS TABLES
-- ============================================

-- 8.1 Daily Analytics (Cached stats)
CREATE TABLE IF NOT EXISTS daily_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    department_id UUID REFERENCES departments(id),
    class_id UUID REFERENCES classes(id),
    subject_id UUID REFERENCES subjects(id),
    total_students INTEGER DEFAULT 0,
    present_count INTEGER DEFAULT 0,
    absent_count INTEGER DEFAULT 0,
    late_count INTEGER DEFAULT 0,
    attendance_rate DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, class_id, subject_id)
);

-- 8.2 Generated Reports
CREATE TABLE IF NOT EXISTS generated_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    generated_by UUID REFERENCES users(id),
    report_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    parameters JSONB NOT NULL,
    file_url TEXT,
    file_format VARCHAR(10) CHECK (file_format IN ('pdf', 'xlsx', 'csv')),
    status VARCHAR(20) CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. AUDIT & LOGGING TABLES
-- ============================================

-- 9.1 Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9.2 Login History
CREATE TABLE IF NOT EXISTS login_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    login_at TIMESTAMPTZ DEFAULT NOW(),
    logout_at TIMESTAMPTZ,
    ip_address VARCHAR(50),
    device_info TEXT,
    location TEXT,
    status VARCHAR(20) CHECK (status IN ('success', 'failed', 'blocked')) DEFAULT 'success'
);

-- ============================================
-- 10. AI/ML FEATURE TABLES
-- ============================================

-- 10.1 Attendance Predictions
CREATE TABLE IF NOT EXISTS attendance_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id),
    subject_id UUID REFERENCES subjects(id),
    prediction_date DATE NOT NULL,
    predicted_probability DECIMAL(5, 4),
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    contributing_factors JSONB,
    is_accurate BOOLEAN, -- Updated after actual attendance
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10.2 Anomaly Detection Logs
CREATE TABLE IF NOT EXISTS attendance_anomalies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    anomaly_type VARCHAR(50) NOT NULL,
    affected_entity_type VARCHAR(50),
    affected_entity_id UUID,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    details JSONB,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT
);

-- ============================================
-- 11. PERFORMANCE INDEXES
-- ============================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_unique_id ON users(unique_id);

-- Profiles
CREATE INDEX IF NOT EXISTS idx_hod_department ON hod_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_faculty_department ON faculty_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_student_department ON student_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_student_class ON student_profiles(class_id);

-- Attendance
CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_session_date ON attendance_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_session_faculty ON attendance_sessions(faculty_id);
CREATE INDEX IF NOT EXISTS idx_session_class ON attendance_sessions(class_id);

-- Summary
CREATE INDEX IF NOT EXISTS idx_summary_student ON attendance_summary(student_id);
CREATE INDEX IF NOT EXISTS idx_summary_subject ON attendance_summary(subject_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_id, is_read) WHERE is_read = false;

-- SMS Queue
CREATE INDEX IF NOT EXISTS idx_sms_pending ON sms_queue(status) WHERE status = 'pending';

-- Audit
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- Analytics
CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON daily_analytics(date);
CREATE INDEX IF NOT EXISTS idx_daily_analytics_class ON daily_analytics(class_id);

-- ============================================
-- 12. FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Update timestamp on modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to relevant tables
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_hod_updated_at BEFORE UPDATE ON hod_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_faculty_updated_at BEFORE UPDATE ON faculty_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_student_updated_at BEFORE UPDATE ON student_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_classes_updated_at BEFORE UPDATE ON classes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_attendance_session_updated_at BEFORE UPDATE ON attendance_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_attendance_record_updated_at BEFORE UPDATE ON attendance_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Update attendance summary after record change
CREATE OR REPLACE FUNCTION update_attendance_summary()
RETURNS TRIGGER AS $$
DECLARE
    v_subject_id UUID;
    v_academic_year_id UUID;
BEGIN
    -- Get subject and academic year from session
    SELECT subject_id, 
           (SELECT academic_year_id FROM classes WHERE id = s.class_id)
    INTO v_subject_id, v_academic_year_id
    FROM attendance_sessions s
    WHERE s.id = NEW.session_id;

    -- Upsert attendance summary
    INSERT INTO attendance_summary (
        student_id, subject_id, academic_year_id, 
        total_classes, classes_attended, classes_absent, classes_late, 
        attendance_percentage, last_updated
    )
    SELECT 
        NEW.student_id,
        v_subject_id,
        v_academic_year_id,
        COUNT(*),
        COUNT(*) FILTER (WHERE ar.status = 'present'),
        COUNT(*) FILTER (WHERE ar.status = 'absent'),
        COUNT(*) FILTER (WHERE ar.status = 'late'),
        CASE WHEN COUNT(*) > 0 
             THEN ROUND((COUNT(*) FILTER (WHERE ar.status IN ('present', 'late'))::decimal / COUNT(*)::decimal) * 100, 2)
             ELSE 0 
        END,
        NOW()
    FROM attendance_records ar
    JOIN attendance_sessions s ON ar.session_id = s.id
    WHERE ar.student_id = NEW.student_id
      AND s.subject_id = v_subject_id
    GROUP BY ar.student_id
    ON CONFLICT (student_id, subject_id, academic_year_id) 
    DO UPDATE SET 
        total_classes = EXCLUDED.total_classes,
        classes_attended = EXCLUDED.classes_attended,
        classes_absent = EXCLUDED.classes_absent,
        classes_late = EXCLUDED.classes_late,
        attendance_percentage = EXCLUDED.attendance_percentage,
        last_updated = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_attendance_summary
AFTER INSERT OR UPDATE ON attendance_records
FOR EACH ROW EXECUTE FUNCTION update_attendance_summary();

-- Function: Update session totals
CREATE OR REPLACE FUNCTION update_session_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE attendance_sessions
    SET 
        total_present = (SELECT COUNT(*) FROM attendance_records WHERE session_id = NEW.session_id AND status = 'present'),
        total_absent = (SELECT COUNT(*) FROM attendance_records WHERE session_id = NEW.session_id AND status = 'absent'),
        total_late = (SELECT COUNT(*) FROM attendance_records WHERE session_id = NEW.session_id AND status = 'late')
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_session_totals
AFTER INSERT OR UPDATE ON attendance_records
FOR EACH ROW EXECUTE FUNCTION update_session_totals();

-- Function: Create low attendance notification
CREATE OR REPLACE FUNCTION check_low_attendance_alert()
RETURNS TRIGGER AS $$
BEGIN
    -- Create notification if attendance drops below 75%
    IF NEW.attendance_percentage < 75 AND (OLD.attendance_percentage IS NULL OR OLD.attendance_percentage >= 75) THEN
        -- Notify student
        INSERT INTO notifications (recipient_id, title, message, type, priority)
        SELECT 
            sp.user_id,
            'Low Attendance Alert',
            'Your attendance in ' || sub.name || ' is ' || NEW.attendance_percentage || '% (below 75%)',
            'warning',
            'high'
        FROM student_profiles sp
        JOIN subjects sub ON sub.id = NEW.subject_id
        WHERE sp.id = NEW.student_id;
        
        -- Queue SMS to parent
        INSERT INTO sms_queue (phone_number, message, status)
        SELECT 
            sp.parent_phone,
            'Alert: ' || sp.name || '''s attendance in ' || sub.name || ' is ' || NEW.attendance_percentage || '%. Please contact the college.',
            'pending'
        FROM student_profiles sp
        JOIN subjects sub ON sub.id = NEW.subject_id
        WHERE sp.id = NEW.student_id
          AND sp.parent_phone IS NOT NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_low_attendance_alert
AFTER INSERT OR UPDATE ON attendance_summary
FOR EACH ROW EXECUTE FUNCTION check_low_attendance_alert();

-- Function: Update daily analytics
CREATE OR REPLACE FUNCTION update_daily_analytics()
RETURNS TRIGGER AS $$
DECLARE
    v_date DATE;
    v_class_id UUID;
    v_subject_id UUID;
    v_department_id UUID;
BEGIN
    SELECT session_date, class_id, subject_id INTO v_date, v_class_id, v_subject_id
    FROM attendance_sessions WHERE id = NEW.session_id;
    
    SELECT department_id INTO v_department_id FROM classes WHERE id = v_class_id;

    INSERT INTO daily_analytics (
        date, department_id, class_id, subject_id,
        total_students, present_count, absent_count, late_count, attendance_rate
    )
    SELECT 
        v_date,
        v_department_id,
        v_class_id,
        v_subject_id,
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'present'),
        COUNT(*) FILTER (WHERE status = 'absent'),
        COUNT(*) FILTER (WHERE status = 'late'),
        CASE WHEN COUNT(*) > 0 
             THEN ROUND((COUNT(*) FILTER (WHERE status = 'present')::decimal / COUNT(*)::decimal) * 100, 2)
             ELSE 0 
        END
    FROM attendance_records
    WHERE session_id = NEW.session_id
    ON CONFLICT (date, class_id, subject_id) 
    DO UPDATE SET 
        total_students = EXCLUDED.total_students,
        present_count = EXCLUDED.present_count,
        absent_count = EXCLUDED.absent_count,
        late_count = EXCLUDED.late_count,
        attendance_rate = EXCLUDED.attendance_rate;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_daily_analytics
AFTER INSERT OR UPDATE ON attendance_records
FOR EACH ROW EXECUTE FUNCTION update_daily_analytics();

-- ============================================
-- 13. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hod_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_corrections ENABLE ROW LEVEL SECURITY;

-- RLS Policies will be applied via Supabase dashboard or additional migration
-- as they require auth.uid() which depends on Supabase Auth setup

-- ============================================
-- 14. SEED DATA
-- ============================================

-- Insert default institution
INSERT INTO institutions (name, code, address) 
VALUES ('SmartAttend College', 'SAC001', 'Main Campus')
ON CONFLICT (code) DO NOTHING;

-- Insert default department
INSERT INTO departments (institution_id, name, code, description)
SELECT id, 'Computer Science', 'CS', 'Department of Computer Science'
FROM institutions WHERE code = 'SAC001'
ON CONFLICT DO NOTHING;

-- Insert default academic year
INSERT INTO academic_years (institution_id, name, start_date, end_date, is_current)
SELECT id, '2025-2026', '2025-06-01', '2026-05-31', true
FROM institutions WHERE code = 'SAC001'
ON CONFLICT DO NOTHING;

-- Create default HOD user (password: hod123)
INSERT INTO users (email, password_hash, role, unique_id)
VALUES ('hod@smartattend.edu', crypt('hod123', gen_salt('bf')), 'hod', 'HOD001')
ON CONFLICT (email) DO NOTHING;

-- Create HOD profile
INSERT INTO hod_profiles (user_id, employee_id, name, department_id, phone)
SELECT 
    u.id,
    'EMP001',
    'Dr. John Smith',
    d.id,
    '+919876543210'
FROM users u
CROSS JOIN departments d
WHERE u.email = 'hod@smartattend.edu' AND d.code = 'CS'
ON CONFLICT DO NOTHING;

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'SmartAttend Hub database schema created successfully!';
    RAISE NOTICE 'Default HOD login: hod@smartattend.edu / hod123';
END $$;
