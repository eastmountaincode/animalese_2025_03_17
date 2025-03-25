import { atom } from 'jotai'

export const recordingsAtom = atom({})
export const progressAtom = atom(get => Object.keys(get(recordingsAtom)).length)
export const isCompleteAtom = atom(get => get(progressAtom) === 26)
