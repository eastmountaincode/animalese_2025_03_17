import { atom } from 'jotai'

// Define interface for the recordings object
interface RecordingsState {
  [key: string]: Blob
}

export const recordingsAtom = atom<RecordingsState>({})
export const progressAtom = atom((get) => Object.keys(get(recordingsAtom)).length)
export const isCompleteAtom = atom((get) => get(progressAtom) === 26) 