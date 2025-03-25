import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';

interface SilenceThresholdControlProps {
  silenceThreshold: number;
  handleThresholdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isPlaying: boolean;
}

const SilenceThresholdControl: React.FC<SilenceThresholdControlProps> = ({ 
  silenceThreshold, 
  handleThresholdChange,
  isPlaying 
}) => {
  return (
    <Box mb={4}>
      <Flex justify="space-between" align="center" mb={1}>
        <Text>Silence Threshold: {silenceThreshold.toFixed(3)}</Text>
        <Text fontSize="xs" color="gray.500">
          {silenceThreshold < 0.01 ? "Less silence trimming" : silenceThreshold > 0.05 ? "More silence trimming" : "Balanced"}
        </Text>
      </Flex>
      <input 
        type="range"
        min="0.1"
        max="0.2"
        step="0.001"
        value={silenceThreshold}
        onChange={handleThresholdChange}
        disabled={isPlaying}
        style={{ width: '100%' }}
      />
      <Text fontSize="xs" color="gray.500" mt={1}>
        Adjust to control how much silence is trimmed (higher = more trimming)
      </Text>
    </Box>
  );
};

export default SilenceThresholdControl; 