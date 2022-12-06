import React from 'react';
import ModalBase from './ModalBase';
import {units} from '../assets/enums';
import apiFetch from '../utilities/apiFetch';
import { StoreContext } from '../utilities/Store';
import ThemedButton from '../components/ThemedButton';
import ThemedSelect from '../components/ThemedSelect';
import ThemedTextInput from '../components/ThemedTextInput';
import MenuItem from '@mui/material/MenuItem';

// Modal component for adding a new custom ingredient to the ing base
// open: true when the modal is visible
// onClose: handler function for closing the modal
// addIngredient: callback function for selecting the new ingredient
// refreshFn: callback function for refreshing the ingredient list
const AddIngredientModal = ({open, onClose, addIngredient, refreshFn}) => {
  const context = React.useContext(StoreContext);
  const [token] = context.token;
  const [, setAlert] = context.alert;

  // New ingredient state
  const [name, setName] = React.useState('');
  const [unit, setUnit] = React.useState('');

  // Attempt to contribute the new ingredient to the backend
  const contributeIngredient = async () => {
    const data = await apiFetch('POST', 'ingredients/new/', {name, unit}, token);
    
    if (data.ok) {
      // Request successful
      addIngredient({
        name: name,
        id: data.ingredient_id,
        unit: unit,
      });

      // Reset and close the modal
      refreshFn();
      setName('');
      setUnit('');
      onClose();
    } else {
      setAlert({text: data.error});
    }
    
  };

  return (
    <ModalBase open={open} onClose={onClose}>
      <b>Create a new ingredient</b>
      <ThemedTextInput
        label='Name'
        size='small'
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
        fullWidth
      />
      <ThemedSelect
        id='unit'
        label='Unit'
        value={unit}
        onChange={(e) => {
          setUnit(e.target.value);
        }}
      >
        {units.sort((a, b) => a.localeCompare(b)).map((key) => {
          return (
            <MenuItem value={key} key={key}>
              {key}
            </MenuItem>
          );
        })}
      </ThemedSelect>
      <ThemedButton onClick={contributeIngredient}>
        Add
      </ThemedButton>
    </ModalBase>
  );
};

export default AddIngredientModal;
