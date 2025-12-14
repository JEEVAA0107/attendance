import React, { createContext, useContext, useState, useCallback } from 'react';

interface AuthResult {
  success: boolean;
  error?: string;
  user?: { name: string; role: string; id: string };
  redirectPath?: string;
}

interface AuthContextType {
  user: { email: string; uid: string; role?: string; name?: string; authId?: string } | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithId: (name: string, id: string, role: 'student' | 'faculty' | 'hod') => Promise<AuthResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ email: string; uid: string; role?: string; name?: string; authId?: string } | null>(() => {
    const saved = localStorage.getItem('smartattend_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('smartattend_user') !== null;
  });

  const login = useCallback(async (email: string, password: string) => {
    const mockUser = {
      email,
      uid: 'mock-uid',
      role: 'admin',
      name: 'Demo User'
    };
    localStorage.setItem('smartattend_user', JSON.stringify(mockUser));
    setUser(mockUser);
    setIsAuthenticated(true);
  }, []);

  const loginWithId = useCallback(async (name: string, id: string, role: 'student' | 'faculty' | 'hod'): Promise<AuthResult> => {
    // Accept any name and ID - no validation needed for frontend-only
    if (!name.trim() || !id.trim()) {
      return {
        success: false,
        error: 'Please enter both Name and ID.'
      };
    }

    const mockUser = {
      email: `${id}@smartattend.com`,
      uid: `mock-${id}`,
      role,
      name: name.trim(),
      authId: id.trim()
    };
    
    localStorage.setItem('smartattend_user', JSON.stringify(mockUser));
    setUser(mockUser);
    setIsAuthenticated(true);
    
    const redirectPaths = {
      hod: '/hod-workspace',
      faculty: '/faculty-dashboard',
      student: '/student-workspace'
    };
    
    return {
      success: true,
      user: { name: name.trim(), role, id: id.trim() },
      redirectPath: redirectPaths[role]
    };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('smartattend_user');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, loginWithId, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
