import React from 'react';
import Slider from '@mui/material/Slider';
import styled from 'styled-components';

import ModalBase from './ModalBase';
import ThemedButton from '../components/ThemedButton';
import SortedSelect from '../components/SortedSelect';
import MultipleSelect from '../components/MultipleSelect';
import { tagEnum, courseEnum, cuisineEnum } from '../assets/enums';

// Style for slider component container
const SliderBox = styled.div`
  width: 100%;
`;

// Style for bottom button flex
const ButtonFlex = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
`;

// Enum of available sorting options
const sortOptions = {
  0: 'Default',
  1: 'Highest rated',
  2: 'Alphabetical',
};

// Recipe filtering and sorting modal component
// open: true when the modal is open
// onClose: handler function for modal closing
// recipes: list of all recipes available to reduce
// setFiltered: setter for filtered recipes
// setFiltering: setter for filtering active flag
// setCourse: indicates that the course is fixed and can't be changed
const FilterModal = ({open, onClose, recipes, setFiltered, setFiltering, setCourse}) => {
  // List of marks for the slider component
  const [marks, setMarks] = React.useState([]);

  // Filtering and sorting selection states
  const [sort, setSort] = React.useState(0);
  const [cuisines, setCuisines] = React.useState([]);
  const [types, setTypes] = React.useState([]);
  const [tags, setTags] = React.useState([]);
  const [maxTime, setMaxTime] = React.useState(120);

  // Dicts of available tags and cuisines to display
  const [availableTags, setAvailableTags] = React.useState({});
  const [availableCuisines, setAvailableCuisines] = React.useState({});

  // Generate marks for the slider component
  React.useEffect(() => {
    const newMarks = [];
    for (let i = 30; i <= 120; i = i + 10) {
      if ((i % 30) === 0 || i === 10 || i === 120) {
        newMarks.push({
          value: i,
          label: `${i}${i === 120 ? '+' : ''}`,
        });
      }
    }
    setMarks(newMarks);
  }, []);

  // Collect available cuisines and tags from the available recipes
  // This ensures only available options are displayed
  React.useEffect(() => {
    const collectedTags = {}
    const collectedCuisines = {}

    // Collect the available options from each recipe
    recipes.forEach((recipe) => {
      // Find the tags of all recipes and add to the dict
      recipe.tags.forEach((tag) => {
        if (!collectedTags[tag] && tagEnum[tag]) {
          collectedTags[tag] = tagEnum[tag];
        }
      });

      // Find the cuisine and check it is still available before adding
      if (!collectedCuisines[recipe.cuisine] && cuisineEnum[recipe.cuisine]) {
        collectedCuisines[recipe.cuisine] = cuisineEnum[recipe.cuisine];
      }
    });

    setAvailableCuisines(collectedCuisines);
    setAvailableTags(collectedTags);
  }, [recipes]);

  // Resets all the sorting and filtering options
  const reset = () => {
    setFiltered(recipes);
    setSort('');
    setCuisines([]);
    setTypes([]);
    setTags([]);
    setMaxTime(120);
    setFiltering(false);
  };

  // Executes the filter/sort command and sets the reduced list
  const filter = () => {
    let filtered = Array.from(recipes);

    // Filter cuisines
    if (cuisines.length) {
      filtered = filtered.filter((recipe) => {
        return cuisines.includes(recipe.cuisine);
      });
    }

    // Filter types
    if (types.length) {
      filtered = filtered.filter((recipe) => {
        return types.includes(recipe.course);
      });
    }

    // Filter tags
    if (tags.length) {
      filtered = filtered.filter((recipe) => {
        let res = false;

        // If tag is found, return true for filter
        if (recipe.tags) {
          recipe.tags.forEach((tag) => {
            if (tags.includes(tag)) {
              res = true;
            }
          })
        }
        return res;
      });
    }

    // Filter cook time
    if (maxTime < 120) {
      filtered = filtered.filter((recipe) => {
        return recipe.cook_time <= maxTime;
      });
    }

    // Sorting methods
    switch (sort) {
      case '1':
        // Highest rated
        filtered = filtered.sort((a, b) => {
          return b.rating - a.rating;
        })
        break;
      case '2':
        // Alphabetical
        filtered = filtered.sort((a, b) => {
          return a.title.localeCompare(b.title);
        });
        break;
      default:
        // As provided by the server (recommended)
        break;
    }

    setFiltered(filtered);
    setFiltering(!sort && !cuisines.empty && !types.empty && 
      !tags.empty && maxTime != 120);
  };

  return (
    <ModalBase open={open} onClose={onClose}>
      <b>Sort recipes</b>
      <SortedSelect
        label='Sort'
        options={sortOptions}
        value={sort}
        setValue={setSort}
        size='small'
      />
      <b>Filter recipes</b>
      <MultipleSelect
        label='Cusines'
        options={availableCuisines}
        selection={cuisines}
        setSelection={setCuisines}
      />
      {setCourse === undefined
        ? <MultipleSelect
            label='Courses'
            options={courseEnum}
            selection={types}
            setSelection={setTypes}
            disabled={setCourse}
          />
        : null
      }
      <MultipleSelect
        label='Tags'
        options={availableTags}
        selection={tags}
        setSelection={setTags}
      />
      <SliderBox>
        <span>Maximum cook time (mins)</span>
        <Slider
          aria-label="Temperature"
          value={maxTime}
          onChange={(e) => {
            setMaxTime(e.target.value);
          }}
          valueLabelDisplay="auto"
          step={10}
          min={30}
          max={120}
          marks={marks}
        />
      </SliderBox>
      <ButtonFlex>
        <ThemedButton onClick={reset}>
          Reset
        </ThemedButton>
        <ThemedButton variant='contained' onClick={filter}>
          Apply
        </ThemedButton>
      </ButtonFlex>
    </ModalBase>
  );
};

export default FilterModal;
