import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AppAuthService, AuthResult } from '@/lib/appAuth';

interface AuthContextType {
  user: { email: string; uid: string; role?: string; name?: string; authId?: string } | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithId: (name: string, id: string, role: 'student' | 'faculty' | 'hod') => Promise<AuthResult>;
  logout: () => Promise<void>;
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

  useEffect(() => {
    // Check for existing session
    const checkSession = () => {
      const session = localStorage.getItem('app_session');
      if (session) {
        const { user, expiresAt } = JSON.parse(session);
        if (Date.now() < expiresAt) {
          setUser(user);
          setIsAuthenticated(true);
          setLoading(false);
          return;
        } else {
          localStorage.removeItem('app_session');
        }
      }

      // Fallback to Firebase auth
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            email: firebaseUser.email!,
            uid: firebaseUser.uid
          });
          setIsAuthenticated(true);
        } else if (!session) {
          setUser(null);
          setIsAuthenticated(false);
        }
        setLoading(false);
      });

      return unsubscribe;
    };

    return checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginWithId = async (name: string, id: string, role: 'student' | 'faculty' | 'hod'): Promise<AuthResult> => {
    try {
      // Determine allowed roles based on the requested login type
      let allowedRoles: string[] = [role];
      if (role === 'faculty') {
        allowedRoles = ['faculty', 'hod'];
      }

      const authResult = await AppAuthService.authenticateUser(name, id, allowedRoles);

      if (authResult.success && authResult.user) {
        const sessionData = {
          user: {
            email: authResult.user.email,
            uid: authResult.user.id,
            role: authResult.user.role,
            name: authResult.user.name,
            authId: authResult.user.authId
          },
          expiresAt: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
        };

        localStorage.setItem('app_session', JSON.stringify(sessionData));

        setIsAuthenticated(true);
        setUser(sessionData.user);
      }

      return authResult;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Authentication failed. Please try again.'
      };
    }
  };

  const logout = async () => {
    localStorage.removeItem('app_session');
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, loginWithId, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
