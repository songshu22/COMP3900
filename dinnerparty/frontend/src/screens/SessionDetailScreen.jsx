import React from 'react';
import FullScreen from "./FullScreen";
import styled from "styled-components";
import CourseGrid from '../components/CourseGrid';
import RecipeScreen from './RecipeScreen';
import IngredientList from '../components/IngredientList';
import { useNavigate, useParams } from "react-router-dom";
import { StoreContext } from '../utilities/Store';
import apiFetch from '../utilities/apiFetch';
import GuestView from '../components/GuestView';
import ContributionList from '../components/ContributionList';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';

// Style for the session title
const SessionTitle = styled.div`
  font-size: 2.2rem;
  overflow: none;
  text-overflow: ellipsis;
  word-wrap: break-word;
`;

// Style for the session's date
const SessionDate = styled.div`
  font-size: 1.4rem;
  color: dimgray;
  margin-top: -20px;
`;

// Style for session metadata item container
const MetaFlex = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  column-gap: 20px;
  row-gap: 10px;
`;

// Style for session metadata item
const MetaItem = styled.div`
  display: flex;
  gap: 8px;
`;

// Style for session subheadings
const SubHeading = styled.span`
  font-size: 1.5rem;
`;

// Date string display options
const dateOptions = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};

// Time string display options
const timeOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
};

// Session detail view screen component (when user clicks session)
// session: the session object to display
// onClose: handler function for view closing
const SessionDetailScreen = ({session, onClose}) => {
  const navigate = useNavigate();
  const params = useParams();
  const context = React.useContext(StoreContext);
  const [cache, setCache] = context.cache;
  const [token] = context.token;
  const [, setAlert] = context.alert;

  // Session display states
  const [showRecipe, setShowRecipe] = React.useState(null);
  const [displayed, setDisplayed] = React.useState(session);

  // Session course states
  const [starters, setStarters] = React.useState([]);
  const [mains, setMains] = React.useState([]);
  const [desserts, setDesserts] = React.useState([]);

  // Handling function for updating ingredient contributions
  const updateContribution = async () => {
    if (displayed && displayed.can_contribute) {
      // Do AJAX requests
      const data = await apiFetch('GET', 
      `sessions/code/sync/${displayed.session_code}/`, null, token);
      if (data.ok) {
        // Consider updating the ingredient list
        const editedIngredients = {};

        // Convert the ingredient delta list to a dict for better time cmplx
        data.ingredient_list.forEach((ing) => {
          editedIngredients[ing.id] = ing.user_id;
        });

        // Merge the changes into the existing ingredient list
        const newIngredients = displayed.ingredient_list.map((ing) => {
          if (ing.id in editedIngredients) {
            ing.user_id = editedIngredients[ing.id];
          }
          return ing;
        });

        // Refresh the recipe's ingredients & contribution status
        setDisplayed({...displayed,
          ingredient_list: newIngredients,
          can_contribute: data.can_contribute,
        });
      }
    }
  };

  // Load function for fetching a full session object
  const getSession = async (id) => {
    const data = await apiFetch('GET', `sessions/${id}/`, null, token);
    if (data.ok) {
      setDisplayed(data);
    } else {
      setAlert({text: data.error});
    }
  };

  // On load, check the cache and check if a load is required
  React.useEffect(() => {
    let id = null;
    if (params && params.sessionId) {
      // Get params
      id = parseInt(params.sessionId);
    } else if (session && session.id) {
      id = session.id;
    }

    // If cache is provided, display the cached data first
    if (cache && id && cache.id === id) {
      setDisplayed(cache);
    }

    // Load live session if cache is not complete
    if (id && !(cache && cache.full)) {
      getSession(id);
    }

    // On exit, clear cache
    return (() => {
      setCache(null);
    });
  }, []);

  // When displayed recipe is updated, update the dependent states
  React.useEffect(() => {
    if (displayed && displayed.recipes) {
      const newStarters = [];
      const newMains = [];
      const newDesserts = [];

      // Recompile the split up recipe arrays
      displayed.recipes.forEach((recipe) => {
        switch (recipe.course) {
          case "0":
            newStarters.push(recipe);
            break;
          case "1":
            newMains.push(recipe);
            break;
          case "2":
            newDesserts.push(recipe);
            break;
        }
      });

      setStarters(newStarters);
      setMains(newMains);
      setDesserts(newDesserts);
    }

    // Set timer for AJAX
    const timer = setInterval(updateContribution, 5000);

    return (() => {
      // Dispose of the timer on dismount
      if (timer) {
        clearInterval(timer);
      }
    });
  }, [displayed]);

  return (
    <FullScreen onClose={onClose ? onClose : () => {
      navigate(-1);
    }} >
      {displayed && displayed.session_name
        ? <SessionTitle>{displayed.session_name}</SessionTitle>
        : null
      }
      {displayed && displayed.session_date ?
        <SessionDate>
          {new Date(Date.parse(displayed.session_date))
          .toLocaleDateString('en-AU', dateOptions)}
        </SessionDate> :
        null
      }
      <MetaFlex>
        {displayed && displayed.session_start_time && displayed.session_end_time
          ? <MetaItem>
              <AccessTimeIcon />
              <span>
                {new Date(Date.parse(displayed.session_start_time))
                .toLocaleTimeString('en-AU', timeOptions)}
                &nbsp;&nbsp;–&nbsp;&nbsp;
                {new Date(Date.parse(displayed.session_end_time))
                .toLocaleTimeString('en-AU', timeOptions)}
              </span>
            </MetaItem>
          : null
        }
        {displayed && displayed.host_user_id ?
          <MetaItem>
            <LocalPoliceIcon />
            {displayed.guests.filter((guest) => {
              return guest.id === displayed.host_user_id;
            })[0].name}
          </MetaItem> :
          null
        }      
      </MetaFlex>
      {/* Menu */}
      {starters.length ?
        <CourseGrid 
          title='Starters'
          recipes={starters}
          onClick={setShowRecipe}
        /> :
        null
      }
      {mains.length ?
        <CourseGrid 
          title='Mains'
          recipes={mains}
          onClick={setShowRecipe}
        /> :
        null
      }
      {desserts.length ?
        <CourseGrid 
          title='Desserts'
          recipes={desserts}
          onClick={setShowRecipe}
        /> :
        null
      }
      <SubHeading>Guests</SubHeading>
      {displayed && displayed.guests ? 
        <GuestView
          guests={displayed.guests}
          hostId={displayed.host_user_id}
        /> :
        null
      }
      <SubHeading>Ingredient List</SubHeading>
      {displayed && displayed.ingredient_list && displayed.session_code ?
        <ContributionList session={displayed} /> :
        null
      }

      {/* show a shopping list of remaining ings when contribution closes */}
      {displayed && displayed.ingredient_list && !displayed.can_contribute ?
        <React.Fragment>
          <SubHeading>Shopping List</SubHeading>
          <IngredientList 
            list={displayed.ingredient_list.filter((ing) => {
              return ing.user_id === -1;
            })}
            disabled
          />
        </React.Fragment>:
        null
      }
      {displayed && displayed.session_code && displayed.can_contribute ?
        <SubHeading>
          {`Share code: ${displayed.session_code.toUpperCase()}`}
        </SubHeading>:
        null
      }
      
      {/* built-in recipe detail screen to prevent redirects */}
      {showRecipe
        ? <RecipeScreen
            recipe={showRecipe} 
            onClose={() => {
              setShowRecipe(null);
            }}
          />   
        : null
      }
    </FullScreen>
  );
};

export default SessionDetailScreen;
