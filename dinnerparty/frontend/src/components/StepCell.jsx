import styled from 'styled-components';
import {Draggable} from 'react-beautiful-dnd';
import DragHandleIcon from '@mui/icons-material/DragHandle';

// Style for step cell container and inside template text
const StepContainer = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid grey;
  padding-bottom: 3px;
  margin-bottom: 7px;

  & > div {
    max-width: 90%;
  }

  & > div > span {
    word-wrap: break-word;
  }

  & > svg {
    color: dimgray;
  }
`;

// Component for recipe step cell for use inside step list
// With drag and drop functionality refs
const StepCell = ({step, index}) => {
  return (
    <Draggable draggableId={step.id} index={index}>
      {(provided) => {
        return (
          // Boilerplate react-beautiful-dnd requirements
          <StepContainer
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
          >
            <div>
              <b>{index + 1}.&nbsp;</b>
              <span>{step.text}</span>
            </div>
            <DragHandleIcon />
          </StepContainer>
        );
      }}
    </Draggable>
  );
};

export default StepCell;
