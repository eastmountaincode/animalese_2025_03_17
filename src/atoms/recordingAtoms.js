import { atom } from 'jotai'

export const recordingsAtom = atom({})
export const progressAtom = atom(get => Object.keys(get(recordingsAtom)).length)
