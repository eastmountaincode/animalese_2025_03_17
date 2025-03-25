import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';

interface PitchControlProps {
  pitch: number;
  handlePitchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isPlaying: boolean;
}

const PitchControl: React.FC<PitchControlProps> = ({ 
  pitch, 
  handlePitchChange,
  isPlaying 
}) => {
  return (
    <Box mb={4}>
      <Flex justify="space-between" align="center" mb={1}>
        <Text>Pitch: {pitch.toFixed(2)}x</Text>
        <Text fontSize="xs" color="gray.500">
          {pitch < 0.8 ? "Lower pitch" : pitch > 1.2 ? "Higher pitch" : "Normal pitch"}
        </Text>
      </Flex>
      <input 
        type="range"
        min="0.5"
        max="2.0"
        step="0.05"
        value={pitch}
        onChange={handlePitchChange}
        disabled={isPlaying}
        style={{ width: '100%' }}
      />
      <Text fontSize="xs" color="gray.500" mt={1}>
        Adjust to change the pitch of the voice (lower = deeper, higher = squeakier)
      </Text>
    </Box>
  );
};

export default PitchControl; 