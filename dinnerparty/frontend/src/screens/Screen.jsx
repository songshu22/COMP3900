import React from 'react';
import styled from 'styled-components';

// Style for screen component
const ScreenContainer = styled.div`
  width: 100%;
  padding-bottom: 90px;
`;

// Template component for all normal screens
const Screen = ({children}) => {
  return (
    <ScreenContainer>
      {children}
    </ScreenContainer>
  );
};

export default Screen;
