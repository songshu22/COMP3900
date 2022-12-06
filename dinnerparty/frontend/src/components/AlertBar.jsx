import React from 'react';
import { StoreContext } from '../utilities/Store';

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { styled as styledMUI } from '@mui/material/styles';

// Used to style the alert as filled (copied from MUI ref)
const Alert = React.forwardRef(function Alert (props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />;
});

// Style for alert bar size
const FullAlert = styledMUI(Alert)`
  width: 100%;
  marginBottom: 50px;
`;

// Component for floating alert bar (pinned to bottom)
const AlertBar = () => {
  const context = React.useContext(StoreContext);
  const [alert, setAlert] = context.alert;

  // Close handler function
  const closeAlert = () => {
    setAlert(null);
  };

  return (
    <Snackbar
      open={Boolean(alert)}
      autoHideDuration={6000}
      onClose={closeAlert}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      {alert ?
        <FullAlert
          onClose={closeAlert}
          severity={alert.severity ? alert.severity : 'error'}
          sx={{ width: '100%', marginBottom: '50px' }}
        >
          {alert.text}
        </FullAlert> :
        null
      }
    </Snackbar>
  )
};

export default AlertBar;
