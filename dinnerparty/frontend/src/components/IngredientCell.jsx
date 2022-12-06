import React from 'react';
import styled from 'styled-components';
import TextField from '@mui/material/TextField';

import IconButton from '@mui/material/IconButton';
import {styled as styledMUI} from '@mui/material/styles';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

// Style for a singular ingredient cell
const Cell = styled.div`
  display: flex;
  gap: 10px;
  height: 25px;
  width: 100%;
`;

// Style for text within the cell
const CellText = styled.span`
  flex-shrink: 2;
  flex-grow: 2;
  text-overflow: ellipsis;
  overflow: hidden;
`;

// Style for the quantity input field
const CellField = styledMUI(TextField)(() => ({
  height: '20px',
  width: '50px',
  minWidth: '50px',
  '& .MuiInput-root': {
    height: '20px',
    fontSize: '1em',
    fontFamily: 'inherit',
  },
}));

// Style for the cell delete button
const DeleteButton = styledMUI(IconButton)(() => ({
  padding: '2px 0 4px',
  marginLeft: '-4px',
  '> .MuiSvgIcon-root': {
    fontSize: '0.7em',
  },
}));

// Style for the right-set unit label
const UnitLabel = styled.span`
  width: 20px;
  overflow: hidden;
  text-overflow: hidden;
`;

// Singular ingredient cell component for use within an ingredient list
// ingredient: the ingredient object
// updateFn: the callback function to update the ingredient state
// disabled: true if the cell is read only
const IngredientCell = ({ingredient, updateFn, disabled}) => {
  const [qty, setQty] = React.useState('');

  // Unpacks the initial ingredient quantity if provided
  React.useEffect(() => {
    if (ingredient && ingredient.qty) {
      setQty(ingredient.qty);
    }
  }, []);

  return (
    <Cell>
      {!disabled ?
        <DeleteButton
          aria-label='delete'
          onClick={() => {
            updateFn(-1);
          }}
        >
          <RemoveCircleIcon />
        </DeleteButton> :
        null
      }
      <CellText>{ingredient.name}</CellText>
      <CellField
        id={`ing-${ingredient.id}`}
        variant="standard"
        type='number'
        value={qty}
        onChange={(e) => {
          setQty(e.target.value);
        }}
        onBlur={() => {
          updateFn(qty);
        }}
        disabled={disabled}
      />
      <UnitLabel>{ingredient.unit}</UnitLabel>
    </Cell>
  );
};

export default IngredientCell;
