import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AdminContextType {
  isAdminMode: boolean;
  isAuthenticated: boolean;
  authenticate: (password: string) => boolean;
  logout: () => void;
  toggleAdminMode: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

// Admin password - in production this should be environment variable
const ADMIN_PASSWORD = 'Socrates14';

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session
  useEffect(() => {
    const session = sessionStorage.getItem('admin_session');
    if (session === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  // Secret keyboard shortcut: Ctrl/Cmd + Shift + E
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        if (isAuthenticated) {
          setIsAdminMode(prev => !prev);
        } else {
          setIsAdminMode(true);
        }
      }

      // Escape to exit admin mode
      if (e.key === 'Escape' && isAdminMode) {
        setIsAdminMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, isAdminMode]);

  const authenticate = useCallback((password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_session', 'authenticated');
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setIsAdminMode(false);
    sessionStorage.removeItem('admin_session');
  }, []);

  const toggleAdminMode = useCallback(() => {
    if (isAuthenticated) {
      setIsAdminMode(prev => !prev);
    }
  }, [isAuthenticated]);

  return (
    <AdminContext.Provider value={{
      isAdminMode,
      isAuthenticated,
      authenticate,
      logout,
      toggleAdminMode
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
