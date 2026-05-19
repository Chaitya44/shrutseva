import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('ss_auth') === 'true';
  });
  const [selectedBhandar, setSelectedBhandar] = useState(() => {
    return sessionStorage.getItem('ss_selected_bhandar') || 'Sardar Nagar : Bardoli';
  });

  const login = (username, password) => {
    const creds = {
      'admin': { pass: 'admin@123', bhandar: 'Sardar Nagar : Bardoli' },
      'bardoli': { pass: 'bardoli@123', bhandar: 'Sardar Nagar : Bardoli' },
      'surat': { pass: 'surat@123', bhandar: 'Jawahar Nagar : Surat' },
      'ahmedabad': { pass: 'ahmedabad@123', bhandar: 'Main Bhandar : Ahmedabad' }
    };

    const user = creds[username.toLowerCase().trim()];
    if (user && user.pass === password) {
      sessionStorage.setItem('ss_auth', 'true');
      sessionStorage.setItem('ss_selected_bhandar', user.bhandar);
      setSelectedBhandar(user.bhandar);
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem('ss_auth');
    sessionStorage.removeItem('ss_selected_bhandar');
    setSelectedBhandar('Sardar Nagar : Bardoli');
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, selectedBhandar, setSelectedBhandar }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
