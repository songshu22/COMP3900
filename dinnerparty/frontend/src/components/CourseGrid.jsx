import styled from "styled-components";
import AddCard from "./cards/AddCard";
import RecipeCard from "./cards/RecipeCard";

// Grid style for recipe card display
const Grid = styled.div`
  width: 100%;
  overflow: auto;
  display: flex;
  gap: 10px;

  & > * {
    flex-shrink: 0;
  }
`;

// Style for course title
const CourseTitle = styled.span`
  font-size: 1.5rem;
`;

// Style for course 
const CourseRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

// Grid style display for a course containing recipes
// recipes: the recipes to display
// addRecipe: callback function to add a recipe for the course
// title: the UI title to display for this course
// setRecipes: setter function for the recipe list for removal of recipes
// onClick: custom onClick function for recipe browsing or selection
const CourseGrid = ({recipes, addRecipe, title, setRecipes, onClick}) => {

  // Removes recipe from the recipe array
  const removeRecipe = (idx) => {
    const tmp = [...recipes];
    tmp.splice(idx);
    setRecipes(tmp);
  }

  return (
    <CourseRow>
      <CourseTitle>{title}</CourseTitle>
      <Grid>
      {recipes.map((recipe, idx) => {
        return (
          <RecipeCard
            recipe={recipe}
            key={idx}
            removeFn={setRecipes ?
              (() => {
              removeRecipe(idx);
              }) :
              undefined
            }
            onClick={onClick ?
              (() => {
                onClick(recipe);
              }):
              undefined
            }
          />
        );
      })}
      {addRecipe ?
        <AddCard onClick={addRecipe} /> :
        null
      }
    </Grid>
    </CourseRow>
  )
};

export default CourseGrid;
