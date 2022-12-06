import React from 'react';
import StepCell from './StepCell';
import styled from 'styled-components';
import DeleteIcon from '@mui/icons-material/Delete';
import {DragDropContext, Droppable} from 'react-beautiful-dnd';

// Style for the hidden drag and drop delete area
const DeleteArea = styled.div`
  border: 2px dashed red;
  opacity: 0.6;
  border-radius: 5px;
  height: ${(props) => (props.dragging ? '60px' : 0)};
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  display: flex;
  visibility: ${(props) => (props.dragging ? 'visible' : 'hidden')};
  overflow: hidden;
  box-sizing: border-box;
`;

// External wrapper for the step list
const Wrapper = styled.div`
  max-width: 800px;
`;

// Component for list of recipe steps with drag and drop functionality
// steps: list of steps
// setSteps: setter for the list of steps
const StepList = ({steps, setSteps}) => {
  const [dragging, setDragging] = React.useState(false);

  // Function to handle changes after dragging ends
  const dragEndFn = ({destination, source}) => {
    setDragging(false);

    // If invalid destination, ignore it
    if (!destination) {
      return;
    }

    // If destination is the same as source, ignore it
    if (destination.droppableId === source.droppableId &&
      destination.index === source.index) {
      return;
    }

    // Remove the dragged step from the step list
    const newItems = Array.from(steps);
    const [removed] = newItems.splice(source.index, 1);

    // Handles case where it moves instead of being deleted
    if (destination.droppableId !== 'delete-area') {
      // Insert the dragged step back into the list at index
      newItems.splice(destination.index, 0, removed);
    }

    setSteps([...newItems]);
  };


  return (
    <Wrapper>
      <DragDropContext
        onDragStart={() => {
          setDragging(true);
        }}
        onDragEnd={dragEndFn}
      >
        <Droppable droppableId='list-area'>
          {(provided) => {
            return (
              // Boilerplate react-beautiful-dnd refs
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {steps.map((step, index) => {
                  return (
                    <StepCell
                      step={step}
                      index={index}
                      key={step.id}
                    />
                  );
                })}
                {provided.placeholder}
              </div>
            );
          }}
        </Droppable>
        <Droppable droppableId='delete-area'>
          {(provided) => {
            return (
              <DeleteArea
                {...provided.droppableProps}
                ref={provided.innerRef}
                dragging={dragging}
              >
                <DeleteIcon />
                Delete step
              </DeleteArea>
            );
          }}
        </Droppable>
      </DragDropContext>
    </Wrapper>
  );
};

export default StepList;
