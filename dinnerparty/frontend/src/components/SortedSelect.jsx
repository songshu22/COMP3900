import ThemedSelect from "./ThemedSelect";
import MenuItem from '@mui/material/MenuItem';

// Component for MUI select with sorting
// label: form control label
// options: array of select options
// value: current select value
// setValue: setter for select value
const SortedSelect = ({label, options, value, setValue, children}) => {
  return (
    <ThemedSelect
      label={label}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
      }}
    >
      {children}
      {Object.keys(options).sort((a, b) => a.localeCompare(b)).map((key) => {
        // Sorted alphabetically
        return (
          <MenuItem value={key} key={key}>
            {options[key]}
          </MenuItem>
        );
      })}
    </ThemedSelect>
  );
};

export default SortedSelect;
