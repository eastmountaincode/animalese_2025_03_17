import { useState } from 'react'
import { Box, Button } from '@chakra-ui/react'
import { storeRecording } from '../../../idb/recordings_db'

interface LetterCardRecordProps {
  letter: string
}

export default function LetterCardRecord({ letter }: LetterCardRecordProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)

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

          // Save recording to IndexedDB
          const audioBlob = new Blob(chunks, { type: 'audio/webm' })
          await storeRecording(letter, audioBlob)

          // Dispatch a custom event so other components know this letter now has a recording
          const event = new CustomEvent('recording-stored', { detail: { letter } })
          window.dispatchEvent(event)
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

  return (
    <Box border="1px solid blue" w="100%">
      <Button w="80%" onClick={handleRecordClick}>
        {isRecording ? 'Stop Recording' : 'Record'}
      </Button>
    </Box>
  )
}
