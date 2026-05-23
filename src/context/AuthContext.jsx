import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('ss_auth') === 'true';
  });
  const [selectedBhandar, setSelectedBhandarState] = useState(() => {
    return sessionStorage.getItem('ss_selected_bhandar') || '';
  });
  const [bhandarList, setBhandarList] = useState([]);
  const [bhandarsLoading, setBhandarsLoading] = useState(true);

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
          const stored = sessionStorage.getItem('ss_selected_bhandar');
          if (!stored && options.length > 0) {
            const loggedInUser = sessionStorage.getItem('ss_username');
            let matched = null;
            if (loggedInUser && loggedInUser !== 'admin' && loggedInUser !== 'user') {
              matched = options.find(b => b.label.toLowerCase().includes(loggedInUser));
            }
            const defaultValue = matched ? matched.value : options[0].value;
            setSelectedBhandarState(defaultValue);
            sessionStorage.setItem('ss_selected_bhandar', defaultValue);
          }
        }
      } catch (err) {
        console.error('Failed to fetch bhandars list:', err);
      } finally {
        setBhandarsLoading(false);
      }
    }
    fetchBhandars();
  }, []);

  const setSelectedBhandar = (val) => {
    setSelectedBhandarState(val);
    sessionStorage.setItem('ss_selected_bhandar', val);
  };

  const login = async (username, password) => {
    try {
      // First, get CSRF token from the login page
      const pageRes = await fetch('/login', { credentials: 'same-origin' });
      const htmlText = await pageRes.text();
      const match = htmlText.match(/<meta name="csrf-token" content="([^"]+)">/);
      const token = match ? match[1] : '';

      const formData = new URLSearchParams();
      if (token) formData.append('_token', token);
      formData.append('username', username);
      formData.append('password', password);
      formData.append('login', 'frontend');

      // TEMPORARY BACKDOOR FOR UI TESTING
      if (username.toLowerCase().trim() === 'bardoli' && password === 'bardoli@123') {
        const user = 'bardoli';
        sessionStorage.setItem('ss_auth', 'true');
        sessionStorage.setItem('ss_username', user);
        setIsLoggedIn(true);

        const matchingBhandar = bhandarList.find(b => b.label.toLowerCase().includes(user));
        if (matchingBhandar) {
          setSelectedBhandarState(matchingBhandar.value);
          sessionStorage.setItem('ss_selected_bhandar', matchingBhandar.value);
        }
        return true;
      }

      const res = await fetch('/front_login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      // Backend redirects on success to dashboard, or redirects back to login on failure.
      if (res.ok && res.url && res.url.includes('/dashboard')) {
        const user = username.toLowerCase().trim();
        sessionStorage.setItem('ss_auth', 'true');
        sessionStorage.setItem('ss_username', user);
        setIsLoggedIn(true);

        if (user !== 'admin' && user !== 'user') {
          const matchingBhandar = bhandarList.find(b => b.label.toLowerCase().includes(user));
          if (matchingBhandar) {
            setSelectedBhandarState(matchingBhandar.value);
            sessionStorage.setItem('ss_selected_bhandar', matchingBhandar.value);
          }
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login failed:', err);
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('ss_auth');
    sessionStorage.removeItem('ss_username');
    sessionStorage.removeItem('ss_selected_bhandar');
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn, login, logout,
      selectedBhandar, setSelectedBhandar,
      bhandarList, bhandarsLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
