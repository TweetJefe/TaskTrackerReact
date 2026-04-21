import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  userId: string | null;
  username: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuthData: (token: string, userId: string, username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('userId'));
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    
    const savedToken = localStorage.getItem('token');
    const savedUserId = localStorage.getItem('userId');
    const savedUsername = localStorage.getItem('username');
    if (savedToken && savedUserId) {
      setToken(savedToken);
      setUserId(savedUserId);
      setUsername(savedUsername);
    }
    setIsLoading(false);
  }, []);

  const setAuthData = (newToken: string, newUserId: string, newUsername: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('username', newUsername);
    setToken(newToken);
    setUserId(newUserId);
    setUsername(newUsername);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setToken(null);
    setUserId(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      userId, 
      username,
      isAuthenticated: !!token, 
      isLoading,
      setAuthData,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
