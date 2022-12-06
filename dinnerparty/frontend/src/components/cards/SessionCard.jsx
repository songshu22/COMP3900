import React from 'react';
import BigCard from "./BigCard";
import styled from "styled-components";
import { StoreContext } from '../../utilities/Store';

import Badge from '@mui/material/Badge';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

// Wrapper style for card internals
const Wrapper = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  padding: 12px;
  box-sizing: border-box;
  gap: 15px;
`;

// Left aligned session image style
const LeftImg = styled.img`
  height: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 10px;
`;

// Right aligned metadata style
const RightFlex = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
  overflow: hidden;
`;

// Session title style
const Title = styled.div`
  font-size: 1.4rem;
  font-weight: bold;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 100%;
`;

// Session datestring style
const DateText = styled.span`
  font-size: 1rem;
  color: dimgray;
`;

// Flex container for metadata items
const MetaFlex = styled.div`
  display: flex;
  flex-wrap: wrap;
  column-gap: 20px;
  justify-content: center;
`;

// Metadata item component style
const MetaItem = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  font-size: 1.1rem;
  
  & > svg {
    font-size: 1.1rem;
    padding-top: 3px;
  };

  &.host {
    color: #9f4282;
    font-weight: bold;
  }
`;

// Session card componenet for displaying and interacting with sessions
const SessionCard = ({session}) => {
  const navigate = useNavigate();
  const context = React.useContext(StoreContext);
  const [, setCache] = context.cache;

  const [dateStr, setDateStr] = React.useState('');

  React.useEffect(() => {
    if (session) {
      // Update the displayed session datetime strings using inbuilt JS Date
      const start = new Date(Date.parse(session.session_start_time));
      const options = { year: 'numeric', month: 'long', day: 'numeric',
        hour: 'numeric', minute: 'numeric' };
      setDateStr(start.toLocaleString('en-AU', options));
    }
  }, [session]);

  return (
      <BigCard
        onClick={() => {
          setCache(session);
          navigate(`/sessions/${session.id}`);
        }}
      >
        <Wrapper>
          {/* New session badge */}
          <Badge 
            badgeContent={"New!"} 
            color="primary" 
            invisible={session.is_new ? false : true} 
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <LeftImg src={session.highest_rated_recipe} />
          </Badge>
          <RightFlex>
            <Title>{session.name}</Title>
            <DateText>{dateStr}</DateText>
            <MetaFlex>
              {/* Number of guests meta item */}
              <MetaItem>
                <PeopleIcon />
                <span>{session.num_guests}</span>
              </MetaItem>
              {/* Prep time meta item */}
              <MetaItem>
                <AccessTimeIcon />
                <span>{`${session.prep_time} mins`}</span>
              </MetaItem>
              {/* Total cook time meta item */}
              <MetaItem>
                <FormatListBulletedIcon />
                <span>{session.recipes.length}</span>
              </MetaItem>
              {/* Hosting meta item */}
              {session.is_host ?
                <MetaItem className='host'>
                  <LocalPoliceIcon />
                  <span>Hosting</span>
                </MetaItem> :
                null  
              }
            </MetaFlex>
          </RightFlex>
        </Wrapper>
    </BigCard>
  );
};

export default SessionCard;
