import React from 'react';
import styled from "styled-components";
import ThemedTextInput from "./ThemedTextInput";

// Cell style for a singular guest
const Cell = styled.div`
  display: flex;
  gap: 5px;
  width: 100%;

  & > b {
    font-size: 1.5rem;
    width: 40px;
  }
`;

// Form wrapper for input components
const CellForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

// Cell componenet for adding a guest to a session
// idx: the index of the current cell
// guests: the guests array
// setGuests: setter for the guest array
// refresh: callback if a refresh is required
const GuestCell = ({idx, guests, setGuests, refresh}) => {
  
  // Updates the state for a single guest in the given cell
  const updateGuest = (name = null, email = null) => {
    const copy = [...guests];

    if (name !== null) {
      copy[idx].name = name;
    }

    if (email !== null) {
      copy[idx].email = email;
    }

    setGuests(copy);
  };

  return (
    <Cell>
      <b>{idx+1}.</b>
      <CellForm>
        <ThemedTextInput
          label='Name'
          type='text'
          value={guests[idx].name}
          onChange={(e) => {
            updateGuest(e.target.value);
          }}
          onBlur={() => {
            refresh(idx);
          }}
          size='small'
        />
        <ThemedTextInput
          label='Email'
          type='email'
          value={guests[idx].email}
          onChange={(e) => {
            updateGuest(null, e.target.value);
          }}
          onBlur={() => {
            refresh(idx);
          }}
          size='small'
        />
      </CellForm>
    </Cell>
  )
};

export default GuestCell;
