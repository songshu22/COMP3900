import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

import apiFetch from '../utilities/apiFetch';
import { StoreContext } from '../utilities/Store';
import ThemedTextInput from '../components/ThemedTextInput';

import IconButton from '@mui/material/IconButton';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';

// External wrapper session code componeent
const Wrapper = styled.div`
  width: 100%;
  max-width: 400px;
`;

// Join session by code component
// onClose: optional close parent callback function
const CodeHandler = ({onClose}) => {
  const navigate = useNavigate();
  const context = React.useContext(StoreContext);
  const [, setCache] = context.cache;
  const [, setAlert] = context.alert;

  const [code, setCode] = React.useState('');

  // Attempt to retrive the session using the provided code
  const getSession = async () => {
    if (!code) {
      return;
    }
    
    // Fetch the session information from the backend
    const data = await apiFetch('GET', `sessions/code/${code.toLowerCase()}`);
    if (data.ok) {
      // If session is fully loaded, cache it and display the session
      data.full = true;
      setCache(data);
      navigate(`/sessions/${data.id}`);
      setAlert({text: 'Joined session. Enjoy!', severity: 'success'});
      if (onClose) {
        onClose();
      }
    } else {
      // Session does not exist or other error
      setAlert({text: data.error});
      setCode('');
    }
  };

  return (
    <Wrapper>
      <ThemedTextInput
        label="Enter code..."
        type='text'
        value={code}
        onChange={(e) => {
          setCode(e.target.value.toUpperCase());
        }}
        onKeyPress={(e) => {
          // Handle enter keypress in the textfield
          if (e.key === 'Enter') {
            getSession();
          }
        }}
        InputProps={{
          endAdornment: 
          <IconButton
            onClick={getSession}
            disabled={code.length !== 6}
            color="primary"
            aria-label="go"
          >
            <PlayCircleIcon />
          </IconButton>
        }}
        size="small"
        fullWidth
      />
    </Wrapper>
  );
};

export default CodeHandler;
