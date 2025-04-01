import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the authentication context
const AuthContext = createContext(null);

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component that wraps your app and makes auth object available to any
// child component that calls useAuth().
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // This effect runs only once when the component mounts
  useEffect(() => {
    // Check if user is stored in localStorage
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      // Clear potentially corrupted data
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return true;
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Compute authentication properties based on the user's role
  const isAuthenticated = !!user;
  const isOperator = user && user.role === 'operator';
  const isQA = user && user.role === 'qa';
  const isAVP = user && user.role === 'avp';
  const isMaster = user && user.role === 'master';

  // AuthContext value - we only create this object once per render
  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    isOperator,
    isQA,
    isAVP,
    isMaster,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;