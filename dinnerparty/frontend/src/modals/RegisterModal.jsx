import React from 'react';
import styled from 'styled-components';

import ModalBase from './ModalBase';
import apiFetch from '../utilities/apiFetch';
import {StoreContext} from '../utilities/Store';
import ThemedButton from '../components/ThemedButton';
import ThemedTextInput from '../components/ThemedTextInput';

// Right alined button
const RightButton = styled.div`
  margin-left: auto;
`;

// Register modal component for user authentication
// open: true if the modal is open
// onClose: handler function for modal closing
const RegisterModal = ({open, onClose}) => {
  const context = React.useContext(StoreContext);
  const [, setToken] = context.token;
  const [, setAlert] = context.alert;

  // Registration form states
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  // User registration function
  const doRegister = async () => {
    // Check the form is completed before submission
    if (!name || !email || !password) {
      setAlert({text: 'Please provide valid details'});
    }

    // Send the request to the backend
    const res = await apiFetch(
        'POST', 'user/auth/register/', {name, email, password},
    );

    if (res.ok) {
      // User is registered, so log them in and reset the modal
      setToken(res.token);
      setAlert({text: 'Registered successfully. Welcome!', severity: 'success'});
      onClose();
      setName('');
      setEmail('');
      setPassword('');
    } else {
      // Registration failed
      setAlert({text: res.error});
    }
  };

  return (
    <ModalBase open={open} onClose={onClose}>
      <b>Register for DinnerParty</b>
      <ThemedTextInput
        id="name"
        label="Full name"
        size="small"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
        fullWidth
        required
      />
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
          if (e.key === 'Enter') {
            doRegister();
          }
        }}
        fullWidth
        required
      />
      <RightButton>
        <ThemedButton onClick={doRegister}>Register</ThemedButton>
      </RightButton>
    </ModalBase>
  );
};

export default RegisterModal;
