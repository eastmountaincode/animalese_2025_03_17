import { useState, useEffect, useRef } from 'react'
import { Box, Button } from '@chakra-ui/react'
import { getRecording, storeRecording } from '../../../idb/recordings_db'
import TrimSound from './TrimSound'

interface LetterCardPlayTrimProps {
  letter: string
}

export default function LetterCardPlayTrim({ letter }: LetterCardPlayTrimProps) {
  const [currentAudio, setCurrentAudio] = useState<Blob | null>(null)
  const trimSoundRef = useRef<any>(null)

  async function loadRecording() {
    const blob = await getRecording(letter)
    setCurrentAudio(blob)
  }

  useEffect(() => {
    // Load recording when component mounts or when the letter changes
    loadRecording()

    // Handle events for recording updates
    function handleRecordingStored(e: Event) {
      const { detail } = e as CustomEvent<{ letter: string }>
      if (detail.letter === letter) {
        loadRecording()
      }
    }

    function handleAllRecordingsCleared() {
      setCurrentAudio(null)
    }

    window.addEventListener('recording-stored', handleRecordingStored)
    window.addEventListener('all-recordings-cleared', handleAllRecordingsCleared)

    return () => {
      window.removeEventListener('recording-stored', handleRecordingStored)
      window.removeEventListener('all-recordings-cleared', handleAllRecordingsCleared)
    }
  }, [letter])

  async function handlePlayClick() {
    if (!currentAudio) {
      console.warn(`No recording found for letter: ${letter}`)
      return
    }
    // Always play from the beginning regardless of current playback state
    trimSoundRef.current?.playFromBeginning()
  }

  async function handleTrimmed(trimmedBlob: Blob) {
    // Update the state and persist the new (trimmed) recording
    setCurrentAudio(trimmedBlob)
    await storeRecording(letter, trimmedBlob)
    window.dispatchEvent(new CustomEvent('recording-stored', { detail: { letter } }))
  }

  return (
    <Box w="100%">
      <Button
        variant="outline"
        size="lg"
        w="80%"
        onClick={handlePlayClick}
        disabled={!currentAudio}
        fontSize={currentAudio ? 'md' : 'xs'}
      >
        {currentAudio ? 'Play' : 'No Recording Available'}
      </Button>
      <Box mt={4} w="80%" mx="auto">
        {currentAudio ? (
          <TrimSound ref={trimSoundRef} audioBlob={currentAudio} onTrimmed={handleTrimmed} />
        ) : (
          // Always reserve the trim area's height even if no recording exists
          <Box h="45px" border="1px dashed gray" />
        )}
      </Box>
    </Box>
  )
}
