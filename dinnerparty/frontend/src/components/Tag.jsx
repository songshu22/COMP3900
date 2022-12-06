import styled from 'styled-components';

// Style for the tag element
const TagDiv = styled.div`
  display: flex;
  padding: 1px 8px;
  gap: 10px;
  font-size: 0.8em;
  border: 2px solid black;
  border-radius: 8px;
  background-color: ${(props) => (props.color ? props.color : '#9f4282' )};
  color: ${(props) => (props.invert ? 'black' : 'white')};
  cursor: ${(props) => (props.onClick ? 'pointer' : 'initial')};
  user-select: none;

  :active {
    border: 2px solid white;
  }

  /* when used inside a card */
  &.card {   
    @media (min-width: 900px) {
      font-size: 1em;
    }
  }

  /* when used as a rating tag */
  &.rate {
    display: none;
    justify-content: center;

    @media (min-width: 900px) {
      display: flex;
    }
  }
`;

// Style for icon container to align icon inside tag
const IconDiv = styled.div`
  height: 16px;
  font-size: 0.8em;
  margin-right: -4px;

  .MuiSvgIcon-root {
    font-size: 1.9em;
  }
`;

// Simple tag component for tag display
// text: tag text
// icon: tag icon
// color: tag CSS color
// onClick: optional click handler function
// invert: true for black text (default white)
// className: for passing through CSS classes
const Tag = ({text, icon, color, onClick, invert, className}) => {
  return (
    <TagDiv
      color={color}
      invert={invert}
      onClick={onClick}
      className={className}
    >
      <span>{text}</span>
      {icon ?
        <IconDiv>
          {icon}
        </IconDiv> :
        null
      }
    </TagDiv>
  );
};

export default Tag;
