
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { 
  checkUserSession, 
  setupAuthStateChangeListener, 
  loginUser, 
  logoutUser 
} from '@/services/authService';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      const sessionUser = await checkUserSession();
      setUser(sessionUser);
      setLoading(false);
    };

    initializeAuth();

    const subscription = setupAuthStateChangeListener((localStorageUser) => {
      setUser(localStorageUser);
      if (!localStorageUser && !window.location.pathname.startsWith('/')) { // Avoid redirect loop on login page
        // navigate('/'); // Re-evaluate if auto-navigation on logout from other tab is desired
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);


  const login = async (username, password) => {
    setLoading(true);
    const loggedInUser = await loginUser(username, password);
    setLoading(false);
    if (loggedInUser) {
      setUser(loggedInUser);
      return loggedInUser; // Return user object for LoginPage to handle navigation
    }
    return false; // Indicate login failure
  };

  const logout = async () => {
    setLoading(true);
    await logoutUser(); // Clears localStorage
    setUser(null);
    navigate('/');
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso.',
      className: "bg-background text-foreground border-border",
    });
    setLoading(false);
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
