import styled from 'styled-components';

// Style for completion text
const Text = styled.div`
  font-size: 3rem;
  text-align: center;
  margin: auto 0;
  padding-bottom: 20%;
`;

const Done = () => {
  return (
    <Text>You&apos;re all set!</Text>
  );
};

export default Done;