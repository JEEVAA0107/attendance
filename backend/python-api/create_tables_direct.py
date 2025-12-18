import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def create_tables():
    """Create tables using direct SQL execution"""
    
    tables = [
        # Users table
        """
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) CHECK (role IN ('hod', 'faculty', 'student')) NOT NULL,
            name VARCHAR(100),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        
        # Departments table
        """
        CREATE TABLE IF NOT EXISTS departments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL,
            code VARCHAR(10) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        
        # HOD table
        """
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
        """,
        
        # Faculty table  
        """
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
        """,
        
        # Classes table
        """
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
        """,
        
        # Students table
        """
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
        """,
        
        # Subjects table
        """
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
        """,
        
        # Attendance table
        """
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
            notes TEXT
        );
        """
    ]
    
    for i, sql in enumerate(tables, 1):
        try:
            print(f"Creating table {i}...")
            # Use direct table operations instead of RPC
            # This is a workaround - you'll need to run these SQL commands directly in Supabase SQL editor
            print(f"SQL: {sql}")
        except Exception as e:
            print(f"Error creating table {i}: {e}")
    
    print("\nPlease run these SQL commands in your Supabase SQL Editor:")
    for i, sql in enumerate(tables, 1):
        print(f"\n-- Table {i}")
        print(sql)

if __name__ == "__main__":
    create_tables()