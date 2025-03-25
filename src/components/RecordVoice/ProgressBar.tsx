import { Box, Text, Flex, Badge } from '@chakra-ui/react'
import { useAtomValue } from 'jotai'
import { progressAtom, isCompleteAtom, recordingsAtom } from '../../atoms/recordingAtoms'

// Simple flag for development mode - avoids process.env
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

interface ProgressBarProps {
  currentLetter?: string;
}

export default function ProgressBar({ currentLetter }: ProgressBarProps) {
  const recordedCount = useAtomValue(progressAtom)
  const isComplete = useAtomValue(isCompleteAtom)
  const recordings = useAtomValue(recordingsAtom)
  
  const totalLetters = 26
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  
  // For debugging - only in development
  if (isDevelopment) {
    console.log('Progress:', recordedCount, '/', totalLetters, 'Complete:', isComplete)
    console.log('Recordings:', Object.keys(recordings))
  }
  
  return (
    <Box w="100%" maxW="500px" mx="auto" borderWidth="2px" borderRadius="xl" p={5}>
      <Flex justify="space-between" mb={2}>
        <Text fontSize="sm">Recording Progress</Text>
        <Flex align="center">
          <Text fontSize="sm" fontWeight="bold" mr={2}>
            {recordedCount}/{totalLetters} letters
          </Text>
          {isComplete && (
            <Badge colorScheme="green">Complete!</Badge>
          )}
        </Flex>
      </Flex>
      
      <Flex w="100%" justify="center" alignItems="center" gap="0">
        {alphabet.map(letter => {
          const hasRecording = !!recordings[letter]
          const isCurrentLetter = letter === currentLetter
          
          return (
            <Box 
              key={letter}
              h={isCurrentLetter ? "22px" : "16px"}
              w={isCurrentLetter ? "10px" : "8px"}
              borderRadius="full"
              bg={hasRecording ? "green.500" : "transparent"}
              border={hasRecording ? "none" : "1px solid"}
              borderColor="gray.300"
              mx="1px"
              position="relative"
              zIndex={isCurrentLetter ? 2 : 1}
              transition="all 0.3s ease"
              _after={isCurrentLetter ? {
                content: '""',
                position: 'absolute',
                bottom: '-6px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '4px',
                height: '4px',
                borderRadius: 'full',
                bg: 'black'
              } : {}}
            />
          )
        })}
      </Flex>
    </Box>
  )
} 