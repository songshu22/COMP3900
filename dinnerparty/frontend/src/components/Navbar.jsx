import React from 'react';
import {StoreContext} from '../utilities/Store';
import {useNavigate} from 'react-router-dom';

import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { styled as styledMUI } from '@mui/material/styles';
import BottomNavigation from '@mui/material/BottomNavigation';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';

// Style for navbar action items
const NavAct = styledMUI(BottomNavigationAction)`
  padding-top: 0;

  & > .MuiBottomNavigationAction-label {
    display: none;
    opacity: 1;
  }

  @media (min-width: 900px) {
    flex-direction: row;
    gap: 15px;
    margin: 0 20px;

    & > .MuiBottomNavigationAction-label {
      display: initial;
      font-size: 1.2rem !important;
      font-family: 'Bree Serif';
      padding-bottom: 5px;
    }
  }
`;

// Bottom fixed navigation bar component
const Navbar = () => {
  const navigate = useNavigate();
  const context = React.useContext(StoreContext);
  const [page, setPage] = context.page;
  const [fullscreen] = context.fullscreen;
  const [init, setInit] = React.useState(true);

  // Sets the page on user change
  const handleNavigate = ( _, value ) => {
    setPage(value);
  };

  // Handles page changes
  React.useEffect(() => {
    if (!init) {
      // Navigate to the selected page
      navigate(`/${page}`);
    } else {
      // Find the current selection from the initialisation path
      const current = window.location.pathname;
      if (current.includes('account')) {
        setPage('account');
      } else if (current.includes('sessions')) {
        setPage('sessions');
      } else {
        setPage('browse');
      }
      setInit(false);
    }    
  }, [page]);

  return (
    <BottomNavigation
      sx={{
        bgcolor: 'secondary.main',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        opacity: 0.9,
        backdropFilter: 'blur(10px)',
        display: fullscreen ? 'none' : 'flex',
      }}
      value={ page }
      onChange={ handleNavigate }
    >
      <NavAct
        value="browse"
        icon={<SearchIcon />}
        label="Browse"
      />
      <NavAct
        value="sessions"
        icon={<CalendarTodayIcon />}
        label="Sessions"
      />
      <NavAct
        value="account"
        icon={<PersonIcon />}
        label="Account"
      />
    </BottomNavigation>
  );
};

export default Navbar;
