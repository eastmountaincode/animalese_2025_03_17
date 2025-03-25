import { useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { recordingsAtom } from '../../atoms/recordingAtoms'
import { getRecording } from '../../idb/recordings_db'

// Component that loads all recordings from IndexedDB and populates the recordingsAtom
export default function RecordingsLoader() {
  const setRecordings = useSetAtom(recordingsAtom)
  
  useEffect(() => {
    async function loadAllRecordings() {
      try {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
        const recordings: Record<string, Blob> = {}
        
        // Load recordings for each letter
        for (const letter of alphabet) {
          const blob = await getRecording(letter)
          if (blob) {
            recordings[letter] = blob
          }
        }
        
        // Update the atom with all recordings
        setRecordings(recordings)
        console.log(`Loaded ${Object.keys(recordings).length} recordings from IndexedDB`)
      } catch (error) {
        console.error('Error loading recordings:', error)
      }
    }
    
    loadAllRecordings()
    
    // Listen for recording events to update our state
    const handleRecordingStored = async (e: Event) => {
      const { detail } = e as CustomEvent<{ letter: string }>
      const blob = await getRecording(detail.letter)
      if (blob) {
        setRecordings(prev => ({ ...prev, [detail.letter]: blob }))
      }
    }
    
    const handleRecordingsCleared = () => {
      setRecordings({})
    }
    
    window.addEventListener('recording-stored', handleRecordingStored)
    window.addEventListener('all-recordings-cleared', handleRecordingsCleared)
    
    return () => {
      window.removeEventListener('recording-stored', handleRecordingStored)
      window.removeEventListener('all-recordings-cleared', handleRecordingsCleared)
    }
  }, [setRecordings])
  
  // This component doesn't render anything
  return null
} 