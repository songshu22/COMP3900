import React from 'react';
// import ThemedCard from '../components/ThemedCard';

import styled from 'styled-components';
import RecipeGrid from '../components/RecipeGrid';
import ContributeCard from '../components/cards/ContributeCard';
import SearchBar from '../components/SearchBar';

import {StoreContext} from '../utilities/Store';
import apiFetch from '../utilities/apiFetch';

import RecipeScreen from './RecipeScreen';
import { useNavigate } from 'react-router-dom';


const BrowseText = styled.div`
  font-size: 2em;
  margin: 25px 0px 10px;
`;


const RecipeBrowser = ({onSelect, browseText, setCourse, redirect}) => {
  const context = React.useContext(StoreContext);
  const [token] = context.token;
  const [, setAlert] = context.alert;
  const [recipes, setRecipes] = React.useState([]);
  const [displayed, setDisplayed] = React.useState([]);
  const [showRecipe, setShowRecipe] = React.useState(null);

  const [recommended, setRecommended] = React.useState([]);
  const [regular, setRegular] = React.useState([]);

  const path = window.location.pathname;
  const navigate = useNavigate();

  React.useEffect(() => {
    const loadRecipes = async () => {
      // Load all recipes
      const data = await apiFetch('GET', 'recipes/', null, token);
      if (data.ok) {
        // Set course
        if (setCourse !== undefined) {
          data.recipes = data.recipes.filter((recipe) => {
            return recipe.course === String(setCourse);
          });
        }

        setRecipes(data.recipes);
        setDisplayed(data.recipes);
      } else {
        setAlert({text: data.error});
      }
    };

    loadRecipes();
  }, []);

  React.useEffect(() => {
    setRecommended([...displayed.filter((recipe) => {
      return recipe.personalised_score || browseText;
    })]);

    if (browseText) {
      return;
    }

    setRegular([...displayed.filter((recipe) => {
      return !recipe.personalised_score;
    })]);
  }, [displayed]);

  const clickFn = (recipe) => {
    if (redirect) {
      navigate(`/browse/${recipe.id}`);
    } else {
      // Use built in FS viewer
      setShowRecipe(recipe);
    } 
  };

  return (
    <React.Fragment>
      <SearchBar
        recipes={recipes}
        displayed={displayed}
        setDisplayed={setDisplayed}
        setCourse={setCourse}
      />

      {recommended.length ?
        <React.Fragment>
          {!browseText ?
            <BrowseText>Recipes we think you might like:</BrowseText> :
            <BrowseText>{browseText}</BrowseText>}
          <RecipeGrid
            recipes={recommended}
            onClick={clickFn}
          >
          </RecipeGrid>
        </React.Fragment> :
        null
      }
      {regular.length ? 
        <React.Fragment>
          {recommended.length ?
            <BrowseText>Everything else:</BrowseText> :
            <BrowseText>{`Browse ${regular.length} recipes:`}</BrowseText>
          }
        </React.Fragment> : 
        null
      }
      <RecipeGrid
        recipes={regular}
        onClick={clickFn}
      >
        {token && path.includes('browse') ?
          <ContributeCard /> :
          null
        }
      </RecipeGrid> 
      {showRecipe
        ? <RecipeScreen
            recipe={showRecipe} 
            onClose={() => {
              setShowRecipe(null);
            }}
            onSelect={onSelect}
          />   
        : null
      }
    </React.Fragment>
  );
};

export default RecipeBrowser;
