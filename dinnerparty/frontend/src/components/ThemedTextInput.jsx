import React from 'react';
import TextField from '@mui/material/TextField';
import {styled as styledMUI, useTheme} from '@mui/material/styles';

// Style for thematic MUI text field
const StyledTextField = styledMUI(TextField)((props) => ({
  maxWidth: '800px',

  '& .MuiOutlinedInput-root': {
    borderRadius: props.size == 'small' ? '30px' : '20px',
    fontFamily: 'inherit',
    boxShadow: '4px 4px 4px 0px rgba(0,0,0,0.3)',
    '& fieldset': {
      borderColor: props.theme.palette.primary.main,
      borderWidth: '2px',
    },
    '&.Mui-focused fieldset': {
      borderColor: props.theme.palette.focused.main,
    },
  },
  '& .MuiInputLabel-root': {
    fontFamily: 'inherit',
  },
  '& label.Mui-focused': {
    color: props.theme.palette.focused.main,
  },
  '& .MuiInput-root': {
    fontFamily: 'inherit',
    fontSize: '1.6em',
  },
}));

// Themed text field input based on MUI textfield
const ThemedTextInput = (props) => {
  const theme = useTheme();

  return (
    <StyledTextField
      {...props}
      theme={theme}
      variant={props.variant ? props.variant : 'outlined'}
    />
  );
};

export default ThemedTextInput;
