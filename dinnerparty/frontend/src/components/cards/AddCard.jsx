import ThemedCard from './ThemedCard';

import styled from 'styled-components';
import {useTheme} from '@emotion/react';
import {CardActionArea, CardContent} from '@mui/material';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';

// Wrapper style for add recipe card
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
`;

// Add recipe card for session recipe creation
const AddCard = ({onClick}) => {
  const theme = useTheme();

  return (
    <ThemedCard raised>
      <CardActionArea
        sx={{height: '100%', paddingBottom: '15px'}}
        onClick={onClick}
      >
        <CardContent>
          <Wrapper theme={theme}>
            <span>Select</span>
            <LibraryAddIcon />
          </Wrapper>
        </CardContent>
      </CardActionArea>
    </ThemedCard>
  );
};

export default AddCard;
