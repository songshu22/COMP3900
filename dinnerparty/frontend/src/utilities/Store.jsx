import React from 'react';
import apiFetch from './apiFetch';
import useLocalStorage from './useLocalStorage';

export const StoreContext = React.createContext(null);

// Component used to store and share states within context
const StoreProvider = ({children}) => {
  // User authentication token
  const [token, setToken] = useLocalStorage('token', null);
  // User email
  const [email, setEmail] = React.useState('');
  // Current page type for navbar
  const [page, setPage] = React.useState('browse');
  // Fullscreen state for stacking screens
  const [fullscreen, setFullscreen] = React.useState(false);
  // User object for user details
  const [user, setUser] = React.useState(null);
  // Recipe/session cache for performance boost
  const [cache, setCache] = React.useState(null);
  // Global alert for error handling
  const [alert, setAlert] = React.useState(null);

  // Loads the user's information from the server from their token
  const loadUser = async () => {
    const data = await apiFetch('GET', 'user/', null, token);
    if (data.ok) {
      setUser(data);
    } else {
      // Invalid user or unable to check. Log them out & invalidate
      setToken(null);
      setUser(null);
    }
  };

  // On load, load the user's information to check if current
  React.useEffect(() => {
    if (token) {
      loadUser();
    }
  }, [token]);

  const store = {
    token: [token, setToken],
    email: [email, setEmail],
    page: [page, setPage],
    fullscreen: [fullscreen, setFullscreen],
    user: [user, setUser],
    cache: [cache, setCache],
    alert: [alert, setAlert],
  };
  
  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreProvider;
