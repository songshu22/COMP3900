import React from 'react';
import styled from 'styled-components';

import Tag from '../Tag';
import ThemedCard from './ThemedCard';
import { tagEnum } from '../../assets/enums';
import { StoreContext } from '../../utilities/Store';

import {useTheme} from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import {CardActionArea, CardContent} from '@mui/material';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

// Container style for card tag components
const TagContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-family: 'Bree Serif';
`;

// Style for recipe title text
const TitleText = styled.div`
  font-size: 1.4em;
  padding: 0 5px;
  font-family: 'Bree Serif';
  overflow-wrap: break-word;
  text-overflow: ellipsis;
  max-height: 40%;
  overflow: hidden;
  width: calc(100%);

  @media (min-width: 900px) {
    font-size: 1.4rem;
    margin: 0 5px;
    width: calc(100% - 20px);
  }
`;

// Style for card image
const CardImage = styled.img`
  height: 60%;
  width: 100%;
  object-fit: cover;
`;

// Style for floating delete button (for recipe selection screen)
const DeleteButton = styled.div`
  position: absolute;
  top: 5px;
  left: 5px;

  & > button {
    padding: 0;
    
    & > svg {
      font-size: 2rem;
      color: red;
    }
  }
`;

// Shared recipe card component for recipe browsing and selection
// recipe: recipe object
// onClick: click function for card action area
// removeFn?: optional callback for card removal
const RecipeCard = ({recipe, onClick, removeFn}) => {
  const theme = useTheme();
  const context = React.useContext(StoreContext);
  const [, setCache] = context.cache;

  // Wrapper function to forward onClick whilst handling cache
  const wrapClick = () => {
    setCache(recipe);
    onClick();
  };

  return (
    <ThemedCard raised>
      <CardActionArea
        sx={{height: '100%'}}
        onClick={wrapClick}
        disabled={!onClick}
      >
        <CardContent sx={{height: '100%', padding: 0}}>
          <TagContainer>
            {/* Maps recipe tags with a limit of 2 per card */}
            {recipe.tags ?
              recipe.tags.map((tag, idx) => {
                return (
                  idx < 3 ? 
                  <Tag
                    text={tagEnum[tag]}
                    key={idx}
                    className='card'
                  /> : 
                  null
                );
              }) :
              null
            }
            
            {/* Desktop rating tag */}
            <Tag
              text={recipe.rating ? `${recipe.rating} ★` : 'Unrated'}
              color='#ebab34'
              className='card rate' 
              invert
            />
          </TagContainer>
          <CardImage
            alt='Recipe image'
            src={recipe.image}
          />
          <TitleText>{recipe.title}</TitleText>
        </CardContent>
      </CardActionArea>

      {/* Floating delete button */}
      {removeFn
        ? <DeleteButton theme={theme}>
            <IconButton onClick={removeFn} >
              <RemoveCircleIcon />
            </IconButton>
          </DeleteButton>
        : null
      }
    </ThemedCard>
  );
};

export default RecipeCard;
