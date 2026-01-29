import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
import { FacultyService } from '@/lib/facultyService';

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
  loginHod: (email: string, password: string) => Promise<AuthResult>;
  loginFaculty: (email: string, password: string) => Promise<AuthResult>;
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
  const [user, setUser] = useState<{ email: string; uid: string; role?: string; name?: string; authId?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('smartattend_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

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

  const loginHod = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await api.loginHod({ email, password });
      
      const hodUser = {
        email,
        uid: email,
        role: 'hod',
        name: 'Head of Department',
        authId: email
      };
      
      localStorage.setItem('smartattend_user', JSON.stringify(hodUser));
      localStorage.setItem('smartattend_token', response.access_token);
      setUser(hodUser);
      setIsAuthenticated(true);
      
      return {
        success: true,
        user: { name: hodUser.name, role: 'hod', id: email },
        redirectPath: '/hod-workspace'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }, []);

  const loginFaculty = useCallback(async (nameOrEmail: string, biometricId: string): Promise<AuthResult> => {
    try {
      const result = await FacultyService.authenticateFaculty(nameOrEmail, biometricId);
      
      if (!result.success || !result.faculty) {
        return {
          success: false,
          error: result.error || 'Authentication failed'
        };
      }
      
      const facultyUser = {
        email: result.faculty.email,
        uid: result.faculty.biometricId,
        role: 'faculty',
        name: result.faculty.name,
        authId: result.faculty.biometricId
      };
      
      localStorage.setItem('smartattend_user', JSON.stringify(facultyUser));
      setUser(facultyUser);
      setIsAuthenticated(true);
      
      return {
        success: true,
        user: { name: result.faculty.name, role: 'faculty', id: result.faculty.biometricId },
        redirectPath: '/faculty-dashboard'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
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
    localStorage.removeItem('smartattend_token');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, loginHod, loginFaculty, loginWithId, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
