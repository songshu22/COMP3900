import React from "react";
import styled from "styled-components";
import FilterModal from "../modals/FilterModal";

import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import {styled as styledMUI, useTheme} from '@mui/material/styles';

// Style for the search bar form
const Bar = styled.form`
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  border-radius: 20px;
  border-width: 2px;
  border-color: ${(props) => (props.theme ? props.theme.palette.primary.main : 'black')};
  border-style: solid;
  padding-left: 12px;
  box-sizing: border-box;
`;

// Style for the MUI inputbase
const FlexInput = styledMUI(InputBase)(() => ({
  flex: 1,
  fontFamily: 'inherit',
}));

// Style for the dense IconButton
const DenseButton = styledMUI(IconButton)(() => ({
  padding: '4px',
}));

// Main browsing searchbar component with built in filtering functionality
// recipes: the complete set of available recipes
// setDisplayed: setter for recipes to display after search/filter
// setCourse: optional to prevent changes to the course selection
const SearchBar = ({recipes, setDisplayed, setCourse}) => {
  const theme = useTheme();
  const [modal, setModal] = React.useState(false);
  const [search, setSearch] = React.useState('');

  // Search and filter states
  const [filtered, setFiltered] = React.useState([]);
  const [searched, setSearched] = React.useState([]);
  const [filtering, setFiltering] = React.useState(false);

  // If the main list of recipes changes, reset the results
  React.useEffect(() => {
    setFiltered(recipes);
    setSearched(recipes);
  }, [recipes]);

  // Handles concurrent updates via searches and filtering
  React.useEffect(() => {
    const toDisplay = [];

    // Propogate any changes to either filtered or searched and combine them
    filtered.forEach((recipe) => {
      if (searched.includes(recipe)) {
        toDisplay.push(recipe);
      }
    });

    setDisplayed(toDisplay);
  }, [filtered, searched]);

  // Search function to filter recipes by title
  const applySearch = () => {
    const searched = recipes.filter((elm) => {
      return (elm.title.toLowerCase().includes(search.toLowerCase()));
    });

    setSearched(searched);
  };


  return (
    <React.Fragment>
      <Bar theme={theme}>
        <FlexInput
          placeholder="Browse recipes..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
        <DenseButton
          onClick={() => {
            setModal(true);
          }}
          aria-label='filter'
        >
          <FilterListIcon 
            color={filtering ? 'primary' : 'inherit'}
          />
        </DenseButton>
        <DenseButton
          type='submit'
          aria-label='search'
          onClick={(e) => {
            applySearch();
            e.preventDefault();
          }}
        >
          <SearchIcon />
        </DenseButton>
      </Bar>
      {/* Popup modal for filter and sort options */}
      <FilterModal
        open={modal}
        onClose={() => {
          setModal(false);
        }}
        recipes={recipes}
        setFiltered={setFiltered}
        setFiltering={setFiltering}
        setCourse={setCourse}
      />
    </React.Fragment>
  );
};

export default SearchBar;
