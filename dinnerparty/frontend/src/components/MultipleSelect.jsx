import ThemedSelect from "./ThemedSelect";
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';

// Multiple choice selection componenet which extends the MUI select
// label: the text label for the field
// options: list of options to display
// selection: the user's selection
// setSelection: setter for the selection
const MultipleSelect = ({label, options, selection, setSelection}) => {

  // Display helper function to display all selected options inside the field
  const createSelectionString = (selected) => {
    let selectedString = '';
    selected.forEach((selection) => {
      // Join each option seperated by a comma
      selectedString += options[selection];
      if (selection !== selected.at(-1)) {
        selectedString += ', ';
      }
    });
    return selectedString;
  };

  return (
    <ThemedSelect
      label={label}
      value={selection}
      onChange={(e) => {
        setSelection(e.target.value);
      }}
      renderValue={createSelectionString}
      multiple
      size='small'
    >
      {Object.keys(options).sort((a, b) => a.localeCompare(b)).map((key) => {
        return (
          <MenuItem value={key} key={key}>
            <Checkbox checked={selection.includes(key)} />
            <ListItemText primary={options[key]} />
          </MenuItem>
        );
      })}
    </ThemedSelect>
  );
}

export default MultipleSelect;
