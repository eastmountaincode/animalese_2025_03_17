import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';

interface SpeedControlProps {
  speed: number;
  handleSpeedChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isPlaying: boolean;
}

const SpeedControl: React.FC<SpeedControlProps> = ({ 
  speed, 
  handleSpeedChange,
  isPlaying 
}) => {
  return (
    <Box mb={4}>
      <Flex justify="space-between" align="center" mb={1}>
        <Text>Speech Speed: {speed.toFixed(2)}x</Text>
        <Text fontSize="xs" color="gray.500">
          {speed < 0.8 ? "Slower speech" : speed > 1.2 ? "Faster speech" : "Normal speed"}
        </Text>
      </Flex>
      <input 
        type="range"
        min="0.5"
        max="4.0"
        step="0.05"
        value={speed}
        onChange={handleSpeedChange}
        disabled={isPlaying}
        style={{ width: '100%' }}
      />
      <Text fontSize="xs" color="gray.500" mt={1}>
        Adjust to change the speed of speech (lower = slower, higher = faster)
      </Text>
    </Box>
  );
};

export default SpeedControl; 