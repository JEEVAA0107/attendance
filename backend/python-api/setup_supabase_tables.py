from app.database import supabase

def create_tables():
    """Create all required tables in Supabase"""
    
    # 1. Users table
    supabase.rpc('execute_sql', {
        'sql': '''
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) CHECK (role IN ('hod', 'faculty', 'student')) NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        '''
    }).execute()
    
    # 2. Departments table
    supabase.rpc('execute_sql', {
        'sql': '''
        CREATE TABLE IF NOT EXISTS departments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL,
            code VARCHAR(10) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        '''
    }).execute()
    
    # 3. HOD table
    supabase.rpc('execute_sql', {
        'sql': '''
        CREATE TABLE IF NOT EXISTS hod (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            employee_id VARCHAR(20) UNIQUE NOT NULL,
            name VARCHAR(100) NOT NULL,
            department_id UUID REFERENCES departments(id),
            biometric_id VARCHAR(50) UNIQUE,
            phone VARCHAR(15),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        '''
    }).execute()
    
    # 4. Faculty table
    supabase.rpc('execute_sql', {
        'sql': '''
        CREATE TABLE IF NOT EXISTS faculty (
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
        '''
    }).execute()
    
    # 5. Classes table
    supabase.rpc('execute_sql', {
        'sql': '''
        CREATE TABLE IF NOT EXISTS classes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(50) NOT NULL,
            department_id UUID REFERENCES departments(id),
            batch_year INTEGER NOT NULL,
            semester INTEGER NOT NULL,
            section VARCHAR(5),
            class_teacher_id UUID REFERENCES faculty(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        '''
    }).execute()
    
    # 6. Students table
    supabase.rpc('execute_sql', {
        'sql': '''
        CREATE TABLE IF NOT EXISTS students (
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
        '''
    }).execute()
    
    # 7. Subjects table
    supabase.rpc('execute_sql', {
        'sql': '''
        CREATE TABLE IF NOT EXISTS subjects (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL,
            code VARCHAR(20) UNIQUE NOT NULL,
            department_id UUID REFERENCES departments(id),
            semester INTEGER NOT NULL,
            credits INTEGER DEFAULT 3,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        '''
    }).execute()
    
    # 8. Faculty subjects assignments
    supabase.rpc('execute_sql', {
        'sql': '''
        CREATE TABLE IF NOT EXISTS faculty_subjects (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            faculty_id UUID REFERENCES faculty(id),
            subject_id UUID REFERENCES subjects(id),
            class_id UUID REFERENCES classes(id),
            academic_year VARCHAR(10),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(faculty_id, subject_id, class_id, academic_year)
        );
        '''
    }).execute()
    
    # 9. Attendance table
    supabase.rpc('execute_sql', {
        'sql': '''
        CREATE TABLE IF NOT EXISTS attendance (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            student_id UUID REFERENCES students(id),
            subject_id UUID REFERENCES subjects(id),
            faculty_id UUID REFERENCES faculty(id),
            class_id UUID REFERENCES classes(id),
            date DATE NOT NULL,
            time_slot VARCHAR(20),
            status VARCHAR(20) CHECK (status IN ('present', 'absent', 'late', 'excused')) NOT NULL,
            marked_by UUID REFERENCES faculty(id),
            marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            biometric_verified BOOLEAN DEFAULT false,
            notes TEXT,
            UNIQUE(student_id, subject_id, date, time_slot)
        );
        '''
    }).execute()
    
    print("All tables created successfully!")

if __name__ == "__main__":
    create_tables()