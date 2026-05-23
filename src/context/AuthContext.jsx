import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('ss_auth') === 'true';
  });
  const [selectedBhandar, setSelectedBhandarState] = useState(() => {
    return sessionStorage.getItem('ss_bhandar') || sessionStorage.getItem('ss_selected_bhandar') || '';
  });
  const [bhandarList, setBhandarList] = useState([]);
  const [bhandarsLoading, setBhandarsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch real bhandars from server on mount
  useEffect(() => {
    async function fetchBhandars() {
      try {
        const res = await fetch('/get_bhandars_list?userId=1&usertype=1&length=-1');
        const json = await res.json();
        if (json && json.data && Array.isArray(json.data)) {
          const options = [
            { label: 'All Bhandars', value: 'All', code: 'ALL', name: 'All Records' },
            ...json.data
              .filter(b => b.sname || b.bhandar_code)
              .map(b => ({
                label: `${b.sname || b.bhandar_code}${b.city ? ' : ' + b.city : ''}`,
                value: `${b.sname || b.bhandar_code}${b.city ? ' : ' + b.city : ''}`,
                code: b.bhandar_code,
                name: b.name,
                area: b.area,
                state: b.state,
              }))
          ];
          setBhandarList(options);
          
          // Set a default if nothing saved yet
          const stored = sessionStorage.getItem('ss_bhandar') || sessionStorage.getItem('ss_selected_bhandar');
          if (!stored && options.length > 0) {
            const loggedInUser = sessionStorage.getItem('ss_username');
            let matched = null;
            if (loggedInUser && loggedInUser !== 'admin' && loggedInUser !== 'user') {
              matched = options.find(b => b.label.toLowerCase().includes(loggedInUser));
            }
            const defaultValue = matched ? matched.value : options[0].value;
            setSelectedBhandarState(defaultValue);
            sessionStorage.setItem('ss_bhandar', defaultValue);
          }
        }
      } catch (err) {
        console.error('Failed to fetch bhandars list:', err);
      } finally {
        setBhandarsLoading(false);
        setLoading(false);
      }
    }
    fetchBhandars();
  }, []);

  const login = async (username, password) => {
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
        
        setIsLoggedIn(true);
        
        if (user !== 'admin' && user !== 'user' && bhandarList && bhandarList.length > 0) {
          const matchingBhandar = bhandarList.find(b => b.label.toLowerCase().includes(user));
          if (matchingBhandar) {
            setSelectedBhandarState(matchingBhandar.value);
            sessionStorage.setItem('ss_bhandar', matchingBhandar.value);
          }
        }
        
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
    sessionStorage.removeItem('ss_selected_bhandar');
    setIsLoggedIn(false);
    setSelectedBhandarState('');
    navigate('/login');
  };

  const setSelectedBhandar = (bhandar) => {
    setSelectedBhandarState(bhandar);
    if (bhandar) {
      sessionStorage.setItem('ss_bhandar', bhandar);
      sessionStorage.setItem('ss_selected_bhandar', bhandar);
    } else {
      sessionStorage.removeItem('ss_bhandar');
      sessionStorage.removeItem('ss_selected_bhandar');
    }
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      isAuthenticated: isLoggedIn, // alias for compatibility
      login,
      logout,
      selectedBhandar,
      setSelectedBhandar,
      bhandarList,
      bhandarsLoading,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
