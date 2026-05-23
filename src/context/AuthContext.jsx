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

  // Whether the logged-in user is an admin (can switch bhandars)
  const storedUser = sessionStorage.getItem('ss_username') || '';
  const isAdmin = storedUser === 'admin' || storedUser === 'user' || storedUser === '';
  // The bhandar this specific user is locked to (null if admin)
  const [lockedBhandar, setLockedBhandar] = useState(null);
  const navigate = useNavigate();

  // Fetch real bhandars from server on mount
  useEffect(() => {
    async function fetchBhandars() {
      try {
        const res = await fetch('/get_bhandars_list?userId=1&usertype=1&length=-1');
        const json = await res.json();
        if (json && json.data && Array.isArray(json.data)) {
          const allOptions = [
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

          const loggedInUser = sessionStorage.getItem('ss_username') || '';
          const userIsAdmin = loggedInUser === 'admin' || loggedInUser === 'user' || loggedInUser === '';

          if (userIsAdmin) {
            // Admin can see and switch ALL bhandars
            setBhandarList(allOptions);
            const stored = sessionStorage.getItem('ss_bhandar') || sessionStorage.getItem('ss_selected_bhandar');
            if (!stored && allOptions.length > 0) {
              setSelectedBhandarState(allOptions[0].value);
              sessionStorage.setItem('ss_bhandar', allOptions[0].value);
            }
          } else {
            // Non-admin: find their specific bhandar and lock them to it
            const matched = allOptions.find(b => b.label.toLowerCase().includes(loggedInUser.toLowerCase()));
            if (matched) {
              setLockedBhandar(matched);
              setBhandarList([matched]); // only their bhandar in list
              setSelectedBhandarState(matched.value);
              sessionStorage.setItem('ss_bhandar', matched.value);
            } else {
              // No match found — show all but lock selection to first non-All
              const fallback = allOptions[1] || allOptions[0];
              setLockedBhandar(fallback);
              setBhandarList([fallback]);
              setSelectedBhandarState(fallback.value);
              sessionStorage.setItem('ss_bhandar', fallback.value);
            }
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

      console.log('Login Response Data:', data);

      if (res.ok && data.success) {
        const user = username.toLowerCase().trim();
        sessionStorage.setItem('ss_auth', 'true');
        sessionStorage.setItem('ss_username', user);
        setIsLoggedIn(true);
        navigate('/add-book');
        return { success: true };
      }
      return { success: false, message: data.message || 'Invalid credentials. Please try again.' };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  };

  const logout = () => {
    try {
      fetch('/logout/frontend', { credentials: 'same-origin' }).catch(console.error);
    } catch (e) {
      console.error(e);
    }
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
      isAdmin,
      lockedBhandar,
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
