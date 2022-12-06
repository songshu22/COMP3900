import {Card} from '@mui/material';
import {styled as styledMUI} from '@mui/material/styles';

// Themed regular card tempelate component
const ThemedCard = (props) => {
  const StyledCard = styledMUI(Card)(
      ({theme}) => `
      background-color: ${theme.palette.secondary.main};
      border: 2px solid ${theme.palette.primary.main};
      aspect-ratio: 0.9;
      width: 150px;
      position: relative;

      @media (min-width: 900px) {
        width: 197px;
      }
    `,
  );

  return (
    <StyledCard raised>
      {props.children}
    </StyledCard>
  );
};

export default ThemedCard;
