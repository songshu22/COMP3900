import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import Tag from "../components/Tag";
import TagModal from "../modals/TagModal";
import apiFetch from "../utilities/apiFetch";
import StepList from "../components/StepList";
import AddIcon from "@mui/icons-material/Add";
import { StoreContext } from "../utilities/Store";
import ImagePicker from "../components/ImagePicker";
import ThemedButton from "../components/ThemedButton";
import SortedSelect from "../components/SortedSelect";
import IngredientList from "../components/IngredientList";
import ThemedTextInput from "../components/ThemedTextInput";
import AddIngredientModal from "../modals/AddIngredientModal";
import { tagEnum, cuisineEnum, courseEnum } from "../assets/enums";

import IngredientAutocomplete from "../components/IngredientAutocomplete";

// Style for the tag flex container
const TagFlex = styled.div`
  display: flex;
  column-gap: 12px;
  row-gap: 6px;
  flex-wrap: wrap;
`;

// Style for section subheadings
const SubHeading = styled.div`
  font-size: 1.5rem;
`;

// Style for the outer step container
const AddStepContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

// Style for right aligned flex button
const RightButton = styled.div`
  width: 100%;
  max-width: 800px;
  display: flex;
  justify-content: flex-end;
`;

// Recipe contribution and update form component
// preload: a recipe object to load for updating
// onClose: handler function for closing the form
const CreateRecipeForm = ({preload, onClose}) => {
  // States for modal display
  const [modal, setModal] = React.useState(null);
  const [refresh, setRefresh] = React.useState(false);

  // Various states for each of the recipe's attributes
  const [title, setTitle] = React.useState('');
  const [cuisine, setCuisine] = React.useState('');
  const [type, setType] = React.useState('');
  const [cooktime, setCooktime] = React.useState('');
  const [tags, setTags] = React.useState([]);
  const [ingredientList, setIngredientList] = React.useState([]);
  const [stepList, setStepList] = React.useState([]);
  const [img, setImg] = React.useState(null);

  // States for step listing
  const [step, setStep] = React.useState("");
  const [stepIndex, setStepIndex] = React.useState(0);

  // General form states
  const navigate = useNavigate();
  const context = React.useContext(StoreContext);
  const [token] = context.token;
  const [, setAlert] = context.alert;
  const [allowSubmit, setAllowSubmit] = React.useState(false);

  // Prepare and attempt to make the request to the server
  const contributeRecipe = async () => {
    // Reformat the steps and ingredients for use with API
    const backendSteps = stepList.map((step) => step.text);
    const backendIngredients = ingredientList.map((ing) => {
      return {ingredient: ing.id, qty: parseFloat(ing.qty)}
    });

    // Request body
    const body = {
      title,
      cuisine,
      tags: tags,
      ingredients: backendIngredients,
      steps: backendSteps,
      cook_time: cooktime,
      course: type,
      image: img,
    };

    // Block double submission
    const prevState = allowSubmit;
    setAllowSubmit(false);

    // Handle update or publishing new recipe
    if (!preload) {
      // New recipe case
      const data = await apiFetch('POST', 'recipes/contribute/', body, token);
      if (data.ok) {
        // New recipe published
        navigate('/browse');
        setAlert({text: 'Recipe contributed. Thanks!', severity: 'success'});
      } else {
        // Failed to publish. Allow retry
        setAlert({text: data.error});
        setAllowSubmit(prevState);
      }
    } else {
      // Update recipe case
      body.id = preload.id;
      const data = await apiFetch('PUT', `recipes/update/`, body, token);
      if (data.ok) {
        // Recipe updated
        onClose();
        setAlert({text: 'Recipe updated!', severity: 'success'});
      } else {
        // Failed to publish. Allow retry
        setAlert({text: data.error});
        setAllowSubmit(prevState);
      }
    }
  };

  // On load, unpack a recipe in the case of updating a recipe
  React.useEffect(() => {
    // Abort if no recipe to unpack
    if (!preload) {
      return;
    }

    // Unpack the recipe to update
    setTitle(preload.title);
    setCuisine(preload.cuisine);
    setType(preload.course);
    setCooktime(preload.cook_time);
    setImg(preload.image);
    setTags(preload.tags);

    // Unpack ingredients
    setIngredientList(preload.ingredients.map((ing) => {
      return {...ing, id: ing.ingredient, name: ing.ingredient_name};
    }));

    // Unpack steps
    setStepList(preload.steps.map((step, idx) => {
      return {id: `step-${idx}`, text: step,}
    }));
    setStepIndex(preload.steps.length + 1);
  }, []);

  // If any attributes are edited, check form validity
  React.useEffect(() => {
    let invalid = false;
    ingredientList.forEach((ing) => {
      if (!ing.qty) {
        // If a qty is not provided, invalidate
        invalid = true;
      }
    });

    if (invalid) {
      setAllowSubmit(false);
      return;
    }

    // Prevent submission if any fields are invalid
    setAllowSubmit(img && title && cuisine && type && cooktime && 
    !isNaN(cooktime) && ingredientList.length && stepList.length);
  }, [img, title, cuisine, type, cooktime, ingredientList, stepList]);

  // Function for adding a tag to the tag list
  const addTag = (key) => {
    if (!(key in tagEnum)) {
      // Abort if tag already exists
      return;
    }

    // Append the tag to the list & sort alphabetically
    if (!tags.includes(key)) {
      setTags([...tags, key].sort((a, b) => a.localeCompare(b)));
    }
  };

  // Add an ingredient to the ingredient list
  const addIngredient = (ing) => {
    setIngredientList([...ingredientList, { ...ing, qty: "" }]);
  };

  // Add a step to the step list
  const addStep = () => {
    if (!step) {
      return;
    }

    // Format keys for use with dnd
    setStepList([
      ...stepList,
      {
        id: `step-${stepIndex}`,
        text: step,
      },
    ]);
    setStep("");
    setStepIndex(stepIndex + 1);
  };

  return (
    <React.Fragment>
      <ImagePicker
        img={img}
        setImg={setImg}
      />
      <ThemedTextInput
        placeholder="Enter recipe title"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
        }}
        variant="standard"
        fullWidth
      />
      <SortedSelect
        label="Cuisine"
        value={cuisine}
        setValue={setCuisine}
        options={cuisineEnum}
      />
      <SortedSelect
        label="Course"
        value={type}
        setValue={setType}
        options={courseEnum}
      />
      <ThemedTextInput
        label="Cook time (mins)"
        type="number"
        value={cooktime}
        onChange={(e) => {
          setCooktime(e.target.value);
        }}
        min={0}
        max={720}
        size="small"
      />
      <TagFlex>
        <b>Tags:</b>
        {tags.map((tag) => {
          return (
            <Tag
              text={tagEnum[tag]}
              color="orange"
              onClick={() => {
                setTags(
                  tags.filter((tagg) => {
                    return tagg !== tag;
                  })
                );
              }}
              key={tag}
            />
          );
        })}
        <Tag
          text="Add a tag"
          icon={<AddIcon />}
          color="green"
          onClick={() => {
            setModal("tags");
          }}
        />
      </TagFlex>
      <SubHeading>Ingredients</SubHeading>
      <IngredientAutocomplete
        onSelect={(ing) => {
          addIngredient(ing);
        }}
        newIng={() => {
          setModal("ingredient");
        }}
        selected={ingredientList}
        refresh={refresh}
        setRefresh={setRefresh}
      />
      <IngredientList list={ingredientList} setList={setIngredientList} />
      <SubHeading>Method</SubHeading>
      <AddStepContainer>
        <ThemedTextInput
          label="Add a step"
          size="small"
          value={step}
          onChange={(e) => {
            // Reject newlines in the step field
            if (/\n/.exec(e.target.value)) {
              // Instead, add the step
              addStep();
            } else {
              setStep(e.target.value);
            }
          }}
          multiline
          fullWidth
        />
        <RightButton>
          <ThemedButton
            disabled={!step}
            onClick={addStep}
          >
            Add step
          </ThemedButton>
        </RightButton>
      </AddStepContainer>
      {stepList.length ? (
        <StepList steps={stepList} setSteps={setStepList} />
      ) : null}
      <ThemedButton
        disabled={!allowSubmit}
        onClick={contributeRecipe}
        variant="contained"
      >
        {preload ?
          'Update your recipe' : 
          'Publish recipe to DinnerParty'
        }
      </ThemedButton>
      <TagModal
        open={modal == "tags"}
        onClose={() => {
          setModal(null);
        }}
        addTag={addTag}
      />
      <AddIngredientModal
        open={modal == "ingredient"}
        onClose={() => {
          setModal(null);
        }}
        addIngredient={addIngredient}
        refreshFn={() => {
          setRefresh(true);
        }}
      />
    </React.Fragment>
  );
};

export default CreateRecipeForm;
