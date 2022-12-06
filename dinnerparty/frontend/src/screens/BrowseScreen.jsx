import React from 'react';
import Screen from './Screen.jsx';
import RecipeBrowser from './RecipeBrowser';

// Browse screen component
const BrowseScreen = () => {
  return (
    <Screen>
      <RecipeBrowser redirect />
    </Screen>
  );
};

export default BrowseScreen;
