import styled from "styled-components";
import RecipeCard from '../components/cards/RecipeCard';

// Grid style
const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

// Grid component for displaying all recipes for browsing
// recipes: list of recipes to display
// onClick: override onClick function for clicked recipes
const RecipeGrid = ({recipes, onClick, children}) => {
 return (
  <Grid>
    {recipes.map((recipe, idx) => {
      return (
        <RecipeCard
          recipe={recipe}
          key={idx}
          onClick={() => {onClick(recipe)}}
        />
      );
    })}
    {children}
  </Grid>
 );
};

export default RecipeGrid;
