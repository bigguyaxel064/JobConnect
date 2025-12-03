/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/session', { credentials: 'include' })
      .then(res => {
        if (cancelled) return null;
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        if (cancelled || !data) return;
        setUser(data?.user || null);
        setIsLogged(Boolean(data?.user));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isLogged, setIsLogged, user, setUser, isLoading, setIsLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
