import React from 'react';
import styled from 'styled-components';
import { StoreContext } from '../utilities/Store';
import encodeImage from "../utilities/encodeImage";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

// Style for the image picker outer frame
const Frame = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1.77;
  border: 3px solid black;
  border-radius: 15px;
  box-shadow: 4px 4px 8px 4px rgba(0,0,0,0.3);
  font-size: 2em;
  padding-left: 10%;
  box-sizing: border-box;
  align-items: center;
  cursor: pointer;
`;

// Style for the floating corner add photo icon
const CornerIcon = styled.div`
  position: absolute;
  top: -20px;
  right: -14px;
  font-size: 1.3em;
`;

// Style to hide the input component
const HiddenInput = styled.input`
  display: none;
`;

// Style to display the selected image beneath the frame
const Background = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  object-fit: cover;
  border-radius: 12px;
`;

// Image display and picker component with built in encoding
// img: the current image to display
// setImg: the setter for image
const ImagePicker = ({img, setImg}) => {
  // Reference for the hidden input control
  const inputFile = React.useRef(null);

  const context = React.useContext(StoreContext);
  const [, setAlert] = context.alert;

  // Displays the file select prompt
  const clickUpload = () => {
    if (inputFile) {
      inputFile.current.click();
    }
  }

  // Attempt to encode the image to base64
  const addImage = async (file) => {
    if (file.length > 0) {
      try {
        const encoded = await encodeImage(file[0]);
        setImg(encoded);
      } catch (err) {
        setAlert({text: 'Unable to load this image. Try a different one?'});
      }
    }
  }

  return (
    <Frame onClick={clickUpload} img={img}>
      {img ?
       null :
       <span>Add image</span>
      }
      <CornerIcon>
        <AddPhotoAlternateIcon fontSize='inherit' />
      </CornerIcon>
      <HiddenInput
        type='file'
        accept='image/png, image/jpg, image/jpeg'
        ref={inputFile}
        onChange={(e) => {
          addImage(e.target.files);
        }}
      />
      <Background src={img} />
    </Frame>
  );
};

export default ImagePicker;
