import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

import Screen from './Screen';
import apiFetch from '../utilities/apiFetch';
import {StoreContext} from '../utilities/Store';
import ThemedButton from '../components/ThemedButton';
import ThemedTextInput from '../components/ThemedTextInput';

// Style for input flex
const Flex = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 25px;

  & > * {
    flex-grow: 0;
  }
`;

// Style for screen hero text
const Hero = styled.span`
  font-size: 2.5rem;
  word-wrap: break-word;
`;

// Account screen component
const AccountScreen = ({ setModal }) => {
  const navigate = useNavigate();
  const context = React.useContext(StoreContext);
  const [token, setToken] = context.token;
  const [, setPage] = context.page;
  const [user] = context.user;
  const [, setAlert] = context.alert;

  // If user not logged in, show the welcome modal
  React.useEffect(() => {
    if (!token) {
      setModal('welcome');
    }
  }, []);
  
  // Logout handler function
  const logout = async () => {
    const res = await apiFetch('POST', 'user/auth/logout/', null, token);
    if (res.ok) {
      // Successfully logged out from the backend
      setPage('browse');
      setAlert({
        text: 'Logged out succesfully. Come back again!',
        severity: 'success',
      });
    } else {
      setAlert({text: res.error});
    }

    // Regardless of status, always log them out locally
    setToken(null);
    navigate('/browse');
  };

  return (
    <Screen>
      {token && user ?
        <Flex>
          <Hero>{`Hello ${user.name},`}</Hero>
          <ThemedTextInput 
            label='Registered email'
            value={user.email}
            size='small'
            disabled
          />
          <ThemedButton onClick={logout}>
            Logout
          </ThemedButton> 
        </Flex> :
        <Flex>
          <Hero>Log in to access more features</Hero>
          <ThemedButton
            onClick={() => {
              setModal('login');
            }}
            variant="contained"
          >
            Login
          </ThemedButton>
          <ThemedButton
            onClick={() => {
              setModal('register');
            }}
          >
            Register
          </ThemedButton>
        </Flex>
      }
    </Screen>
  );
};

export default AccountScreen;
