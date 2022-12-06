import React from 'react';
import styled from 'styled-components';
import { StepTitle } from './StepStyles';
import ThemedTextInput from '../../components/ThemedTextInput';

// Style for the outer form wrapper
const FormBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 1.2rem;

  & > :first-child {
    padding-left: 5px;
  }

  & > em {
    font-size: 0.9rem;
    max-width: 800px;
  }
`;

// Style for the start-end time flex
const DateFlex = styled.div`
  display: flex;
  max-width: 800px;
  justify-content: space-between;
  align-items: center;

  & > b {
    padding-top: 25px;
  }
`;

// Subscreen component for session details form
// details: dictionary of session details to unpack
// setDetails: setter for session details
// setValid: callback function for validating form
const InfoForm = ({details, setDetails, setValid}) => {

  // Unpack the form details if loading or going back a step
  React.useEffect(() => {
    setValid(details.name && details.date && details.start && 
      details.end && details.collect);
  }, [details]);

  return (
    <React.Fragment>
      <StepTitle>Session Deets</StepTitle>
      <FormBox>
        <span>Session name</span>
        <ThemedTextInput
          type='text'
          value={details.name}
          onChange={(e) => {
            setDetails({...details, name: e.target.value});
          }}
          size='small'
        />
      </FormBox>
      <FormBox>
        <span>Session date</span>
        <ThemedTextInput
          type='date'
          value={details.date}
          onChange={(e) => {
            setDetails({...details, date: e.target.value});
          }}
          size='small'
        />
      </FormBox>
      <DateFlex>
        <FormBox>
          <span>Start time</span>
          <ThemedTextInput
            type='time'
            value={details.start}
            onChange={(e) => {
              setDetails({...details, start: e.target.value});
            }}
            size='small'
          />
        </FormBox>
        <b>—</b>
        <FormBox>
          <span>End time</span>
          <ThemedTextInput
            type='time'
            value={details.end}
            onChange={(e) => {
              setDetails({...details, end: e.target.value});
            }}
            size='small'
          />
        </FormBox>
      </DateFlex>
      <FormBox>
        <span>Ingredient collection end time (mins)</span>
        <ThemedTextInput
          type='number'
          value={details.collect}
          onChange={(e) => {
            setDetails({...details, collect: e.target.value});
          }}
          min={0}
          size='small'
        />
        <em>
          This is the number of minutes before the start of your party
          that you want to close ingredient contribution. You can use this
          to reserve time for shopping.
        </em>
      </FormBox>
    </React.Fragment>
  );
};

export default InfoForm;
