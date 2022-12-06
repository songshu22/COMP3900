import styled from "styled-components";
import PersonIcon from '@mui/icons-material/Person';

// Style for a guest list outer container
const GuestFlex = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  gap: 15px;
`;

// Style for a guest's internal elements
const GuestItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
  text-align: center;

  & > svg {
    font-size: 3rem;
  }

  & > span {
    font-size: 1rem;
    margin-top: -2px;
  }

  & > .host {
    color: #9f4282;
  }
`;

// Display grid for a list of guests
// guests: the array of guests to display
// hostId: the ID of the host, so they can be marked
const GuestView = ({guests, hostId}) => {
  return (
    <GuestFlex>
      {guests.sort((a, b) => {
        // Sort guests alphabetically, but always prioritise the host
        if (a.id === hostId) {
          return -1;
        } else {
          return a.name.localeCompare(b.name);
        }
      }).map((guest, idx) => {
        return (
          <GuestItem key={idx}>
            <PersonIcon
              className={guest.id === hostId ? 'host' : null}
            />
            <span>{guest.name}</span>
          </GuestItem>
        );
      })
      }
    </GuestFlex>
  );
};

export default GuestView;
