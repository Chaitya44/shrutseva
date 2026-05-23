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

  // Fetch bhandars — called on mount AND after login
  const fetchBhandars = React.useCallback(async () => {
    try {
      const userType    = sessionStorage.getItem('ss_user_type') || '';
      const userId      = sessionStorage.getItem('ss_user_id')   || '';
      const exactCode   = sessionStorage.getItem('ss_bhandar_code') || '';
      const loggedInUser = sessionStorage.getItem('ss_username') || '';

      // Only admins (user_type === 'admin') see all bhandars
      const userIsAdmin = userType === 'admin' || loggedInUser === 'admin' || loggedInUser === '';

      let fetchUrl;
      if (userIsAdmin) {
        // Admin: fetch ALL bhandars
        fetchUrl = '/get_bhandars_list?userId=1&usertype=1&length=-1';
      } else if (userId) {
        // Regular user: fetch ONLY their bhandar(s)
        fetchUrl = `/get_bhandars_list?userId=${userId}&usertype=0&length=-1`;
      } else {
        // No userId yet — fetch all but will lock by exactCode
        fetchUrl = '/get_bhandars_list?userId=1&usertype=1&length=-1';
      }

      const res  = await fetch(fetchUrl);
      const json = await res.json();

      if (json && json.data && Array.isArray(json.data)) {
        const mapBhandar = b => ({
          label: `${b.sname || b.bhandar_code}${b.city ? ' : ' + b.city : ''}`,
          value: `${b.sname || b.bhandar_code}${b.city ? ' : ' + b.city : ''}`,
          code:  b.bhandar_code,
          name:  b.name,
          area:  b.area,
          state: b.state,
        });

        if (userIsAdmin) {
          // Admin: show all bhandars with an 'All' option
          const allOptions = [
            { label: 'All Bhandars', value: 'All', code: 'ALL', name: 'All Records' },
            ...json.data.filter(b => b.sname || b.bhandar_code).map(mapBhandar)
          ];
          setBhandarList(allOptions);
          const stored = sessionStorage.getItem('ss_bhandar') || sessionStorage.getItem('ss_selected_bhandar');
          if (!stored && allOptions.length > 0) {
            setSelectedBhandarState(allOptions[0].value);
            sessionStorage.setItem('ss_bhandar', allOptions[0].value);
          }
        } else {
          // Non-admin: lock to their specific bhandar(s)
          let userBhandars = json.data.filter(b => b.sname || b.bhandar_code).map(mapBhandar);

          // If we fetched all, filter down by exactCode
          if (!userId && exactCode && exactCode !== '') {
            const filtered = userBhandars.filter(b => b.code === exactCode);
            if (filtered.length > 0) userBhandars = filtered;
          }

          if (userBhandars.length > 0) {
            const locked = userBhandars[0];
            setLockedBhandar(locked);
            setBhandarList(userBhandars);
            setSelectedBhandarState(locked.value);
            sessionStorage.setItem('ss_bhandar', locked.value);
          } else {
            // Fallback: fetch all but still lock by exactCode
            const allRes  = await fetch('/get_bhandars_list?userId=1&usertype=1&length=-1');
            const allJson = await allRes.json();
            const allOpts = (allJson.data || []).filter(b => b.sname || b.bhandar_code).map(mapBhandar);
            const matched = exactCode ? allOpts.find(b => b.code === exactCode) : null;
            if (matched) {
              setLockedBhandar(matched);
              setBhandarList([matched]);
              setSelectedBhandarState(matched.value);
              sessionStorage.setItem('ss_bhandar', matched.value);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch bhandars list:', err);
    } finally {
      setBhandarsLoading(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBhandars(); }, [fetchBhandars]);

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
        sessionStorage.setItem('ss_user_type', data.user_type || '');

        // Store userId so fetchBhandars can use userId+usertype=0 for exact lookup
        if (data.user_id) {
          sessionStorage.setItem('ss_user_id', data.user_id);
        } else {
          sessionStorage.removeItem('ss_user_id');
        }

        // Store exact bhandar_code as backup
        if (data.bhandar_code) {
          sessionStorage.setItem('ss_bhandar_code', data.bhandar_code);
        } else {
          sessionStorage.removeItem('ss_bhandar_code');
        }

        setIsLoggedIn(true);
        // Re-fetch bhandars now that user info is stored
        await fetchBhandars();
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
    sessionStorage.removeItem('ss_user_type');
    sessionStorage.removeItem('ss_user_id');
    sessionStorage.removeItem('ss_bhandar_code');
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
