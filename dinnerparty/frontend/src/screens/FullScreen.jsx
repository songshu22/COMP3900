import React from 'react';
import styled from 'styled-components';
import {useNavigate} from 'react-router-dom';
import {StoreContext} from '../utilities/Store';

import {useTheme} from '@mui/material';
import {styled as styledMUI} from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

// Style for the floating close button
const CloseButton = styledMUI(IconButton)({
  position: 'absolute',
  top: 10,
  left: 10,
});

// Style for the full screen overlay
const FullScreenContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: ${(props) => (
    props.theme ? props.theme.palette.secondary.main : ''
  )};

  overflow: auto;
`;

// Style for the content wrapper
const Wrapper = styled.div`
  display: flex;
  width: 100%;
  min-height: 100%;
  max-width: 800px;
  margin: 0 auto;
  flex-direction: column;
  gap: 20px;
  padding: 60px 30px 30px;
  box-sizing: border-box;

  > * {
    flex-shrink: 0;
  }
`;

// Template component for a fullscreen overlay without routing
// onClose: handler function for closing the fullscreen
const FullScreen = ({children, onClose}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const context = React.useContext(StoreContext);
  const [fullscreen, setFullscreen] = context.fullscreen;
  const [previousFs] = React.useState(fullscreen);

  // Enable fullscreen mode and save the previous state
  React.useEffect(() => {
    setFullscreen(true);

    return () => {
      // Restore the previous state to allow stacking
      setFullscreen(previousFs);
    };
  }, []);

  return (
    <FullScreenContainer theme={theme}>
      <Wrapper>
        <CloseButton
          onClick={() => {
            onClose ? onClose() : navigate(-1);
          }}>
          <CloseIcon />
        </CloseButton>
        {children}
      </Wrapper>
    </FullScreenContainer>
  );
};

export default FullScreen;
