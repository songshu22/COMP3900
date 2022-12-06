import React from 'react';
import apiFetch from '../utilities/apiFetch';
import { StoreContext } from '../utilities/Store';
import ThemedTextInput from "../components/ThemedTextInput";

import Autocomplete from "@mui/material/Autocomplete";
import { styled as styledMUI, useTheme } from "@mui/material/styles";

// Additional styling for the MUI autocomplete component
const ThemedAutocomplete = styledMUI(Autocomplete)((props) => ({
  "& .MuiButtonBase-root": {
    svg: {
      color: props.theme.palette.primary.main,
      transform: "scale(1.5)",
    },
  },
}));

// Ingredient search, autocomplete and select component
// onSelect: callback function when an ingredient is selected
// refresh: callback when a refresh of the ingredient list is required
// setRefresh: setter to wrap around the callback
// selected: list of ingredients already selected to filter out
// newIng: callback function for creating a new ingredient
const IngredientAutocomplete = ({onSelect, refresh, setRefresh, selected, newIng}) => {
  const theme = useTheme();
  const context = React.useContext(StoreContext);
  const [, setAlert] = context.alert;

  // Autocomplete states
  const [ingredientInput, setIngredientInput] = React.useState("");
  const [ingredientValue, setIngredientValue] = React.useState("");
  const [ingredientBase, setIngredientBase] = React.useState([]);

  // Function to asyncronously load the ingredients available for selection
  const loadIngredients = async () => {
    // Load ingredients
    const data = await apiFetch('GET', 'ingredients/');
    if (data.ok) {
      if (newIng) {
        // If a callback is provided, add the new ingredient option
        data.ingredients.push({
          name: "Create new ingredient",
          id: -1,
          unit: "",
        });
      }
      setIngredientBase(data.ingredients);
    } else {
      setAlert({text: data.error});
    }
  };

  // Comparator function to check if an ingredient already has been selected
  const ingExists = (value) => {
    let ans = false;

    selected.forEach((elm) => {
      if (elm.id === value) {
        ans = true;
      }
    });

    return ans;
  };

  // Initial onload to load ingredient list
  React.useEffect(() => {   
    loadIngredients();
  }, []);

  // Force refresh of ingredient list per callback
  React.useEffect(() => {
    if (refresh) {
      loadIngredients();
      setRefresh(false);
    }
  }, [refresh]);

  return (
    <ThemedAutocomplete
      disablePortal
      options={ingredientBase
        .filter((ing) => {
          // Filter existing selected ingredients
          return !ingExists(ing.id);
        })
        .sort((a, b) => {
          // Sort alphabetically, but keep the create option at the top
          if (a.id === -1) {
            return -1;
          } else if (b.id === -1) {
            return 1;
          }
          return a.name.localeCompare(b.name);
        })}
      renderInput={(params) => (
        <ThemedTextInput {...params} label="Add ingredients" size="small" />
      )}
      value={ingredientValue}
      onChange={(_, value) => {
        if (!value) {
          return;
        }

        // Handle either an ingredient selection or create ingredient prompt
        if (value.id !== -1) {
          onSelect(value);
        } else {
          newIng();
        }
      }}
      inputValue={ingredientInput}
      onInputChange={(_, value, reason) => {
        // Reset the selection after processing
        if (reason === "input") {
          setIngredientInput(value);
        } else {
          setIngredientInput("");
          setIngredientValue(null);
        }
      }}
      getOptionLabel={(option) => {
        if (option) {
          return option.name;
        } else {
          return "";
        }
      }}
      theme={theme}
      fullWidth
    />
  );
};

export default IngredientAutocomplete;
