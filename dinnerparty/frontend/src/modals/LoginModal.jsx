import React from 'react';
import styled from 'styled-components';

import ModalBase from './ModalBase';
import apiFetch from '../utilities/apiFetch';
import {StoreContext} from '../utilities/Store';
import ThemedButton from '../components/ThemedButton';
import ThemedTextInput from '../components/ThemedTextInput';

// Style for right aligned button
const RightButton = styled.div`
  margin-left: auto;
`;

// Login modal component for user auth
// open: true when the modal is open
// onClose: handler for modal closing
const LoginModal = ({open, onClose}) => {
  const context = React.useContext(StoreContext);
  const [, setToken] = context.token;
  const [, setAlert] = context.alert;

  // Login form state
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  // Login request function
  const doLogin = async () => {
    // Check the user has completed the form
    if (!email || !password) {
      setAlert({text: 'Please provide a valid email and password'});
    }

    // Send the request to the backend
    const res = await apiFetch('POST', 'user/auth/login/', {email, password});
    if (res.ok) {
      // User is logged in so reset and close the form
      setToken(res.token);
      setAlert({text: 'Logged in. Welcome!', severity: 'success'});
      onClose();
      setEmail('');
      setPassword('');
    } else {
      // Login failed
      setAlert({text: res.error});
    }
  };

  return (
    <ModalBase open={open} onClose={onClose}>
      <b>Sign in to DinnerParty</b>
      <ThemedTextInput
        id="email"
        label="Email"
        size="small"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
        }}
        fullWidth
        required
      />
      <ThemedTextInput
        id="password"
        label="Password"
        size="small"
        type="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
        }}
        onKeyPress={(e) => {
          // Handles enter key form submission
          if (e.key === 'Enter') {
            doLogin();
          }
        }}
        fullWidth
        required
      />
      <RightButton>
        <ThemedButton onClick={doLogin}>Sign-in</ThemedButton>
      </RightButton>
    </ModalBase>
  );
};

export default LoginModal;
