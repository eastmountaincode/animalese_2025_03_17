import React from 'react';
import { Box, Text, Textarea } from '@chakra-ui/react';

interface TextInputProps {
  inputText: string;
  handleTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextInput: React.FC<TextInputProps> = ({ inputText, handleTextChange }) => {
  return (
    <Box mb={4}>
      <Text mb={1}>Enter text to convert:</Text>
      <Textarea 
        value={inputText}
        onChange={handleTextChange}
        placeholder="Type your text here... e.g., Hello, how are you today?"
        rows={5}
      />
    </Box>
  );
};

export default TextInput; 