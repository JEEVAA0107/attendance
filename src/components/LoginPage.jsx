import { useState } from 'react';
import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_DATABASE_URL);

function LoginPage() {
  const [userId, setUserId] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const authenticateUser = async () => {
    if (!userId.trim()) {
      setError('Please enter ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await sql`
        SELECT u.biometric_id as user_id, u.role,
               CASE 
                 WHEN u.role = 'student' THEN s.name
                 WHEN u.role IN ('faculty', 'hod') THEN f.name
               END as name,
               CASE 
                 WHEN u.role = 'student' THEN s.roll_number
                 ELSE NULL
               END as roll_number
        FROM users u
        LEFT JOIN students s ON u.id = s.user_id AND u.role = 'student'
        LEFT JOIN faculty f ON u.id = f.user_id AND u.role IN ('faculty', 'hod')
        WHERE u.biometric_id = ${userId}
      `;

      if (result.length === 0) {
        setError('Invalid ID');
        return;
      }

      const userData = result[0];
      setUser(userData);

      setTimeout(() => {
        if (userData.role === 'student') {
          window.location.href = '/student-dashboard';
        } else if (userData.role === 'faculty') {
          window.location.href = '/faculty-dashboard';
        } else if (userData.role === 'hod') {
          window.location.href = '/hod-workspace';
        }
      }, 2000);

    } catch (err) {
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        
        {!user ? (
          <div className="text-center">
            {/* Header */}
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">SmartAttend Hub</h1>
            <p className="text-gray-500 mb-8">Login with your ID</p>
            
            {/* Login Form */}
            <div className="space-y-6">
              <div>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && authenticateUser()}
                  placeholder="Enter your ID (e.g., 10521, STU_001)"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg"
                  disabled={loading}
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-center">
                  {error}
                </div>
              )}

              <button
                onClick={authenticateUser}
                disabled={loading || !userId.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-4 px-4 rounded-xl transition-colors"
              >
                {loading ? 'Authenticating...' : 'Login'}
              </button>
            </div>
            
            {/* Supported Roles */}
            <div className="bg-gray-50 rounded-2xl p-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Supported Roles</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">👑</span>
                  </div>
                  <div className="text-sm font-medium text-gray-700">HoD</div>
                  <div className="text-xs text-gray-500">Workspace</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">👨🏫</span>
                  </div>
                  <div className="text-sm font-medium text-gray-700">Faculty</div>
                  <div className="text-xs text-gray-500">Dashboard</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <div className="text-sm font-medium text-gray-700">Student</div>
                  <div className="text-xs text-gray-500">Portal</div>
                </div>
              </div>
            </div>

            {/* Sample IDs */}
            <div className="mt-6 text-xs text-gray-500 space-y-1">
              <p>Sample IDs for testing:</p>
              <p>HoD: 10521 | Faculty: 10528, 10533 | Students: STU_001, STU_002</p>
            </div>
          </div>
        ) : (
          /* Success State */
          <div className="text-center space-y-6">
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
              <div className="text-6xl mb-4">
                {user.role === 'hod' ? '👑' : user.role === 'faculty' ? '👨🏫' : '🎓'}
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Welcome, {user.name}!
              </h2>
              
              <div className="space-y-2 text-gray-600">
                <p><strong>ID:</strong> {user.user_id}</p>
                <p><strong>Role:</strong> {user.role.toUpperCase()}</p>
                {user.roll_number && (
                  <p><strong>Roll Number:</strong> {user.roll_number}</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
              <p className="text-blue-700">
                Redirecting to {user.role === 'hod' ? 'HoD Workspace' : 
                              user.role === 'faculty' ? 'Faculty Dashboard' : 
                              'Student Portal'}...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;