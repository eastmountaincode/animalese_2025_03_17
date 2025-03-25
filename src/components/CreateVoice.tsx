import React, { useState } from 'react'
import { Box, Heading, Text, Button } from '@chakra-ui/react'
import { 
  TextInput, 
  SilenceThresholdControl, 
  PitchControl, 
  SpeedControl,
  WhitespacePauseControl
} from './CreateVoice/index'
import { useAnimalese } from '../hooks/useAnimalese'

const CreateVoice: React.FC = () => {
  const [inputText, setInputText] = useState('');
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
    generateAnimalese 
  } = useAnimalese();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSilenceThreshold(parseFloat(e.target.value));
  };

  const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPitch(parseFloat(e.target.value));
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpeed(parseFloat(e.target.value));
  };

  const handleWhitespacePauseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhitespacePause(parseFloat(e.target.value));
  };

  const handleSubmit = () => {
    generateAnimalese(inputText);
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
      
      <Button 
        colorScheme="green" 
        onClick={handleSubmit}
        disabled={!inputText.trim() || isPlaying || !isComplete}
        w="100%"
        className={isPlaying ? "loading" : ""}
      >
        {isPlaying ? "Generating sound..." : "Generate Animalese"}
      </Button>

      {!isComplete && (
        <Text color="orange.500" fontSize="sm" mt={2} textAlign="center">
          You need to record all letters before generating Animalese!
        </Text>
      )}
    </Box>
  )
}

export default CreateVoice 