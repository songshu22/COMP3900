import React from 'react';
import Done from './steps/Done';
import styled from 'styled-components';
import FullScreen from './FullScreen';
import InfoForm from './steps/InfoForm';
import GuestForm from './steps/GuestForm';
import RecipeForm from './steps/RecipeForm';
import IngredientsForm from './steps/IngredientsForm';
import { useNavigate } from 'react-router-dom';
import apiFetch from '../utilities/apiFetch';
import { StoreContext } from '../utilities/Store';

import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import PeopleIcon from '@mui/icons-material/People';
import SetMealIcon from '@mui/icons-material/SetMeal';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {styled as styledMUI, useTheme} from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

// Step icon array for status display
const stepIcons = [
  <AccessTimeIcon key='0'/>,
  <PeopleIcon key='1'/>,
  <SetMealIcon key='2'/>,
  <FormatListBulletedIcon key='3'/>,
  <CheckCircleIcon key='4'/>,
];

// Style for top step status indicator
const StepIndicator = styled.div`
  width: 100%;
  height: 60px;
  display: flex;
  gap: 5px;
  justify-content: space-between;
  align-items: center;

  & > button {
    padding: 0;
  }

  & > svg, & > * > svg {
    font-size: 2.5rem;
  }

  & > .arrow {
    flex-shrink: 1;
    max-width: 40px;
  }

  & > .active {
    opacity: 1;
    color: ${(props) => (props.theme ? props.theme.palette.primary.main : '')};
  }

`;

// Style for the proceed FAB
const NextFab = styledMUI(Fab)(() => ({
  position: 'fixed',
  bottom: 25,
  right: 25,
}));

// Create session screen component
const CreateSessionScreen = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const context = React.useContext(StoreContext);
  const [token] = context.token;
  const [, setAlert] = context.alert;

  // Session attribute states
  const [step, setStep] = React.useState(0);
  const [valid, setValid] = React.useState(false);
  const [details, setDetails] = React.useState({
    name: '',
    date: '',
    start: '',
    end: '',
    collect: '',
  });
  const [guests, setGuests] = React.useState([]);
  const [hideFab, setHideFab] = React.useState(false);
  const [menu, setMenu] = React.useState({});
  const [ingredients, setIngredients] = React.useState([]);

  // Form submission function to create a new session
  const submit = async () => {
    // Compile and reformat recipes
    const recipes = [];
    Object.keys(menu).forEach((key) => {
      menu[key].forEach((recipe) => {
        recipes.push(recipe.id);
      });
    });

    // Strip blank guests
    const guestList = [];
    guests.forEach((guest) => {
      if (guest.name && guest.email) {
        guestList.push(guest);
      }
    });

    // Compile and reformat ingredient list
    const ingredientList = [];
    ingredients.forEach((ing) => {
      ingredientList.push({
        ingredient_id: ing.id,
        qty: ing.qty,
      });
    });

    // Format and validate dates
    const date = new Date(details.date);
    const start = new Date(`${details.date} ${details.start}`);
    const end = new Date(`${details.date} ${details.end}`);
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }

    // Reformat for compliance with API schema
    const session = {
      session_name: details.name,
      session_date: date.toISOString(),
      session_start_time: start.toISOString(),
      session_end_time: end.toISOString(),
      contribution_limit_time: parseInt(details.collect),
      recipes,
      guest_list: guestList,
      ingredient_list: ingredientList,
    };

    // Make the request to the backend
    setValid(false);
    const data = await apiFetch('POST', 'sessions/create/', session, token);
    if (data.ok) {
      // Session created
      setAlert({text: 'Session created. Get cooking!', severity: 'success'});
      return true;
    } else {
      // Failed. Allow resubmission
      setAlert({text: data.error});
      setValid(true);
    }

    return false;
  };

  // Handler to proceed to the next step of the form
  const nextStep = async () => {
    let res = true;

    const now = new Date();
    const start = new Date(`${details.date} ${details.start}`);

    // Switch for special condition checking for any particular steps
    switch (step) {
      case 0:
        // Check start time is not in the past
        if (start < now) {
          res = false;
          setAlert({text: 'Session start time can not be in the past'});
        }

        // Check collect time is not negative
        if (details.collect < 0) {
          res = false;
          setAlert({text: 'Collection time can not be negative'});
        }
        break;
      case 1:
        break;
      case 2:
        break;
      case 3:
        // Try submission request
        res = await submit();
        break;
      default:
        // Form completed, allow proceed
        res = true;
        navigate(-1);
    }

    // Set the current step and reset validity
    if (res) {
      setStep(step + 1);
      setValid(false);
    }
  };

  // Handle navigation backwards to a previous step
  const prevStep = (target) => {
    if (target !== step) {
      setStep(target);
    } 
  };

  // Returns a subform depending on the step state
  const stepSwitch = (next) => {
    switch(next) {
      case 0:
        return (
          <InfoForm
            details={details}
            setDetails={setDetails}
            setValid={setValid}
          />
        );
      case 1:
        return (
          <GuestForm
            guests={guests}
            setGuests={setGuests}
            setValid={setValid}
          />
        );
      case 2:
        return (
          <RecipeForm
            menu={menu}
            setMenu={setMenu}
            setHideFab={setHideFab}
            setValid={setValid}
          />
        );
      case 3:
        return (
          <IngredientsForm 
            menu={menu}
            guests={guests}
            ingredients={ingredients}
            setIngredients={setIngredients}
            setValid={setValid}
          />
        );
      default:
        return <Done />;
    }
  };

  return (
    <FullScreen>
      <StepIndicator theme={theme}>
        {stepIcons.map((icon, idx) => {
          return (
            <React.Fragment key={idx}>
              <IconButton
                onClick={() => {
                  prevStep(idx);
                }}
                disabled={idx > step && step !== 4}
                className={idx === step ? 'active' : ''}
              >
                {icon}
              </IconButton>
              {idx !== stepIcons.length - 1
                ? <ArrowRightIcon
                    className={`arrow ${idx === step ? 'active' : ''}`}
                  />
                : null
              }
            </React.Fragment>
          );
        })}
      </StepIndicator>
      {stepSwitch(step)}
      {!hideFab
        ? <NextFab
            color='primary'
            disabled={!valid && step !== 4}
            onClick={nextStep}
            aria-label='next'
          >
            <ChevronRightIcon />
          </NextFab>
        : null
      }
    </FullScreen>
  );
};

export default CreateSessionScreen;
