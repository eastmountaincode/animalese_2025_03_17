import { useState, useRef, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { recordingsAtom, isCompleteAtom } from '../atoms/recordingAtoms';

export const useAnimalese = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [silenceThreshold, setSilenceThreshold] = useState(0.175);
  const [pitch, setPitch] = useState(1.35);
  const [speed, setSpeed] = useState(1.3);
  const [whitespacePause, setWhitespacePause] = useState(0.06); // Default pause for whitespace
  const isComplete = useAtomValue(isCompleteAtom);
  const recordings = useAtomValue(recordingsAtom)
  const audioContextRef = useRef<AudioContext | null>(null);
  const trimmedBufferCache = useRef<Record<string, AudioBuffer>>({});
  
  // Add a ref to store active audio nodes so we can stop them
  const activeSourcesRef = useRef<AudioScheduledSourceNode[]>([]);
  const stopRequestedRef = useRef<boolean>(false);

  // Create AudioContext on first interaction
  useEffect(() => {
    return () => {
      // Clean up AudioContext when component unmounts
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      // Clear buffer cache on unmount
      trimmedBufferCache.current = {};
      stopSound(); // Stop any playing sounds on unmount
    };
  }, []);

  // When threshold changes, clear the cache to force re-processing with new threshold
  useEffect(() => {
    trimmedBufferCache.current = {};
  }, [silenceThreshold]);

  const createAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    } else if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  // Function to stop all playing sounds
  const stopSound = () => {
    // Stop all active sources
    activeSourcesRef.current.forEach(source => {
      try {
        source.stop();
        source.onended = null; // Remove event listeners
      } catch (err) {
        // Ignore errors if source was already stopped
      }
    });
    
    // Clear the array
    activeSourcesRef.current = [];
    
    // Reset the flag
    stopRequestedRef.current = false;
    
    // Update the playing state
    setIsPlaying(false);
  };

  // Function to trim silence from an audio buffer
  const trimSilence = (buffer: AudioBuffer): AudioBuffer => {
    const audioContext = createAudioContext();
    const channelData = buffer.getChannelData(0); // Get the first channel data
    const bufferLength = channelData.length;
    
    // Find the start index (first sample above threshold)
    let startIndex = 0;
    for (let i = 0; i < bufferLength; i++) {
      if (Math.abs(channelData[i]) > silenceThreshold) {
        startIndex = Math.max(0, i - 50); // Include a tiny bit before the sound
        break;
      }
    }
    
    // Find the end index (last sample above threshold)
    let endIndex = bufferLength - 1;
    for (let i = bufferLength - 1; i >= 0; i--) {
      if (Math.abs(channelData[i]) > silenceThreshold) {
        endIndex = Math.min(bufferLength - 1, i + 50); // Include a tiny bit after the sound
        break;
      }
    }
    
    // If no sound found or already trimmed, return original buffer
    if (startIndex >= endIndex || startIndex === 0 && endIndex === bufferLength - 1) {
      return buffer;
    }
    
    // Create a new buffer with just the trimmed portion
    const trimmedLength = endIndex - startIndex + 1;
    const trimmedBuffer = audioContext.createBuffer(
      buffer.numberOfChannels,
      trimmedLength,
      buffer.sampleRate
    );
    
    // Copy the trimmed portion to the new buffer for each channel
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      const trimmedChannelData = trimmedBuffer.getChannelData(channel);
      
      for (let i = 0; i < trimmedLength; i++) {
        trimmedChannelData[i] = channelData[startIndex + i];
      }
    }
    
    return trimmedBuffer;
  };

  // Apply fade in/out to avoid clicks and pops
  const applyFades = (buffer: AudioBuffer): AudioBuffer => {
    const audioContext = createAudioContext();
    const numberOfChannels = buffer.numberOfChannels;
    const length = buffer.length;
    
    // Create a new buffer for the faded audio
    const fadedBuffer = audioContext.createBuffer(
      numberOfChannels,
      length,
      buffer.sampleRate
    );
    
    // Short fade in/out in milliseconds (converted to samples)
    const fadeInSamples = Math.min(Math.floor(buffer.sampleRate * 0.005), length / 10); // 5ms fade in
    const fadeOutSamples = Math.min(Math.floor(buffer.sampleRate * 0.015), length / 8); // 15ms fade out
    
    // Process each channel
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const inputData = buffer.getChannelData(channel);
      const outputData = fadedBuffer.getChannelData(channel);
      
      // Copy data with fades applied
      for (let i = 0; i < length; i++) {
        // Apply fade in
        if (i < fadeInSamples) {
          // Linear fade from 0 to 1
          outputData[i] = inputData[i] * (i / fadeInSamples);
        }
        // Apply fade out
        else if (i >= length - fadeOutSamples) {
          // Linear fade from 1 to 0
          outputData[i] = inputData[i] * ((length - i) / fadeOutSamples);
        }
        // Middle section - no fade
        else {
          outputData[i] = inputData[i];
        }
      }
    }
    
    return fadedBuffer;
  };

  // This function plays a single letter recording
  const playLetterSound = async (letter: string, time: number, audioContext: AudioContext): Promise<number> => {
    // Check if stop was requested
    if (stopRequestedRef.current) {
      throw new Error('Playback stopped by user');
    }
    
    // Check for whitespace first
    if (letter === ' ') {
      // Return a pause for whitespace, adjustable by the user
      return time + (whitespacePause / speed);
    }
    
    // Skip if not a letter
    if (!/[A-Za-z]/.test(letter)) {
      // Return a short pause for other non-letter characters
      return time + (0.05 / speed); // Shorter pause for non-letters, affected by speed
    }

    const upperLetter = letter.toUpperCase();
    
    // Check if we have a recording for this letter
    if (!recordings[upperLetter]) {
      console.warn(`No recording found for letter: ${upperLetter}`);
      return time + (0.05 / speed); // Still advance time, affected by speed
    }

    try {
      let audioBuffer;
      
      // Use letter + threshold as cache key to handle different threshold values
      const cacheKey = `${upperLetter}_${silenceThreshold}`;
      
      // Check if we already have a trimmed version in our cache
      if (trimmedBufferCache.current[cacheKey]) {
        audioBuffer = trimmedBufferCache.current[cacheKey];
      } else {
        // Get the blob from recordings
        const blob = recordings[upperLetter];
        
        // Convert blob to AudioBuffer
        const arrayBuffer = await blob.arrayBuffer();
        const originalBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Trim silence from the buffer
        const trimmedBuffer = trimSilence(originalBuffer);
        
        // Apply fades to avoid clicks
        audioBuffer = applyFades(trimmedBuffer);
        
        // Cache the processed buffer for future use
        trimmedBufferCache.current[cacheKey] = audioBuffer;
      }
      
      // Create source node
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      
      // Add this source to our active sources list
      activeSourcesRef.current.push(source);
      
      // Remove source from active list when it ends naturally
      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
      };
      
      // Create a gain node for volume control
      const gainNode = audioContext.createGain();
      
      // Connect source to gain node and gain node to destination
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set initial gain to 0 and ramp up quickly to avoid clicks
      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(1, time + 0.003);
      
      // Use the pitch shifter to maintain separate control over pitch and speed
      // When we change speed without wanting pitch to change:
      // 1. Set playbackRate to the speed we want
      // 2. Compensate for the pitch change by using detune (measured in cents, 100 cents = 1 semitone)
      // Formula: detune = -1200 * Math.log2(speed) to counteract the pitch change
      
      source.playbackRate.value = speed;
      
      // Apply detune to compensate for the pitch change from speed
      // Only apply this compensation when speed isn't 1.0
      if (speed !== 1.0) {
        // Convert to cents (1200 cents = 1 octave)
        // Negative value to counteract the pitch increase from higher playback rate
        const pitchCompensation = -1200 * Math.log2(speed);
        source.detune.value = pitchCompensation;
      }
      
      // Now apply the user's desired pitch change
      // Pitch is a multiplier, convert to cents: 1200 * log2(pitch)
      const pitchInCents = 1200 * Math.log2(pitch);
      source.detune.value += pitchInCents;
      
      // Schedule playback
      source.start(time);
      
      // Calculate the actual duration considering the speed
      const adjustedDuration = audioBuffer.duration / speed;
      
      // Fade out at the end to avoid clicks
      const fadeOutTime = time + adjustedDuration - 0.01;
      if (fadeOutTime > time) {
        gainNode.gain.setValueAtTime(1, fadeOutTime);
        gainNode.gain.linearRampToValueAtTime(0, time + adjustedDuration);
      }
      
      // Add a small overlap between sounds to make transitions smoother
      const gapTime = 0.01 / speed; // Smaller gap for smoother playback
      
      // Return the next start time with a slight overlap for smoother transitions
      return time + adjustedDuration - gapTime;
    } catch (error) {
      console.error(`Error playing letter ${upperLetter}:`, error);
      return time + (0.05 / speed); // Return a fallback time, affected by speed
    }
  };

  const generateAnimalese = async (inputText: string) => {
    if (!inputText.trim()) return;
    
    // Check if all recordings are available
    if (!isComplete) {
      alert("You need to record all letters before generating Animalese!");
      return;
    }
    
    try {
      // First stop any ongoing playback
      stopSound();
      
      // Reset stop flag
      stopRequestedRef.current = false;
      
      setIsPlaying(true);
      const audioContext = createAudioContext();
      const characters = inputText.split('');
      
      // Start time (add a small delay from now)
      let currentTime = audioContext.currentTime + 0.1;
      
      // Process each character sequentially
      for (const char of characters) {
        // Check if stop was requested
        if (stopRequestedRef.current) {
          break;
        }
        
        // Play the letter and get the next start time
        currentTime = await playLetterSound(char, currentTime, audioContext);
      }
      
      // Only wait if we haven't been stopped
      if (!stopRequestedRef.current) {
        // Wait until all sounds have finished playing
        const totalDuration = currentTime - audioContext.currentTime;
        await new Promise(resolve => setTimeout(resolve, totalDuration * 1000 + 500));
      }
      
    } catch (error) {
      console.error('Error playing Animalese:', error);
      if (!stopRequestedRef.current) {
        alert("There was an error playing the Animalese sound.");
      }
    } finally {
      setIsPlaying(false);
      // Clean up any remaining sources
      if (stopRequestedRef.current) {
        stopSound();
      }
    }
  };

  // Function to request stopping the sound
  const requestStop = () => {
    stopRequestedRef.current = true;
    stopSound();
  };

  return {
    isPlaying,
    silenceThreshold, 
    setSilenceThreshold,
    pitch,
    setPitch,
    speed,
    setSpeed,
    whitespacePause,
    setWhitespacePause,
    isComplete,
    generateAnimalese,
    stopSound: requestStop
  };
}; 