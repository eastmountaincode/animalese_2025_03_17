import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';

interface WhitespacePauseControlProps {
  whitespacePause: number;
  handleWhitespacePauseChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isPlaying: boolean;
}

const WhitespacePauseControl: React.FC<WhitespacePauseControlProps> = ({ 
  whitespacePause, 
  handleWhitespacePauseChange,
  isPlaying 
}) => {
  return (
    <Box mb={4}>
      <Flex justify="space-between" align="center" mb={1}>
        <Text>Space Pause: {whitespacePause.toFixed(2)}s</Text>
        <Text fontSize="xs" color="gray.500">
          {whitespacePause < 0.1 ? "Short pauses" : whitespacePause > 0.3 ? "Long pauses" : "Normal pauses"}
        </Text>
      </Flex>
      <input 
        type="range"
        min="0.05"
        max="0.5"
        step="0.01"
        value={whitespacePause}
        onChange={handleWhitespacePauseChange}
        disabled={isPlaying}
        style={{ width: '100%' }}
      />
      <Text fontSize="xs" color="gray.500" mt={1}>
        Adjust the length of pauses between words (spaces in your text)
      </Text>
    </Box>
  );
};

export default WhitespacePauseControl; 