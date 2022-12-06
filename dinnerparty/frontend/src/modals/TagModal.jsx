import React from 'react';
import ModalBase from './ModalBase';
import {tagEnum} from '../assets/enums';
import ThemedButton from '../components/ThemedButton';
import SortedSelect from '../components/SortedSelect';

// Recipe tag selection modal component
// open: true when the modal is open
// onClose: hanlder function for modal closing
// addTag: callback function when a tag is selected
const TagModal = ({open, onClose, addTag}) => {
  const [tag, setTag] = React.useState('');

  return (
    <ModalBase open={open} onClose={onClose}>
      <b>Add a tag</b>
      <SortedSelect
        label='Select a tag'
        options={tagEnum}
        value={tag}
        setValue={setTag}
      />
      <ThemedButton
        onClick={() => {
          addTag(tag);
          onClose();
        }}
      >
        Add
      </ThemedButton>
    </ModalBase>
  );
};

export default TagModal;
