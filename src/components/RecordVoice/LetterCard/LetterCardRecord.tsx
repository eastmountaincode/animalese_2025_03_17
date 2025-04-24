import { useEffect, useRef, useState } from 'react';
import { Box, Button, Spinner } from '@chakra-ui/react';
import { getRecording, storeRecording } from '../../../idb/recordings_db';
import processAudioBlob from '../../../util/audioHelper';

interface LetterCardRecordProps {
    letter: string;
}

/*  UI state machine
    ┌────────┐ click Record ┌─────────────┐ MediaRecorder.onstart  ┌──────────┐ click Stop ┌────────┐
    │  idle  ├──────────────► initializing ├──────────────────────► recording ├───────────► idle    │
    └────────┘              └─────────────┘                        └──────────┘            └────────┘
*/
type Status = 'idle' | 'initializing' | 'recording';

export default function LetterCardRecord({ letter }: LetterCardRecordProps) {
    const [status, setStatus] = useState<Status>('idle');
    const [hasRecording, setHasRecording] = useState(false);

    // Refs so we never lose the same objects across renders
    const streamRef = useRef<MediaStream | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);

    /* ---------- Helpers ---------- */

    // Warm (or re-use) the audio stream – keeps Bluetooth devices active between takes
    async function getAudioStream(): Promise<MediaStream> {
        if (streamRef.current && streamRef.current.active) return streamRef.current;
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true } });
        return streamRef.current;
    }

    // Check if a recording already exists for this letter
    async function refreshHasRecording() {
        const existing = await getRecording(letter);
        setHasRecording(Boolean(existing));
    }

    /* ---------- Lifecycle ---------- */

    useEffect(() => {
        refreshHasRecording();
    }, [letter]);

    // Stop tracks when the component unmounts
    useEffect(() => {
        return () => {
            streamRef.current?.getTracks().forEach((t) => t.stop());
        };
    }, []);

    /* ---------- Recording logic ---------- */

    async function startRecording() {
        setStatus('initializing');

        const stream = await getAudioStream();
        const chunks: BlobPart[] = [];

        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        recorderRef.current = recorder;

        recorder.onstart = () => setStatus('recording');

        recorder.ondataavailable = (e) => {
            if (e.data.size) chunks.push(e.data);
        };

        recorder.onstop = async () => {
            // Immediately reset UI – do heavy work after
            setStatus('idle');

            const rawBlob = new Blob(chunks, { type: 'audio/webm' });
            const processedBlob = await processAudioBlob(rawBlob);

            await storeRecording(letter, processedBlob);
            window.dispatchEvent(new CustomEvent('recording-stored', { detail: { letter } }));
            setHasRecording(true);
        };

        // Timeslice makes the first packet arrive quickly so short takes aren't empty.
        recorder.start(100);
    }

    function stopRecording() {
        recorderRef.current?.stop();
    }

    const handleButtonClick = () => {
        if (status === 'idle') {
            startRecording().catch((err) => {
                console.error('Could not access microphone:', err);
                setStatus('idle');
            });
        } else if (status === 'recording') {
            stopRecording();
        }
        // When status === 'initializing' the button is disabled – do nothing
    };

    /* ---------- UI ---------- */

    let label = 'Record';
    if (status === 'initializing') label = 'Starting…';
    else if (status === 'recording') label = 'Stop Recording';
    else if (hasRecording) label = 'Record Again';

    return (
        <Box w="100%">
            <Button
                w="80%"
                onClick={handleButtonClick}
                disabled={status === 'initializing'}
                colorScheme={status === 'recording' ? 'red' : 'blue'}
            >
                {label}
                {status === 'initializing' && <Spinner ml={2} size="sm" />}
            </Button>
        </Box>
    );
}
