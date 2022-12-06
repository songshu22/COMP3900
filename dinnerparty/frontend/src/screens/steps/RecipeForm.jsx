import React from "react";
import FullScreen from "../FullScreen";
import RecipeBrowser from "../RecipeBrowser";
import {StepTitle} from "./StepStyles";
import CourseGrid from "../../components/CourseGrid";

// Enum of browsing text prompts for each course
const browseText = {
  'starter' : 'How do you want to start?',
  'main': 'The main course?',
  'dessert': 'Fancy some dessert?',
};

// Recipe selection subscreen component for session creation
// menu: dictionary of selected course recipes
// setMenu: setter for menu dict
// setHideFab: handler function for hiding the FAB
// setValid: callback function for validating the form
const RecipeForm = ({menu, setMenu, setHideFab, setValid}) => {
  // States for recipe selection and browsing
  const [starters, setStarters] = React.useState([]);
  const [mains, setMains] = React.useState([]);
  const [desserts, setDesserts] = React.useState([]);
  const [browsing, setBrowsing] = React.useState(false);
  const [course, setCourse] = React.useState(null);

  // When browsing, hide the FAB
  React.useEffect(() => {
    setHideFab(browsing);
  }, [browsing]);

  // Set the menu and validity when course selection changes
  React.useEffect(() => {
    setMenu({starters, mains, desserts});

    setValid(starters.length + mains.length + desserts.length);
  }, [starters, mains, desserts]);

  // On load, unpack the selected recipes for each course
  React.useEffect(() => {
    if (menu.starters) {
      setStarters(menu.starters);
    }
    if (menu.mains) {
      setMains(menu.mains);
    }
    if (menu.desserts) {
      setDesserts(menu.desserts);
    }
  }, []);

  // Handler for recipe card click
  const addRecipe = (course) => {
    setBrowsing(true);
    setCourse(course);
  };

  // Handler function for selecting a recipe
  const selectRecipe = (recipe) => {
    // Add the recipe to the menu's corresponding course
    switch (course) {
      case 'starter':
        setStarters([...starters, recipe]);
        break;
      case 'main':
        setMains([...mains, recipe]);
        break;
      default:
        setDesserts([...desserts, recipe]);
    }

    // Stop the browsing fullscreen
    setBrowsing(false);
  };

  return (
    <React.Fragment>
      <StepTitle>Choose your menu</StepTitle>
      <CourseGrid
        title='Starter'
        recipes={starters}
        addRecipe={() => {
          addRecipe('starter');
        }}
        setRecipes={setStarters}
      />
      <CourseGrid
        title='Main'
        recipes={mains}
        addRecipe={() => {
          addRecipe('main');
        }}
        setRecipes={setMains}
      />
      <CourseGrid
        title='Dessert'
        recipes={desserts}
        addRecipe={() => {
          addRecipe('dessert');
        }}
        setRecipes={setDesserts}
      />

      {/* built-in recipe browser to avoid redirection */}
      {browsing
        ? <FullScreen
            onClose={() => {
              setBrowsing(false);
            }}
          >
            <RecipeBrowser
              onSelect={selectRecipe}
              browseText={browseText[course]}
              setCourse={Object.keys(browseText).indexOf(course)}
            />
          </FullScreen>
        : null
      }
    </React.Fragment>
  );
}

export default RecipeForm;
