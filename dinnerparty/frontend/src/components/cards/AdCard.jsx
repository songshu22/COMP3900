import BigCard from "./BigCard";

import styled from "styled-components";
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import { useTheme } from "@emotion/react";

// Style for card content flex wrapper
const Flex = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: space-evenly;
  align-items: center;
  gap: 20px;
  font-size: 2rem;
  color: ${(props) => (props.theme ? props.theme.palette.primary.main : '')};
  padding: 10px;
  box-sizing: border-box;

  & > svg {
    font-size: 4rem;
  }

  & > span {
    word-wrap: break-word;
  }
`;

// Big advertising card for session screen
const AdCard = ({text, onClick}) => {
  const theme = useTheme();

  return (
    <BigCard onClick={onClick}>
      <Flex theme={theme}>
        <LibraryAddIcon />
        <span>{text}</span>
      </Flex>
    </BigCard>
  );
};

export default AdCard;
