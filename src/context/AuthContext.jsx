import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedBhandar, setSelectedBhandarState] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const authStatus = sessionStorage.getItem('ss_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (username, password, bhandarList) => {
    try {
      const res = await fetch('/api/proxyLogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      console.log('Login Response Status:', res.status);
      
      let data = {};
      try {
        data = await res.json();
      } catch (e) {
        console.error('Failed to parse JSON', e);
      }

      if (res.ok && data.success) {
        const user = username.toLowerCase().trim();
        sessionStorage.setItem('ss_auth', 'true');
        sessionStorage.setItem('ss_username', user);
        
        if (user !== 'admin' && user !== 'user') {
          const matchingBhandar = bhandarList.find(b => b.label.toLowerCase().includes(user));
          if (matchingBhandar) {
            setSelectedBhandarState(matchingBhandar.value);
          }
        }
        
        setIsAuthenticated(true);
        navigate('/add-book');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('ss_auth');
    sessionStorage.removeItem('ss_username');
    sessionStorage.removeItem('ss_bhandar');
    setIsAuthenticated(false);
    setSelectedBhandarState(null);
    navigate('/');
  };

  const setSelectedBhandar = (bhandar) => {
    setSelectedBhandarState(bhandar);
    if (bhandar) {
      sessionStorage.setItem('ss_bhandar', bhandar);
    } else {
      sessionStorage.removeItem('ss_bhandar');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, selectedBhandar, setSelectedBhandar, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

