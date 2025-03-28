import { useState, useEffect } from 'react'
import { Box, Button } from '@chakra-ui/react'
import { getRecording, storeRecording } from '../../../idb/recordings_db'
import processAudioBlob from '../../../util/audioHelper'

interface LetterCardRecordProps {
  letter: string
}

export default function LetterCardRecord({ letter }: LetterCardRecordProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [hasRecording, setHasRecording] = useState(false)

  // Check if a recording already exists in IndexedDB for this letter
  async function checkRecording() {
    const blob = await getRecording(letter)
    setHasRecording(Boolean(blob))
  }

  useEffect(() => {
    // On mount or if 'letter' changes, see if there's already a recording
    checkRecording()

    // If everything gets cleared, update hasRecording to false
    function handleAllRecordingsCleared() {
      setHasRecording(false)
    }

    // If a new recording is stored for this letter, update accordingly
    function handleRecordingStored(e: Event) {
      const { detail } = e as CustomEvent<{ letter: string }>
      if (detail.letter === letter) {
        setHasRecording(true)
      }
    }

    // Listen for these custom events
    window.addEventListener('all-recordings-cleared', handleAllRecordingsCleared)
    window.addEventListener('recording-stored', handleRecordingStored)

    // Cleanup
    return () => {
      window.removeEventListener('all-recordings-cleared', handleAllRecordingsCleared)
      window.removeEventListener('recording-stored', handleRecordingStored)
    }
  }, [letter])

  async function handleRecordClick() {
    try {
      if (!isRecording) {
        // Start recording
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const recorder = new MediaRecorder(stream)
        const chunks: BlobPart[] = []

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data)
          }
        }

        recorder.onstop = async () => {
          // Stop all tracks
          stream.getTracks().forEach((track) => track.stop())
          
          // Create the raw blob from the recorded chunks
          const rawBlob = new Blob(chunks, { type: 'audio/webm' })
        
          // Process the blob: decode, apply fade, and re-encode to WAV
          const processedBlob = await processAudioBlob(rawBlob)
        
          // Save the processed (smoothed) audio to IndexedDB
          await storeRecording(letter, processedBlob)
          window.dispatchEvent(new CustomEvent('recording-stored', { detail: { letter } }))
        }

        recorder.start()
        setMediaRecorder(recorder)
        setIsRecording(true)
      } else {
        // Stop recording
        mediaRecorder?.stop()
        setMediaRecorder(null)
        setIsRecording(false)
      }
    } catch (error) {
      console.error('Error accessing microphone or recording:', error)
    }
  }

  // Render different button text:
  // - If recording is ongoing: "Stop Recording"
  // - Else if there's a previously stored recording: "Re-record"
  // - Else: "Record"
  let buttonLabel = 'Record'
  if (isRecording) {
    buttonLabel = 'Stop Recording'
  } else if (hasRecording) {
    buttonLabel = 'Record Again'
  }

  return (
    <Box w="100%">
      <Button w="80%" onClick={handleRecordClick}>
        {buttonLabel}
      </Button>
    </Box>
  )
}
