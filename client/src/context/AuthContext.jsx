import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on page refresh via /api/auth/me
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await authService.getMe();
        if (response?.data) {
          setUser(response.data);
        }
      } catch (err) {
        // Not logged in or expired session
        setUser(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const { user: userData, token } = response.data;
    if (token) {
      localStorage.setItem('token', token);
    }
    setUser(userData);
    return userData;
  };

  const register = async (userDataInput) => {
    const response = await authService.register(userDataInput);
    const { user: userData, token } = response.data;
    if (token) {
      localStorage.setItem('token', token);
    }
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout error on backend:', err.message);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const updateProfile = async (updateData) => {
    const response = await authService.updateProfile(updateData);
    if (response?.data) {
      setUser(response.data);
    }
    return response.data;
  };

  const isStudent = user?.role === 'student';
  const isOrganizer = user?.role === 'organizer';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isStudent,
        isOrganizer,
        login,
        register,
        logout,
        updateProfile,
        refreshUser: async () => {
          const res = await authService.getMe();
          setUser(res.data);
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
