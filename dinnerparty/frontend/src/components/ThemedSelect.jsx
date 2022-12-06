import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import {styled as styledMUI, useTheme} from '@mui/material/styles';

// Themed select component based on MUI select
const ThemedSelect = (props) => {
  const theme = useTheme();

  // Custom style for MUI select
  const ThemedControl = styledMUI(FormControl)({
    maxWidth: '800px',
    
    '& .MuiOutlinedInput-root': {
      borderRadius: '40px',
      fontFamily: 'inherit',
      '& fieldset': {
        borderColor: theme.palette.primary.main,
        borderWidth: '2px',
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.focused.main,
      },
      'svg': {
        color: theme.palette.primary.main,
        transform: 'scale(1.5)',
      },
      '& .MuiSelect-select': {
        fontFamily: 'inherit',
      },
    },
    '& label.Mui-focused': {
      color: theme.palette.focused.main,
    },
  });

  // Style for input label element
  const ThemedLabel = styledMUI(InputLabel)({
    fontFamily: 'inherit',
  });

  return (
    <ThemedControl fullWidth size='small'>
      <ThemedLabel id={`${props.id}-label`}>{props.label}</ThemedLabel>
      <Select
        labelId={`${props.id}-label`}
        id={props.id}
        label={props.label}
        value={props.value ? props.value : ''}
        {...props}
      >
        {props.children}
      </Select>
    </ThemedControl>
  );
};

export default ThemedSelect;
