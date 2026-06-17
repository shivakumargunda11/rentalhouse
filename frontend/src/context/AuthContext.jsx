import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Set up Axios default config with dynamic host resolution for local/Vercel services
axios.defaults.baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

// Request interceptor to automatically route /api calls to the backend service prefix on Vercel
axios.interceptors.request.use((config) => {
  if (import.meta.env.PROD && config.url.startsWith('/api') && !import.meta.env.VITE_API_URL) {
    config.url = `/_/backend${config.url}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set authorization token in axios header
  const setAuthHeader = (authToken) => {
    if (authToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('househunt_token');
      const storedUser = localStorage.getItem('househunt_user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          setAuthHeader(storedToken);

          // Get fresh profile details to check if token is still valid
          const response = await axios.get('/api/auth/profile', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          setUser(response.data);
          localStorage.setItem('househunt_user', JSON.stringify(response.data));
        } catch (error) {
          console.error('Session expired or authentication failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: userToken, ...userData } = response.data;

      setToken(userToken);
      setUser(userData);
      setAuthHeader(userToken);

      localStorage.setItem('househunt_token', userToken);
      localStorage.setItem('househunt_user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.',
      };
    }
  };

  const register = async (name, email, password, role, phone) => {
    try {
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        role,
        phone,
      });
      const { token: userToken, ...userData } = response.data;

      setToken(userToken);
      setUser(userData);
      setAuthHeader(userToken);

      localStorage.setItem('househunt_token', userToken);
      localStorage.setItem('househunt_user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.',
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthHeader(null);
    localStorage.removeItem('househunt_token');
    localStorage.removeItem('househunt_user');
  };

  const updateProfile = async (updatedData) => {
    // For profile customization/updating phone number, etc.
    try {
      // In this setup we can update user info in-memory
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      localStorage.setItem('househunt_user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Could not update local storage' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
