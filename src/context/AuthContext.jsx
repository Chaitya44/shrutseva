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
          const options = json.data
            .filter(b => b.sname || b.bhandar_code)
            .map(b => ({
              label: `${b.sname || b.bhandar_code}${b.city ? ' : ' + b.city : ''}`,
              value: `${b.sname || b.bhandar_code}${b.city ? ' : ' + b.city : ''}`,
              code: b.bhandar_code,
              name: b.name,
              area: b.area,
              state: b.state,
            }));
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

  const login = (username, password) => {
    const creds = {
      'admin': 'admin@123',
      'bardoli': 'bardoli@123',
      'surat': 'surat@123',
      'ahmedabad': 'ahmedabad@123',
      'user': 'user@123',
    };

    const user = username.toLowerCase().trim();
    if (creds[user] && creds[user] === password) {
      sessionStorage.setItem('ss_auth', 'true');
      sessionStorage.setItem('ss_username', user);
      setIsLoggedIn(true);

      // Auto-select corresponding bhandar based on username if found in the list
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
