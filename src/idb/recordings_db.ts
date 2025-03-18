// db.ts
import { openDB } from 'idb'

const DB_NAME = 'AudioDB'
const DB_VERSION = 1
const STORE_NAME = 'recordings'

/**
 * Opens the AudioDB database (creating it if needed)
 * and ensures our 'recordings' object store exists.
 */
async function getDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                // Keyed by 'letter' so we can store { letter, blob } objects
                db.createObjectStore(STORE_NAME, { keyPath: 'letter' })
            }
        },
    })
}

/**
 * Stores a recording blob associated with a specific letter.
 */
export async function storeRecording(letter: string, blob: Blob): Promise<void> {
    const db = await getDB()
    // Put or update { letter, blob } in the 'recordings' store
    await db.put(STORE_NAME, { letter, blob })
}

/**
 * Retrieves a stored recording (Blob) for a given letter.
 */
export async function getRecording(letter: string): Promise<Blob | null> {
    const db = await getDB()
    const entry = await db.get(STORE_NAME, letter)
    if (!entry) {
        return null
    }
    return entry.blob
}

/**
 * Clears *all* stored recordings from the 'recordings' store.
 */
export async function clearAllRecordings(): Promise<void> {
    const db = await getDB()
    await db.clear(STORE_NAME)
  }
