import { supabase } from '@/lib/supabaseClient';

const USER_SESSION_KEY = 'jgr_user_session';

const getUserFromLocalStorage = () => {
  const storedUser = localStorage.getItem(USER_SESSION_KEY);
  try {
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    localStorage.removeItem(USER_SESSION_KEY);
    return null;
  }
};

const setUserInLocalStorage = (user) => {
  if (user) {
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_SESSION_KEY);
  }
  window.dispatchEvent(new StorageEvent('storage', { key: USER_SESSION_KEY, newValue: user ? JSON.stringify(user) : null }));
};

export const checkUserSession = async () => {
  return getUserFromLocalStorage();
};

export const setupAuthStateChangeListener = (callback) => {
  const handleStorageChange = (event) => {
    if (event.key === USER_SESSION_KEY) {
      try {
        callback(event.newValue ? JSON.parse(event.newValue) : null);
      } catch (error) {
        console.error("Error parsing user from storage event:", error);
        callback(null);
      }
    }
  };
  window.addEventListener('storage', handleStorageChange);
  
  return {
    unsubscribe: () => {
      window.removeEventListener('storage', handleStorageChange);
    }
  };
};

export const loginUser = async (username, password) => {
  if (!supabase) {
    console.error("Supabase client is not initialized.");
    return false;
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, name, username, email, role, password, profile')
    .eq('username', username);

  if (error) {
    console.error('Supabase query error during login:', error);
    return false; 
  }

  if (!data || data.length === 0) {
    console.warn(`Login attempt: User with username '${username}' not found.`);
    return false;
  }

  if (data.length > 1) {
    console.error(`Login error: Multiple users found with username '${username}'. This should not happen due to unique constraint.`);
    return false;
  }
  
  const user = data[0];

  if (user.password === password) {
    const loggedInUser = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    setUserInLocalStorage(loggedInUser);
    return loggedInUser;
  } else {
    console.warn(`Login attempt for '${username}': Incorrect password.`);
    return false;
  }
};

export const logoutUser = async () => {
  setUserInLocalStorage(null);
};