import React from 'react';
import styled from "styled-components";
import FullScreen from "./FullScreen";
import Tag from "../components/Tag";
import ThemedButton from "../components/ThemedButton";
import { courseEnum, cuisineEnum, tagEnum } from "../assets/enums";
import { useNavigate, useParams } from "react-router-dom";
import { StoreContext } from '../utilities/Store';
import apiFetch from '../utilities/apiFetch';
import CreateRecipeForm from './CreateRecipeForm';

import RestaurantIcon from '@mui/icons-material/Restaurant';
import PublicIcon from '@mui/icons-material/Public';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import StarIcon from '@mui/icons-material/Star';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Rating from '@mui/material/Rating';

// Style for recipe display image
const RecipeImg = styled.img`
  width: 100%;
  max-width: 800px;
  aspect-ratio: 1.6;
  max-height: 500px;
  border-radius: 15px;
  object-fit: cover;
`;

// Style for recipe title
const RecipeTitle = styled.div`
  font-size: 2.2rem;
  overflow: none;
  text-overflow: ellipsis;
  word-wrap: break-word;
`;

// Style for recipe metadata flex
const MetaFlex = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  column-gap: 20px;
  row-gap: 10px;
`;

// Style for a metadata item
const MetaItem = styled.div`
  display: flex;
  gap: 8px;
`;

// Style for tag display flex
const TagFlex = styled.div`
  display: flex;
  flex-wrap: wrap;
  column-gap: 20px;
  row-gap: 10px;
`;

// Style for recipe subsection heading
const SubHeading = styled.span`
  font-size: 1.5rem;
`;

// Style for subsection container
const SubSection = styled.div`
  margin-top: -10px;
  padding-left: 15px;
`;

// Style for subsection items
const SubSectionItem = styled.div`
  & > * {
    word-wrap: break-word;
  }
  padding-bottom: 5px;
`;

// Recipe detail view component when user clicks on a recipe
// recipe: the recipe to display
// onClose: handler function when this view closes
// onSelect: optional select function for use with session selection
const RecipeScreen = ({recipe, onClose, onSelect}) => {
  const navigate = useNavigate();
  const params = useParams();
  const context = React.useContext(StoreContext);
  const [cache, setCache] = context.cache;
  const [token] = context.token;
  const [, setAlert] = context.alert;

  // Recipe display states
  const [rating, setRating] = React.useState(0);
  const [displayed, setDisplayed] = React.useState(recipe);
  const [editing, setEditing] = React.useState(false);

  // Load function to request the full recipe from the cache forwarding
  const getRecipe = async (id) => {
    const data = await apiFetch('GET', `recipes/${id}/`, null, token);
    if (data.ok) {
      setDisplayed(data);
      setRating(data.user_rating)
    } else {
      setAlert({text: data.error});
    }
  };

  // Recipe rating function
  const changeRating = async (_, newValue) => {
    // Ensure rating is provided
    if (newValue === null) {
      return;
    }
    
    // Make the request
    const body = {
      "rating": newValue,
    };
    const data = await apiFetch('PUT', `recipes/rate/${displayed.id}/`, body, token)
    
    // Update recipe rating if success
    if (data.ok) {
      setDisplayed({...displayed, rating: data.rating});
      setRating(newValue);
      setAlert({text: 'Rating submitted. Thanks!', severity: 'success'});
    } else {
      setAlert({text: data.error});
    }
  };

  // On load, check the cache and load the recipe if needed
  React.useEffect(() => {
    let id = null;
    if (params && params.recipeId) {
      // Get params from the path
      id = parseInt(params.recipeId);
    } else if (recipe && recipe.id) {
      id = recipe.id;
    }

    // Load and check cache
    if (cache && id && cache.id === id) {
      setDisplayed(cache);
    }

    // Load live recipe
    if (id) {
      getRecipe(id);
    }

    // On exit, clear cache
    return (() => {
      if (cache && cache.id === id) {
        setCache(null);
      }
    });
  }, []);

  return (
    <FullScreen onClose={onClose ? onClose : () => {
      navigate(-1);
    }} >
      {displayed && displayed.image
        ? <RecipeImg
            src={displayed.image}
            alt="Recipe image"
          />
        : null
      }
      {displayed && displayed.title
        ? <RecipeTitle>{displayed.title}</RecipeTitle>
        : null
      }
      <MetaFlex>
        {displayed && displayed.course !== undefined
          ? <MetaItem>
              <RestaurantIcon />
              <span>{courseEnum[displayed.course]}</span>
            </MetaItem>
          : null
        }
        {displayed && displayed.cuisine
          ? <MetaItem>
              <PublicIcon />
              <span>{cuisineEnum[displayed.cuisine]}</span>
            </MetaItem>
          : null
        }
        {displayed && displayed.cook_time
          ? <MetaItem>
              <AccessAlarmIcon />
              <span>{`${displayed.cook_time} mins`}</span>
            </MetaItem>
          : null
        }
        {displayed && displayed.rating
          ? <MetaItem>
              <StarIcon />
              <span>{displayed.rating}</span>
            </MetaItem>
          : null
        }
        {displayed && displayed.contributor
          ? <MetaItem>
              <AccountCircleIcon />
              <span>{displayed.contributor}</span>
            </MetaItem>
          : null
        }
      </MetaFlex>
      {displayed && displayed.tags
        ? <TagFlex>
            {displayed.tags.map((tag) => {
              return (
                <Tag
                  text={tagEnum[tag]}
                  key={tag}
                />
              );
            })}
          </TagFlex>
        : null
      }
      <SubHeading>Ingredients</SubHeading>
      {displayed && displayed.ingredients
        ? <SubSection>
            {displayed.ingredients.map((ing, idx) => {
              return (
                <SubSectionItem key={idx}>
                  <b>{`${ing.qty}${ing.unit}`}&nbsp;&nbsp;</b>
                  <span>{ing.ingredient_name}</span>
                </SubSectionItem>
              );
            })}
          </SubSection>
        : null
      }
      <SubHeading>Method</SubHeading>
      {displayed && displayed.steps
        ? <SubSection>
            {displayed.steps.map((step, idx) => {
              return (
                <SubSectionItem key={idx}>
                  <b>{`${idx + 1}.`}&nbsp;&nbsp;</b>
                  <span>{step}</span>
                </SubSectionItem>
              );
            })}
          </SubSection>
        : null
      }
      {token && displayed ? 
        <React.Fragment>
          <SubHeading>Rating</SubHeading>
          <Rating
            name="simple-controlled"
            value={rating}
            onChange={changeRating}
          />
        </React.Fragment> :
        null
      }
      {onSelect
        ? <ThemedButton
            variant='contained'
            onClick={() => {
              onSelect(recipe);
            }}
          >
            Select this recipe
          </ThemedButton>
        : null}
      {displayed && displayed.editable && !onSelect ?
        <ThemedButton
          onClick={() => {
            setEditing(true);
          }}
          variant='contained'
        >
          Edit your recipe
        </ThemedButton> :
        null
      }
      {editing ? 
        <FullScreen
          onClose={() => {
            setEditing(false);
          }}
        >
          <CreateRecipeForm 
            preload={displayed}
            onClose={() => {
              setEditing(false);
              getRecipe(displayed.id);
            }}
          />
        </FullScreen> :
        null
      }
    </FullScreen>
  );
};

export default RecipeScreen;
