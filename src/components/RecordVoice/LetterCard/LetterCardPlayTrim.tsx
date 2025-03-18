import { useState, useEffect } from 'react'
import { Box, Button } from '@chakra-ui/react'
import { getRecording } from '../../../idb/recordings_db'

interface LetterCardPlayTrimProps {
  letter: string
}

export default function LetterCardPlayTrim({ letter }: LetterCardPlayTrimProps) {
  const [hasRecording, setHasRecording] = useState(false)

  async function checkRecording() {
    const blob = await getRecording(letter)
    setHasRecording(Boolean(blob))
  }

  useEffect(() => {
    // 1) Check if a recording already exists on mount (and whenever 'letter' changes)
    checkRecording()

    // 2) Handle single-letter recording
    function handleRecordingStored(e: Event) {
      const { detail } = e as CustomEvent<{ letter: string }>
      // Only re-check the DB if the recorded letter matches this component's letter
      if (detail.letter === letter) {
        checkRecording()
      }
    }

    // 3) Handle the global reset
    function handleAllRecordingsCleared() {
      // Since the entire DB is cleared, there's definitely no recording for this letter
      setHasRecording(false)
    }

    // Add both event listeners
    window.addEventListener('recording-stored', handleRecordingStored)
    window.addEventListener('all-recordings-cleared', handleAllRecordingsCleared)

    // Cleanup when unmounting
    return () => {
      window.removeEventListener('recording-stored', handleRecordingStored)
      window.removeEventListener('all-recordings-cleared', handleAllRecordingsCleared)
    }
  }, [letter]) // Re-run effect if 'letter' changes

  async function handlePlayClick() {
    try {
      const blob = await getRecording(letter)
      if (!blob) {
        console.warn(`No recording found for letter: ${letter}`)
        return
      }
      const audioURL = URL.createObjectURL(blob)
      const audio = new Audio(audioURL)
      audio.play()
    } catch (error) {
      console.error('Error playing recording:', error)
    }
  }

  return (
    <Box border="1px solid red" w="100%">
      <Button
        variant="outline"
        size="lg"
        w="80%"
        onClick={handlePlayClick}
        disabled={!hasRecording}
        fontSize={hasRecording ? 'md' : 'xs'}
      >
        {hasRecording ? 'Play' : 'No Recording Available'}
      </Button>
    </Box>
  )
}
