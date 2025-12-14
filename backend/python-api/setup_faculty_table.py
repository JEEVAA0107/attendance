from app.database import supabase

def setup_faculty_table():
    try:
        # Test if faculty table exists
        result = supabase.table('faculty').select('*').limit(1).execute()
        print("Faculty table already exists")
    except Exception as e:
        print(f"Faculty table doesn't exist: {e}")
        print("Please create the faculty table in Supabase SQL Editor:")
        print("""
CREATE TABLE IF NOT EXISTS public.faculty (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    biometric_id VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL DEFAULT 'AI&DS',
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
        """)

if __name__ == "__main__":
    setup_faculty_table()