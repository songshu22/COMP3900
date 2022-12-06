import React from "react";
import styled from "styled-components";
import apiFetch from "../utilities/apiFetch";
import { StoreContext } from "../utilities/Store";

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

// Contribution list outer style
const List = styled.div`
  display: grid;
  grid-template-columns: 24% 37% 37%;
  font-size: 1.1rem;

  & > .MuiInput-root {
    height: 25px;
    margin: auto 0;
    padding-top: 3px;
    font-family: inherit;
  }
`;

// List title style
const ListTitle = styled.span`
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 10px;
`;

// List bottom seperator style
const Seperator = styled.div`
  border-bottom: 1px solid black;
  grid-column: 1 / 4;
`;

// List cell styles
const Cell = styled.div`
  width: calc(90%);
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  padding: 6px 0 3px;
`;

// Internal component for dropdown box to select an ingredient's contributor
// ingredient: the ingredient object
// guests: a list of guests to display
// code: the session code to request for
// disabled: true if contribution has closed
const ContributorSelector = ({ingredient, guests, code, disabled}) => {
  const context = React.useContext(StoreContext);
  const [, setAlert] = context.alert;
  const [person, setPerson] = React.useState(ingredient.user_id);

  // If the asignee changes, reflect this
  React.useEffect(() => {
    setPerson(ingredient.user_id);
  }, [ingredient.user_id]);

  return (
    <Select
      value={person}
      onChange={async (e) => {
        // Format the data for the backend
        const body = {
          ingredient_id: ingredient.id,
          user_id: e.target.value,
        }

        // Attempt to change the contributor on the backend
        const data = await apiFetch('PUT', `sessions/contribute/${code}/`, body);
        if (data.ok) {
          setPerson(e.target.value);
        } else {
          setAlert({text: data.error});
        }
      }}
      variant='standard'
      disableUnderline
      disabled={disabled}
    >
      <MenuItem value={-1} dense>Unassigned</MenuItem>
      {/* Sorted guest options */}
      {guests.sort((a, b) => a.name.localeCompare(b.name)).map((guest, idx) => {
        return (
          <MenuItem
            value={guest.id}
            key={idx}
            dense
          >
            {guest.name}
          </MenuItem>
        );
      })}
    </Select>
  );
};

// Ingredient contribution list component for shared sessions (grid)
// session: the session object with ingredients inside
const ContributionList = ({session}) => {
  // Parse the contribution close time
  const closeTime = new Date(Date.parse(
    session.session_start_time) - (session.contribution_time_limit * 60000));

  return (
    <React.Fragment>
      <List>
        <ListTitle>Qty</ListTitle>
        <ListTitle>Ingredient</ListTitle>
        <ListTitle>Contributor</ListTitle>
        {session.ingredient_list.map((ing, idx) => {
          // Map a contribution row for each available ingredient
          return (
            <React.Fragment key={idx}>
              <Cell>{`${ing.qty} ${ing.unit}`}</Cell>
              <Cell>{ing.name}</Cell>
              <ContributorSelector 
                ingredient={ing}
                guests={session.guests}
                code={session.session_code}
                disabled={!session.can_contribute}
              />
              <Seperator />
            </React.Fragment>
          );
        })}
      </List>
      {session.can_contribute ?
        <span>{`Contribution closes at ${closeTime.toLocaleString()}`}</span> : 
        <span>Contribution closed</span>
      }
    </React.Fragment>
  );
}

export default ContributionList;
