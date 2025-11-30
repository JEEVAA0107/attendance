-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  biometric_id VARCHAR(20) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'hod')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create faculty table
CREATE TABLE IF NOT EXISTS faculty (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  department VARCHAR(50) DEFAULT 'AI&DS',
  designation VARCHAR(50)
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  roll_number VARCHAR(20) UNIQUE,
  year INTEGER,
  section VARCHAR(10)
);

-- Create faculty_sessions table
CREATE TABLE IF NOT EXISTS faculty_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  UNIQUE(user_id)
);

-- Insert HoD
INSERT INTO users (biometric_id, role) VALUES ('FAC_0001', 'hod') ON CONFLICT (biometric_id) DO NOTHING;
INSERT INTO faculty (user_id, name, designation) 
SELECT id, 'Dr. Rajesh Kumar', 'Head of Department' FROM users WHERE biometric_id = 'FAC_0001' AND NOT EXISTS (SELECT 1 FROM faculty WHERE user_id = users.id);

-- Insert Faculty members
INSERT INTO users (biometric_id, role) VALUES 
('FAC_0002', 'faculty'), ('FAC_0003', 'faculty'), ('FAC_0004', 'faculty'), ('FAC_0005', 'faculty'),
('FAC_0006', 'faculty'), ('FAC_0007', 'faculty'), ('FAC_0008', 'faculty'), ('FAC_0009', 'faculty'),
('FAC_0010', 'faculty'), ('FAC_0011', 'faculty'), ('FAC_0012', 'faculty'), ('FAC_0013', 'faculty'),
('FAC_0014', 'faculty')
ON CONFLICT (biometric_id) DO NOTHING;

INSERT INTO faculty (user_id, name, designation) 
SELECT u.id, f.name, 'Assistant Professor' FROM users u
CROSS JOIN (VALUES 
  ('FAC_0002', 'Dr. Priya Sharma'), ('FAC_0003', 'Prof. Amit Singh'), ('FAC_0004', 'Dr. Neha Gupta'),
  ('FAC_0005', 'Prof. Vikram Patel'), ('FAC_0006', 'Dr. Sunita Rao'), ('FAC_0007', 'Prof. Arjun Mehta'),
  ('FAC_0008', 'Dr. Kavita Joshi'), ('FAC_0009', 'Prof. Rohit Agarwal'), ('FAC_0010', 'Dr. Meera Nair'),
  ('FAC_0011', 'Prof. Sanjay Verma'), ('FAC_0012', 'Dr. Pooja Reddy'), ('FAC_0013', 'Prof. Kiran Kumar'),
  ('FAC_0014', 'Dr. Anjali Desai')
) f(biometric_id, name)
WHERE u.biometric_id = f.biometric_id AND NOT EXISTS (SELECT 1 FROM faculty WHERE user_id = u.id);

-- Insert Students
INSERT INTO users (biometric_id, role) VALUES 
('STU_0001', 'student'), ('STU_0002', 'student'), ('STU_0003', 'student'), 
('STU_0004', 'student'), ('STU_0005', 'student')
ON CONFLICT (biometric_id) DO NOTHING;

INSERT INTO students (user_id, name, roll_number, year, section) 
SELECT u.id, s.name, s.roll_number, 3, 'A' FROM users u
CROSS JOIN (VALUES 
  ('STU_0001', 'Aarav Sharma', '21AI001'), ('STU_0002', 'Diya Patel', '21AI002'), 
  ('STU_0003', 'Arjun Singh', '21AI003'), ('STU_0004', 'Priya Gupta', '21AI004'),
  ('STU_0005', 'Vikash Kumar', '21AI005')
) s(biometric_id, name, roll_number)
WHERE u.biometric_id = s.biometric_id AND NOT EXISTS (SELECT 1 FROM students WHERE user_id = u.id);