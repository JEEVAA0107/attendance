import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_DATABASE_URL);

export const authenticateUser = async (userId) => {
  try {
    const result = await sql`
      SELECT u.biometric_id as user_id, u.role, u.id,
             CASE 
               WHEN u.role = 'student' THEN s.name
               WHEN u.role IN ('faculty', 'hod') THEN f.name
             END as name,
             CASE 
               WHEN u.role = 'student' THEN s.roll_number
               ELSE NULL
             END as roll_number,
             CASE 
               WHEN u.role IN ('faculty', 'hod') THEN f.designation
               ELSE NULL
             END as designation
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id AND u.role = 'student'
      LEFT JOIN faculty f ON u.id = f.user_id AND u.role IN ('faculty', 'hod')
      WHERE u.biometric_id = ${userId}
    `;

    return result[0] || null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};

export const createSession = async (userId) => {
  try {
    await sql`
      INSERT INTO faculty_sessions (user_id, login_time, expires_at)
      VALUES (${userId}, NOW(), NOW() + INTERVAL '7 hours')
      ON CONFLICT (user_id) 
      DO UPDATE SET login_time = NOW(), expires_at = NOW() + INTERVAL '7 hours'
    `;
    return true;
  } catch (error) {
    console.error('Session creation error:', error);
    return false;
  }
};

export const validateSession = async (userId) => {
  try {
    const result = await sql`
      SELECT * FROM faculty_sessions 
      WHERE user_id = ${userId} AND expires_at > NOW()
    `;
    return result.length > 0;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
};

export const getRoleBasedRedirect = (role) => {
  switch (role) {
    case 'student':
      return '/student-dashboard';
    case 'faculty':
      return '/faculty-dashboard';
    case 'hod':
      return '/hod-workspace';
    default:
      return '/login';
  }
};

export const hasAccess = (userRole, requiredRoles) => {
  return requiredRoles.includes(userRole);
};

export const restrictAccess = (userRole, allowedRoles) => {
  if (!userRole || !allowedRoles.includes(userRole)) {
    window.location.href = '/login';
    return false;
  }
  return true;
};