import styled from 'styled-components';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import {styled as styledMUI} from '@mui/material/styles';

// Style for the modal outer container
const ModalContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  pointer-events: none;
`;

// Style for the visible themed modal box
const ModalBox = styled.div`
  position: relative;
  width: 60%;
  max-width: 500px;
  margin: 0 30px;
  padding: 30px 50px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  border: 3px solid #9f4282;
  background-color: #f7e8c4;
  z-index: 100;
  box-shadow: 5px 5px 10px 1px rgba(0,0,0,0.4);
  pointer-events: auto;
`;

// Style for the floating exit button
const FloatButton = styledMUI(IconButton)`
  position: absolute;
  top: 10px;
  left: 0;
`;

// Template modal base component for floating modals
const ModalBase = (props) => {
  return (
    <Modal {...props}>
      <ModalContainer>
        <ModalBox>
          {props.onClose ?
            <FloatButton
              aria-label="close"
              onClick={props.onClose}
            >
              <CloseIcon />
            </FloatButton> :
            null
          }
          {props.children}
        </ModalBox>
      </ModalContainer>
    </Modal>
  );
};

export default ModalBase;
