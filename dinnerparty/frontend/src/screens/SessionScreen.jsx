import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

import Screen from './Screen';
import { StoreContext } from '../utilities/Store';
import apiFetch from '../utilities/apiFetch';
import AdCard from '../components/cards/AdCard';
import SessionCard from '../components/cards/SessionCard';
import CodeHandler from '../components/CodeHandler';

// Style for session screen titles
const Title = styled.div`
  font-size: 2em;
  margin: 25px 0px 10px;
`;

// Style for session card flexes
const BigCardFlex = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

// Style for full width shell containers
const FullWidth = styled.div`
  width: 100%;
  margin-right: auto;
`;

// User sessions screen component
const SessionScreen = () => {
  const navigate = useNavigate();
  const context = React.useContext(StoreContext);
  const [token] = context.token;
  const [, setPage] = context.page;
  const [, setAlert] = context.alert;

  // Session states
  const [sessions, setSessions] = React.useState([]);
  const [active, setActive] = React.useState([]);
  const [past, setPast] = React.useState([]);

  // Loads the user's sessions from the server
  const loadSessions = async () => {
    const data = await apiFetch('GET', 'user/sessions/', null, token);
    if (data.ok) {
      setSessions(data.sessions);
    } else {
      setAlert({text: data.error});
    }
  };

  // On load, load the user's sessions from the server
  React.useEffect(() => {
    if (token) {
      loadSessions();
    } 
  }, []);

  // Filter and process sessions
  React.useEffect(() => {
    const now = new Date();
    let current = [];
    let inactive = [];

    // Split up active and past sessions based on current time
    sessions.forEach((session) => {
      const end = new Date(Date.parse(session.session_end_time));
      if (end > now) {
        current.push(session);
      } else {
        inactive.push(session);
      }
    });

    // Sort active sessions by most recent starting
    current = current.sort((a, b) => {
      return a.session_start_time.localeCompare(b.session_start_time);
    })

    // Sort past sessions by most recent ending
    inactive = inactive.sort((a, b) => {
      return b.session_end_time.localeCompare(a.session_end_time);
    })

    setActive(current);
    setPast(inactive);
  }, [sessions]);

  return (
    <Screen>
      <Title>Active sessions</Title>
      <BigCardFlex>
        <FullWidth><CodeHandler /></FullWidth>
        { token ?
          <React.Fragment>
            <AdCard
              text='Host your own'
              onClick={() => {
                navigate('/sessions/create');
              }}
            />
            {active.map((session, idx) => {
              return (
                <SessionCard
                  session={session}
                  key={idx}
                />
              );
            })}
          </React.Fragment> :
          <AdCard
            text='Sign in to host'
            onClick={() => {
              setPage('account');
            }}
          />
        }
      </BigCardFlex>
      <Title>Past sessions</Title>
      <BigCardFlex>
        { past.length ?
          past.map((session, idx) => {
            return (
              <SessionCard
                session={session}
                key={idx}
              />
            );
          }) :
          <span>Nothing to see here...</span>
        }
      </BigCardFlex>
    </Screen>
  );
};

export default SessionScreen;
