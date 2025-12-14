# SmartAttend Hub - Biometric ID Authentication Guide

## Overview

SmartAttend Hub uses a serverless biometric ID authentication system (not fingerprint-based) with role-based access control for AI&DS department faculty and students.

## Quick Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Add your Neon DB connection string

# 3. Initialize biometric system
node setup-biometric-system.js

# 4. Start development server
npm run dev
```

## Biometric ID Format

**Note**: This system uses unique biometric ID codes, not fingerprint scanning.

- **Faculty/HoD**: `FAC_XXXX` (e.g., FAC_0001)
- **Students**: `STU_XXXX` (e.g., STU_0001)

## Authentication Flow

### 1. Biometric ID Input
```javascript
// Biometric ID authentication (not fingerprint)
const authenticateUser = async (biometricId) => {
  const user = await sql`
    SELECT u.*, 
           CASE 
             WHEN u.role = 'student' THEN s.name
             WHEN u.role IN ('faculty', 'hod') THEN f.name
           END as name
    FROM users u
    LEFT JOIN students s ON u.id = s.user_id
    LEFT JOIN faculty f ON u.id = f.user_id
    WHERE u.biometric_id = ${biometricId}
  `;
  
  return user[0] || null;
};
```

### 2. Role-Based Redirection
- **Students** → `/student-dashboard`
- **Faculty** → `/faculty-dashboard`  
- **HoD** → `/hod-workspace`

## Pre-configured Users

### Faculty Members (14 total)
```
👑 FAC_0001 - Dr. Rajesh Kumar (HOD)
👨🏫 FAC_0002 - Dr. Priya Sharma (Faculty)
👨🏫 FAC_0003 - Prof. Amit Singh (Faculty)
👨🏫 FAC_0004 - Dr. Neha Gupta (Faculty)
👨🏫 FAC_0005 - Prof. Vikram Patel (Faculty)
👨🏫 FAC_0006 - Dr. Sunita Rao (Faculty)
👨🏫 FAC_0007 - Prof. Arjun Mehta (Faculty)
👨🏫 FAC_0008 - Dr. Kavita Joshi (Faculty)
👨🏫 FAC_0009 - Prof. Rohit Agarwal (Faculty)
👨🏫 FAC_0010 - Dr. Meera Nair (Faculty)
👨🏫 FAC_0011 - Prof. Sanjay Verma (Faculty)
👨🏫 FAC_0012 - Dr. Pooja Reddy (Faculty)
👨🏫 FAC_0013 - Prof. Kiran Kumar (Faculty)
👨🏫 FAC_0014 - Dr. Anjali Desai (Faculty)
```

### Sample Students
```
🎓 STU_0001 - Aarav Sharma
🎓 STU_0002 - Diya Patel
🎓 STU_0003 - Arjun Singh
🎓 STU_0004 - Priya Gupta
🎓 STU_0005 - Vikash Kumar
```

## Implementation

### Frontend Integration
```typescript
// components/BiometricAuth.tsx
import { useState } from 'react';
import { authenticateUser } from '@/lib/auth';

export function BiometricAuth() {
  const [biometricId, setBiometricId] = useState('');
  
  const handleAuth = async () => {
    const user = await authenticateUser(biometricId);
    if (user) {
      // Redirect based on role
      window.location.href = `/${user.role}-dashboard`;
    }
  };
  
  return (
    <div className="space-y-4">
      <input 
        value={biometricId}
        onChange={(e) => setBiometricId(e.target.value)}
        placeholder="Enter biometric ID (e.g., FAC_0001)"
      />
      <button onClick={handleAuth}>Authenticate</button>
    </div>
  );
}
```

### Database Schema
```sql
-- Users table with biometric ID authentication (not fingerprint)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  biometric_id VARCHAR(20) UNIQUE NOT NULL, -- Unique ID code, not fingerprint data
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'hod')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty table
CREATE TABLE faculty (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  department VARCHAR(50) DEFAULT 'AI&DS',
  designation VARCHAR(50)
);

-- Students table  
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  roll_number VARCHAR(20) UNIQUE,
  year INTEGER,
  section VARCHAR(10)
);
```

## Security Features

### 7-Hour Precision Logic
```javascript
const validateSession = (lastAuth) => {
  const now = new Date();
  const authTime = new Date(lastAuth);
  const hoursDiff = (now - authTime) / (1000 * 60 * 60);
  
  return hoursDiff <= 7; // Valid for 7 hours
};
```

### Session Management
```javascript
// Create session after successful auth
const createSession = async (userId) => {
  await sql`
    INSERT INTO faculty_sessions (user_id, login_time, expires_at)
    VALUES (${userId}, NOW(), NOW() + INTERVAL '7 hours')
  `;
};
```

## Testing

### Manual Testing
1. Enter any pre-configured biometric ID (e.g., `FAC_0001`) - no fingerprint required
2. System should authenticate and redirect appropriately
3. Verify role-based access control

### Automated Testing
```javascript
// Test biometric ID authentication flow
describe('Biometric ID Authentication', () => {
  test('should authenticate faculty member with ID', async () => {
    const user = await authenticateUser('FAC_0001');
    expect(user.role).toBe('hod');
    expect(user.name).toBe('Dr. Rajesh Kumar');
  });
});
```

## Troubleshooting

### Common Issues

**Invalid Biometric ID**
- Ensure ID follows correct format (`FAC_XXXX` or `STU_XXXX`)
- Check if user exists in database
- Remember: Enter ID manually, no fingerprint scanning required

**Session Expired**
- Sessions expire after 7 hours
- Re-authenticate to create new session

**Database Connection**
- Verify Neon DB connection string in `.env`
- Check network connectivity

### Debug Commands
```bash
# Check database connection
node -e "console.log(process.env.DATABASE_URL)"

# Verify user data
npm run db:query "SELECT * FROM users LIMIT 5"

# Reset biometric system
node setup-biometric-system.js
```

## Production Deployment

### Environment Variables
```env
DATABASE_URL=postgresql://username:password@host/database
BIOMETRIC_TIMEOUT=25200000  # 7 hours in milliseconds
SESSION_SECRET=your-secret-key
```

### Security Considerations
- Use HTTPS in production
- Implement rate limiting for auth attempts
- Add biometric data encryption
- Enable audit logging for all authentication events

## API Endpoints

### Authentication
```
POST /api/auth/biometric-id
Body: { "biometricId": "FAC_0001" }
Response: { "user": {...}, "token": "...", "redirectUrl": "/faculty-dashboard" }
```

### Session Validation
```
GET /api/auth/validate
Headers: { "Authorization": "Bearer <token>" }
Response: { "valid": true, "user": {...} }
```

## Integration with Attendance System

The biometric ID authentication seamlessly integrates with the attendance tracking:

1. **Faculty Login** → Access to mark attendance for their subjects
2. **Student Login** → View personal attendance records
3. **HoD Login** → Complete department oversight and analytics

**Important**: This system uses unique biometric ID codes for authentication, not actual fingerprint or biometric scanning hardware.

For more details on attendance features, see the main README.md file.