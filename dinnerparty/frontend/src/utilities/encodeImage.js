// Helper function for encoding an image file to base64
const encodeImage = (file) => {
  return new Promise((resolve, reject) => {
    // Check file type valid
    const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!validFileTypes.find(type => type === file.type)) {
      reject('Invalid file type');
    }

    // Use a reader to read the file
    const reader = new FileReader();
    reader.onerror = () => {
      reject('Error reading file');
    };
    reader.onload = () => {
      resolve(reader.result);
    };

    // Encode using base64
    reader.readAsDataURL(file);
  });
};

export default encodeImage;