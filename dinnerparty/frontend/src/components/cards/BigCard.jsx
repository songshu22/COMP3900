import styled from 'styled-components';
import Card from '@mui/material/Card';
import { useTheme } from '@emotion/react';
import { CardActionArea } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import {styled as styledMUI} from '@mui/material/styles';

// Outer card style
const StyledCard = styledMUI(Card)(({theme}) => `
  background-color: ${theme.palette.secondary.main};
  border: 2px solid ${theme.palette.primary.main};
  height: 130px;
  max-width: 400px;
  width: 100%;
  position: relative;
`,);

// Inside action area style
const StyledAction = styledMUI(CardActionArea)(() => ({
  height: '100%',
  '> div': {
    padding: 0,
    height: '100%',
  },
}));

// Internal wrapper style
const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  font-family: 'Bree Serif';
`;

// Large card componenet for session cards
const BigCard = (props) => {
  const theme = useTheme();

  return (
    <StyledCard theme={theme}>
      <StyledAction
        onClick={props.onClick}
        disabled={!props.onClick}  
      >
        <CardContent>
          <Wrapper>
            {props.children}
          </Wrapper>
        </CardContent>
      </StyledAction>
    </StyledCard>
  );
}

export default BigCard;
