import React from 'react';
import styled from 'styled-components';
import { StepTitle } from './StepStyles';
import GuestCell from '../../components/GuestCell';

// Style for list of guest subforms
const GuestList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

// Subscreen component for session guest invitation
// guests: list of guests 
// setGuests: setter for guest list
// setValid: callback function when form is validated
const GuestForm = ({guests, setGuests, setValid}) => {

  // Handle changes to the guest list
  React.useEffect(() => {
    let invalid = false;

    // Validate each guest
    guests.forEach((guest, idx) => {
      // Exclude the last empty cell
      if (idx !== guests.length - 1) {
        // Check each cell is completely filled out
        if (!guest.name || !guest.email) {
          invalid = true;
          return;
        }
      } else if (guests.length === 1) {
        // For last cell, ensure is either empty or filled
        if (!guest.name ^ !guest.email) {
          invalid = true;
          return;
        }
      }
    });

    setValid(!invalid);
  }, [guests]);

  // Function for adding a guest cell
  const addGuest = () => {
    setGuests([...guests, {
      email: '',
      name: '',
    }]);
  };

  // Function for refreshing a guest cell within the list by index
  const refresh = (idx) => {
    // Delete empty cells
    if (idx !== guests.length - 1 && !guests[idx].name && 
      !guests[idx].email) {
      const tmp = [...guests]
      tmp.splice(idx, 1);
      setGuests(tmp);
      return;
    }

    // Add cell if bottom populated
    if (idx === guests.length - 1 && guests[idx].name &&
      guests[idx].email) {
      addGuest();
    }
  };

  // On load, add initial empty cell
  React.useEffect(() => {
    if (guests.length === 0) {
      addGuest();
    }
    setValid(true);
  }, []);

  return (
    <React.Fragment>
      <StepTitle>Invite your mates</StepTitle>
      <GuestList>
        {guests.map((_, idx) => {
          return (
            <GuestCell
              key={idx}
              idx={idx}
              guests={guests}
              setGuests={setGuests}
              refresh={refresh}
            />
          );
        })}
      </GuestList>
    </React.Fragment>
  );
};

export default GuestForm;
