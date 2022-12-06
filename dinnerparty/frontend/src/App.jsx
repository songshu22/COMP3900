import React from 'react';
import logo from './assets/logo.svg';
import './App.css';
import styled from 'styled-components';
import {BrowserRouter, Routes, Route,
  Navigate} from 'react-router-dom';

import Navbar from './components/Navbar';
import LoginModal from './modals/LoginModal';
import AlertBar from './components/AlertBar';
import StoreProvider from './utilities/Store';
import WelcomeModal from './modals/WelcomeModal';
import RecipeScreen from './screens/RecipeScreen';
import BrowseScreen from './screens/BrowseScreen';
import RegisterModal from './modals/RegisterModal';
import AccountScreen from './screens/AccountScreen';
import SessionScreen from './screens/SessionScreen';
import SessionDetailScreen from './screens/SessionDetailScreen';
import CreateSessionScreen from './screens/CreateSessionScreen'
import RecipeContributeScreen from './screens/RecipeContributeScreen';
import {createTheme, ThemeProvider} from '@mui/material/styles';

// DinnerParty colour theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#9f4282',
    },
    secondary: {
      main: '#f7e8c4',
    },
    focused: {
      main: 'orange',
    },
  },
});

// Style for root container that wraps all content
const RootContainer = styled.div`
  width: calc(100% - 60px);
  max-width: 1260px;
  height: calc(100% - 20px);
  background-color: ${theme.palette.secondary.main};
  padding: 20px 30px 0px 30px;
  margin: 0 auto;
`;

// Style for DinnerParty logo container
const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  height: 6.5vh;
  margin: 12px 0 24px;
`;

// Style for DinnerParty logo
const LogoImg = styled.img`
  height: 100%;
`;

function App() {
  // State for highest-level multi-modal display
  const [modal, setModal] = React.useState('welcome');

  return (
    <StoreProvider>
      <ThemeProvider theme={ theme }>
        <RootContainer>
          <BrowserRouter>
            <LogoContainer>
              <LogoImg src={logo} alt='DinnerParty Logo'/>
            </LogoContainer>
            <Routes>
              <Route path='/browse/:recipeId' element={ <RecipeScreen /> } />
              <Route path='/browse' element={ <BrowseScreen /> } />
              <Route path='/sessions/:sessionId' element={ <SessionDetailScreen /> } />
              <Route path='/sessions/create' element={ <CreateSessionScreen /> } />
              <Route path='/sessions' element={ <SessionScreen /> } />
              <Route
                path='/account'
                element={ <AccountScreen setModal={setModal} /> }
                />
              <Route
                path='/recipe/contribute'
                element= { <RecipeContributeScreen /> }
              />
              <Route path='/' element={ <Navigate to='/browse' /> } />
              <Route path='*' element={ <h1>404</h1> } />
            </Routes>
            <Navbar />
            <WelcomeModal 
              open={modal == "welcome"}
              onClose={(target) => {
                setModal(target);
              }}
            />
            <LoginModal
              open={modal == "login"}
              onClose={() => {
                setModal(null);
              }}
            />
            <RegisterModal
              open={modal == "register"}
              onClose={() => {
                setModal(null);
              }}
            />
            <AlertBar />
          </BrowserRouter>
        </RootContainer>
      </ThemeProvider>
    </StoreProvider>
  );
}

export default App;
