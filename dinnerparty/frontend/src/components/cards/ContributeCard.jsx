import ThemedCard from './ThemedCard';

import styled from 'styled-components';
import {useTheme} from '@emotion/react';
import {useNavigate} from 'react-router-dom';
import AddBoxIcon from '@mui/icons-material/AddBox';
import {CardActionArea, CardContent} from '@mui/material';

// Style for internal card wrapper
const Wrapper = styled.div`
  text-align: center;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  height: 100%;
  width: 100%;
  font-size: 1.5em;
  gap: 5px;
  color: ${(props) => (props.theme.palette.primary.main)};
  font-family: 'Bree Serif';

  .MuiSvgIcon-root {
    font-size: 2em;
  }

  @media (min-width: 900px) {
    font-size: 1.8rem;
  }
`;

// Contribute recipe card for recipe browsing screen
const ContributeCard = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <ThemedCard raised>
      <CardActionArea
        sx={{height: '100%', paddingBottom: '15px'}}
        onClick = {() => {
          navigate('/recipe/contribute');
        }}
      >
        <CardContent>
          <Wrapper theme={theme}>
            <span>Contribute</span>
            <AddBoxIcon />
          </Wrapper>
        </CardContent>
      </CardActionArea>
    </ThemedCard>
  );
};

export default ContributeCard;
