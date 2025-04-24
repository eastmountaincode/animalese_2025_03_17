import React, { useState, useEffect } from 'react'
import { Box, Heading, Text, Button } from '@chakra-ui/react'
import { 
  TextInput, 
  SilenceThresholdControl, 
  PitchControl, 
  SpeedControl,
  WhitespacePauseControl
} from './index'
import { useAnimalese } from '../../hooks/useAnimalese'

// Keys for localStorage
const STORAGE_KEYS = {
  TEXT: 'animalese_text',
  SILENCE: 'animalese_silence_threshold',
  PITCH: 'animalese_pitch',
  SPEED: 'animalese_speed',
  WHITESPACE: 'animalese_whitespace'
};

const CreateVoice: React.FC = () => {
  // Initialize state with localStorage values if available
  const getStoredValue = (key: string, defaultValue: any) => {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  };

  const [inputText, setInputText] = useState(() => 
    getStoredValue(STORAGE_KEYS.TEXT, '')
  );

  const { 
    isPlaying, 
    silenceThreshold, 
    setSilenceThreshold, 
    pitch, 
    setPitch,
    speed,
    setSpeed,
    whitespacePause,
    setWhitespacePause, 
    isComplete, 
    generateAnimalese,
    stopSound
  } = useAnimalese();

  // Load stored values when component mounts
  useEffect(() => {
    // Apply stored values to the hook's state
    const storedSilence = getStoredValue(STORAGE_KEYS.SILENCE, null);
    const storedPitch = getStoredValue(STORAGE_KEYS.PITCH, null);
    const storedSpeed = getStoredValue(STORAGE_KEYS.SPEED, null);
    const storedWhitespace = getStoredValue(STORAGE_KEYS.WHITESPACE, null);

    if (storedSilence !== null) setSilenceThreshold(storedSilence);
    if (storedPitch !== null) setPitch(storedPitch);
    if (storedSpeed !== null) setSpeed(storedSpeed);
    if (storedWhitespace !== null) setWhitespacePause(storedWhitespace);
  }, [setSilenceThreshold, setPitch, setSpeed, setWhitespacePause]);

  // Handlers with localStorage updates
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputText(value);
    localStorage.setItem(STORAGE_KEYS.TEXT, JSON.stringify(value));
  };

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSilenceThreshold(value);
    localStorage.setItem(STORAGE_KEYS.SILENCE, JSON.stringify(value));
  };

  const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setPitch(value);
    localStorage.setItem(STORAGE_KEYS.PITCH, JSON.stringify(value));
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSpeed(value);
    localStorage.setItem(STORAGE_KEYS.SPEED, JSON.stringify(value));
  };

  const handleWhitespacePauseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setWhitespacePause(value);
    localStorage.setItem(STORAGE_KEYS.WHITESPACE, JSON.stringify(value));
  };

  const handleSubmit = () => {
    generateAnimalese(inputText);
  };

  const handleStop = () => {
    stopSound();
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="xl" maxW="600px" mx="auto">
      <Heading size="lg" mb={4}>Create Voice</Heading>
      
      <TextInput 
        inputText={inputText} 
        handleTextChange={handleTextChange} 
      />
      
      <SilenceThresholdControl 
        silenceThreshold={silenceThreshold} 
        handleThresholdChange={handleThresholdChange} 
        isPlaying={isPlaying} 
      />
      
      <PitchControl 
        pitch={pitch} 
        handlePitchChange={handlePitchChange} 
        isPlaying={isPlaying} 
      />
      
      <SpeedControl
        speed={speed}
        handleSpeedChange={handleSpeedChange}
        isPlaying={isPlaying}
      />
      
      <WhitespacePauseControl
        whitespacePause={whitespacePause}
        handleWhitespacePauseChange={handleWhitespacePauseChange}
        isPlaying={isPlaying}
      />
      
      {isPlaying ? (
        <Button 
          colorScheme="red" 
          onClick={handleStop}
          w="100%"
        >
          Stop Playback
        </Button>
      ) : (
        <Button 
          colorScheme="green" 
          onClick={handleSubmit}
          disabled={!inputText.trim() || !isComplete}
          w="100%"
        >
          Generate Animalese
        </Button>
      )}

      {!isComplete && (
        <Text color="orange.500" fontSize="sm" mt={2} textAlign="center">
          You need to record all letters before generating Animalese!
        </Text>
      )}
    </Box>
  )
}

export default CreateVoice 