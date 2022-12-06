import React from 'react';

// Custom local storage hook
// key: the local storage key to use
// defaultValue: the default storage value if not exists
const useLocalStorage = (key, defaultValue) => {
  // State item to return to user
  const [value, setValue] = React.useState(() => {
    let val = defaultValue;
    try {
      // Try to read the serialised local storage value
      val = JSON.parse(localStorage.getItem(key));
    } catch {
      console.warn(`Failed to load ${key}`);
    }
    return val;
  });

  // If state changes, update the local storage to reflect this
  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);

  return [value, setValue];
};

export default useLocalStorage;
