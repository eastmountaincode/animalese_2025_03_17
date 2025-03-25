import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { Box, Button } from '@chakra-ui/react'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js'

interface TrimSoundProps {
  audioBlob: Blob
  onTrimmed: (trimmedBlob: Blob) => void
}

// Wrap the component with forwardRef to expose playback methods to the parent.
const TrimSound = forwardRef((props: TrimSoundProps, ref) => {
  const { audioBlob } = props
  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<any>(null)
  const audioUrlRef = useRef<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const [_, setIsReady] = useState(false)

  // Expose play/pause methods via ref.
  useImperativeHandle(ref, () => ({
    play: () => wavesurferRef.current?.play(),
    pause: () => wavesurferRef.current?.pause(),
    togglePlay: () => wavesurferRef.current?.playPause(),
    playFromBeginning: () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.seekTo(0);
        wavesurferRef.current.play();
      }
    }
  }))

  useEffect(() => {
    const initializeWaveSurfer = async () => {
      if (!waveformRef.current) return;

      // Cleanup previous controller if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      try {
        // Clean up previous instance if it exists
        if (wavesurferRef.current) {
          wavesurferRef.current.unAll();
          wavesurferRef.current.destroy();
          wavesurferRef.current = null;
        }

        // Clean up previous URL if it exists
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }

        const wavesurfer = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: '#ddd',
          progressColor: '#aaa',
          cursorColor: '#333',
          cursorWidth: 2,
          height: 45,
          normalize: true,
          barWidth: 5,
          plugins: [
            RegionsPlugin.create(),
          ],
        })

        // Only set the ref if we haven't been aborted
        if (!signal.aborted) {
          wavesurferRef.current = wavesurfer;

          wavesurfer.on('ready', () => {
            if (!signal.aborted) {
              setIsReady(true);
            }
          });

          wavesurfer.on('error', (error) => {
            if (!signal.aborted) {
              console.error('WaveSurfer error:', error);
            }
          });

          // Create URL and load audio
          audioUrlRef.current = URL.createObjectURL(audioBlob);
          await wavesurfer.load(audioUrlRef.current);
        }
      } catch (error) {
        if (!signal.aborted) {
          console.error('Error initializing WaveSurfer:', error);
        }
      }
    };

    initializeWaveSurfer();

    return () => {
      // Abort any ongoing operations
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      // Clean up WaveSurfer
      if (wavesurferRef.current) {
        wavesurferRef.current.unAll();
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }

      // Clean up URL
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }

      setIsReady(false);
    };
  }, [audioBlob]);

  return (
    <Box>
      <Box ref={waveformRef} />
    </Box>
  )
})

export default TrimSound
