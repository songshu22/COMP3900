import styled from 'styled-components';
import IngredientCell from './IngredientCell';

// Style for the ingredient list container
const ListContainer = styled.div`
  max-width: 750px;
  margin: 0 25px;
  background-color: ghostwhite;
  border: 4px solid black;
  padding: 5px 15px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  max-height: 300px;
  overflow: auto;
  box-sizing: border-box;
`;

// Ingredient list componenent for editing of ingredients within recipes and sessions
// list: the list of ingredients to display
// setList: the setter for the ingredient list
// disabled: true if read only
const IngredientList = ({list, setList, disabled}) => {

  // Function for updating a particular ingredient with a new quantity
  const updateQty = (value, qty) => {
    // Stop if invalid input
    if (typeof(qty) !== 'number' && isNaN(qty)) {
      return;
    }
    
    if (qty <= 0) {
      // If quantity is negative, delete the ingredient cell
      setList(list.filter((elm) => {
        return elm.id !== value;
      }));
    } else {
      // Find the corresponding ingredient and update its value
      let i = 0;
      for (; i < list.length; ++i) {
        if (list[i].id === value) {
          break;
        }
      }

      // Save the results
      const tmp = list;
      tmp[i] = {...tmp[i], qty};
      setList([...tmp]);
    }
  };

  return (
    <ListContainer>
      {list.map((ing) => {
        return (
          <IngredientCell
            key={ing.id}
            ingredient={ing}
            updateFn={(qty) => {
              updateQty(ing.id, qty);
            }}
            disabled={disabled}
          />
        );
      })}
      {list.length < 1 ?
        <span>Add some ingredients!</span>:
        null
      }
    </ListContainer>
  );
};

export default IngredientList;
