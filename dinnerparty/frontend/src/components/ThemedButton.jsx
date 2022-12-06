import Button from '@mui/material/Button';
import {styled as styledMUI, useTheme} from '@mui/material/styles';

// Custom thematic style for MUI button
const StyledButton = styledMUI(Button)((props) => ({
  maxWidth: '800px',
  color: 'black',
  borderRadius: '60px',
  border: `2px solid ${props.theme ? props.theme.palette.primary.main : ''}`,
  fontFamily: 'inherit',
  fontSize: '1em',
  textTransform: 'none',
  '&:hover': {
    borderWidth: '2px',
  },
}));

// Themed button component based on MUI button
const ThemedButton = (props) => {
  const theme = useTheme();
  return (
    <StyledButton
      {...props}
      theme={theme}
      variant={props.variant ? props.variant : 'outlined'}
    />
  );
};

export default ThemedButton;
