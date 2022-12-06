import React from 'react';
import styled from 'styled-components';

import { StepTitle } from './StepStyles';
import apiFetch from '../../utilities/apiFetch';
import { StoreContext } from '../../utilities/Store';
import IngredientList from '../../components/IngredientList';
import IngredientAutocomplete from '../../components/IngredientAutocomplete';

// Style for the add ingredient container
const AddMoreBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

// Ingredient review and editing form subscreen component for create session
const IngredientsForm = ({menu, guests, ingredients, 
  setIngredients, setValid}) => {
  const context = React.useContext(StoreContext);
  const [, setAlert] = context.alert;
  
  // On load, compile the ingredients list based on courses and guests
  React.useEffect(() => {
    const loadIngredients = async () => {
      // Create recipe ID list
      const recipes = [];
      Object.keys(menu).forEach((course) => {
        menu[course].forEach((recipe) => {
          recipes.push(recipe.id);
        });
      })

      // Count people
      let num_people = 1;
      guests.forEach((guest) => {
        if (guest.name && guest.email) {
          num_people++;
        }
      })

      // Load combined ingredient list from backend
      const data = await apiFetch('POST', 'sessions/compile_list/', 
        {recipes, num_people});
      if (data.ok) {
        // Display the backend's compiled list
        setIngredients(data.ingredient_list);
      } else {
        setAlert({text: data.error});
      }
    };

    setValid(false);
    loadIngredients();
  }, []);

  // Check validity when ingredients are changed
  React.useEffect(() => {
    let valid = true;
    ingredients.forEach((ing) => {
      // Ensure each ingredient has a valid quantity
      if (!ing.qty) {
        valid = false;
      }
    });

    setValid(valid);
  }, [ingredients]);

  return (
    <React.Fragment>
      <StepTitle>Refine your ingredients</StepTitle>
      <IngredientList
        list={ingredients}
        setList={setIngredients} 
      />
      <AddMoreBox>
        <b>Add more ingredients?</b>
        <IngredientAutocomplete 
          onSelect={(ing) => {
            setIngredients([...ingredients, {...ing, qty: ''}]);
          }}
          selected={ingredients}
        />
      </AddMoreBox>
    </React.Fragment>
  );
};

export default IngredientsForm;
