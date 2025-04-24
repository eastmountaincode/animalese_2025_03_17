import { useState, useRef, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { recordingsAtom, isCompleteAtom } from '../atoms/recordingAtoms';

/*-- constants --*/
const XFADE = 0.02;          // cross-fade (s)
const ATTACK = 0.005;        // fade-in  (s)
const DECAY  = 0.015;        // fade-out (s)
const TARGET_PEAK = 0.707;   // -3 dBFS
const PITCH_JITTER = 80;     // ± cents

// Default values (used if localStorage values aren't available)
const DEFAULT_SILENCE_THRESHOLD = 0.35;
const DEFAULT_PITCH = 1.65;
const DEFAULT_SPEED = 3.30;
const DEFAULT_WHITESPACE_PAUSE = 0.08;

export const useAnimalese = () => {
    /*-- state / atoms --*/
    const [isPlaying, setIsPlaying]       = useState(false);
    const [silenceThres, setSilenceThres] = useState(DEFAULT_SILENCE_THRESHOLD);
    const [pitch, setPitch]               = useState(DEFAULT_PITCH);
    const [speed, setSpeed]               = useState(DEFAULT_SPEED);
    const [spacePause, setSpacePause]     = useState(DEFAULT_WHITESPACE_PAUSE);
    const isComplete                      = useAtomValue(isCompleteAtom);
    const recordings                      = useAtomValue(recordingsAtom);

    /*-- refs --*/
    const ctxRef           = useRef<AudioContext | null>(null);
    const bufCache         = useRef<Record<string, AudioBuffer>>({});
    const activeSourcesRef = useRef<AudioScheduledSourceNode[]>([]);
    const stopFlagRef      = useRef(false);

    /*-- lifecycle --*/
    useEffect(() => () => { stopSound(); ctxRef.current?.close(); bufCache.current = {}; }, []);
    useEffect(() => { bufCache.current = {}; }, [silenceThres]);

    /*-- helpers --*/
    const getContext = () => {
        if (!ctxRef.current) ctxRef.current = new AudioContext();
        return ctxRef.current;
    };

    const ensureContext = async () => {
        const ctx = getContext();
        if (ctx.state === 'suspended') await ctx.resume();
        return ctx;
    };

    const trimSilence = (buf: AudioBuffer) => {
        const ch0 = buf.getChannelData(0);

        /* peak of this letter */
        let peak = 0;
        for (let i = 0; i < ch0.length; i++) {
            const a = Math.abs(ch0[i]);
            if (a > peak) peak = a;
        }
        if (!peak) return buf;

        /* adaptive threshold */
        const thresh = peak * silenceThres;

        /* locate sound */
        let start = 0, end = ch0.length - 1;
        while (start < ch0.length && Math.abs(ch0[start]) < thresh) start++;
        while (end > start        && Math.abs(ch0[end])  < thresh) end--;

        if (start === 0 && end === ch0.length - 1) return buf;

        const len = end - start + 1;
        const ctx = getContext();
        const out = ctx.createBuffer(buf.numberOfChannels, len, buf.sampleRate);
        for (let c = 0; c < buf.numberOfChannels; c++) {
            out.copyToChannel(buf.getChannelData(c).subarray(start, end + 1), c);
        }
        return out;
    };

    const fadeAndNorm = (buf: AudioBuffer) => {
        const N = buf.length;
        if (!N) return buf;
        const fadeInSamp  = Math.min(Math.floor(buf.sampleRate * ATTACK), N);
        const fadeOutSamp = Math.min(Math.floor(buf.sampleRate * DECAY ), N);

        const ctx = getContext();
        const out = ctx.createBuffer(buf.numberOfChannels, N, buf.sampleRate);

        for (let c = 0; c < buf.numberOfChannels; c++) {
            const inp = buf.getChannelData(c);
            const outp = out.getChannelData(c);

            let peak = 0;
            for (let k = 0; k < N; k++) peak = Math.max(peak, Math.abs(inp[k]));
            const norm = peak ? TARGET_PEAK / peak : 1;

            for (let k = 0; k < N; k++) {
                let gain = 1;
                if (k < fadeInSamp)             gain = k / fadeInSamp;
                else if (k >= N - fadeOutSamp)  gain = (N - k) / fadeOutSamp;
                outp[k] = inp[k] * gain * norm;
            }
        }
        return out;
    };

    const stopSound = () => {
        activeSourcesRef.current.forEach(s => { try { s.stop(); } catch {} });
        activeSourcesRef.current = [];
        stopFlagRef.current = false;
        setIsPlaying(false);
    };

    /*-- play one character --*/
    const playChar = async (char: string, t0: number): Promise<number> => {
        if (stopFlagRef.current) throw new Error('stopped');
        if (char === ' ') return t0 + spacePause / speed;
        if (char === '.') return t0 + 0.5 / speed;
        if (!/[A-Za-z]/.test(char)) return t0 + 0.05 / speed;

        const L = char.toUpperCase();
        const key = `${L}_${silenceThres}`;
        if (!recordings[L]) return t0 + 0.05 / speed;

        const ctx = await ensureContext();

        if (!bufCache.current[key]) {
            const arr = await recordings[L].arrayBuffer();
            const raw = await ctx.decodeAudioData(arr);
            bufCache.current[key] = fadeAndNorm(trimSilence(raw));
        }

        const buf = bufCache.current[key];
        if (!buf) return t0 + 0.05 / speed;

        const src: AudioBufferSourceNode = ctx.createBufferSource();
        src.buffer = buf;

        /* independent pitch & speed */
        src.playbackRate.value = speed;
        src.detune.value =
            -1200 * Math.log2(speed) +
             1200 * Math.log2(pitch) +
             (Math.random() * 2 - 1) * PITCH_JITTER;

        const g = ctx.createGain();
        src.connect(g).connect(ctx.destination);

        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(1, t0 + XFADE);

        const dur = buf.duration / speed;
        g.gain.setValueAtTime(1, t0 + dur - XFADE);
        g.gain.linearRampToValueAtTime(0, t0 + dur);

        src.start(t0);
        activeSourcesRef.current.push(src);
        src.onended = () => {
            activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== src);
        };

        return t0 + dur - XFADE;           // overlap next char
    };

    /*-- public API --*/
    const generateAnimalese = async (text: string) => {
        if (!text.trim() || !isComplete) return;
        stopSound();
        stopFlagRef.current = false;
        setIsPlaying(true);

        try {
            const ctx = await ensureContext();
            let t = ctx.currentTime + 0.1;
            for (const c of text) t = await playChar(c, t);
            await new Promise(r => setTimeout(r, Math.max(0, (t - ctx.currentTime) * 1000 + 300)));
        } catch { /* stopped */ }
        finally { stopSound(); }
    };

    const requestStop = () => { stopFlagRef.current = true; stopSound(); };

    return {
        isPlaying,
        silenceThreshold : silenceThres,  setSilenceThreshold : setSilenceThres,
        pitch, setPitch,
        speed, setSpeed,
        whitespacePause : spacePause, setWhitespacePause : setSpacePause,
        isComplete,
        generateAnimalese,
        stopSound : requestStop
    };
};
