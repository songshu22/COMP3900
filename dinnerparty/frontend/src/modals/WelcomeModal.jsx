import React from 'react';
import styled from 'styled-components';

import ModalBase from './ModalBase';
import logo from '../assets/logo.svg';
import { StoreContext } from '../utilities/Store';
import CodeHandler from '../components/CodeHandler';
import ThemedButton from '../components/ThemedButton';

// Style for the login/register button container
const ButtonStack = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
`;

// Style for the promotional floating text
const TopText = styled.span`
  width: 100%;
  margin-top: -10px;
`;

// Style for the DinnerParty logo
const WelcomeLogo = styled.img`
  height: 35px;
  margin-top: 15px;
`;

// User welcome floating modal component (prompt join/login/register)
// open: true when the modal is open
// onClose: handler function for modal closing (arg for redirect path)
const WelcomeModal = ({open, onClose}) => {
  const context = React.useContext(StoreContext);
  const [token] = context.token;

  // Self-close if the user is already logged in
  React.useEffect(() => {
    if (token) {
      onClose();
    }
  }, []);

  return (
    <ModalBase open={open} onClose={onClose}>
      <TopText>← click to browse</TopText>
      <WelcomeLogo src={logo} alt='DinnerParty Logo' />
      <CodeHandler 
        onClose={onClose}
      />
      <span>——————&nbsp;&nbsp;or&nbsp;&nbsp;——————</span>
      <ButtonStack>
        <ThemedButton
          onClick={() => {
            onClose('login');
          }}
        >Sign-in</ThemedButton>
        <ThemedButton
          onClick={() => {
            onClose('register');
          }}
        >Register</ThemedButton>
      </ButtonStack>
    </ModalBase>
  );
};

export default WelcomeModal;
