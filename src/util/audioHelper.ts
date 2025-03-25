async function processAudioBlob(blob: Blob): Promise<Blob> {
    const arrayBuffer = await blob.arrayBuffer()
    const audioContext = new AudioContext()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    // Apply a 20ms fade in/out to smooth the attack/release
    applyFade(audioBuffer, 0.02)

    // Convert the processed AudioBuffer to a WAV Blob
    return audioBufferToWavBlob(audioBuffer)
}

function applyFade(buffer: AudioBuffer, fadeDurationSec: number) {
    const sampleRate = buffer.sampleRate
    const fadeSamples = Math.floor(fadeDurationSec * sampleRate)

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const channelData = buffer.getChannelData(channel)
        const len = channelData.length

        // Fade in: ramp from 0 to 1 over the first fadeSamples
        for (let i = 0; i < fadeSamples && i < len; i++) {
            // Cosine ramp: (1 - cos(pi * (i / fadeSamples))) / 2
            const ramp = (1 - Math.cos((i / fadeSamples) * Math.PI)) / 2
            channelData[i] *= ramp
          }

        // Fade out: ramp from 1 to 0 over the last fadeSamples
        for (let i = 0; i < fadeSamples && i < len; i++) {
            channelData[len - fadeSamples + i] *= (fadeSamples - i) / fadeSamples
        }
    }
}

function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
    const numOfChan = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const bitDepth = 16
    let result: Float32Array

    if (numOfChan === 2) {
        result = interleave(buffer.getChannelData(0), buffer.getChannelData(1))
    } else {
        result = buffer.getChannelData(0)
    }

    const bytesPerSample = bitDepth / 8
    const blockAlign = numOfChan * bytesPerSample
    const bufferLength = result.length * bytesPerSample
    const wavBuffer = new ArrayBuffer(44 + bufferLength)
    const view = new DataView(wavBuffer)

    // RIFF header
    writeString(view, 0, 'RIFF')
    view.setUint32(4, 36 + bufferLength, true)
    writeString(view, 8, 'WAVE')
    writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true) // PCM format
    view.setUint16(22, numOfChan, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * blockAlign, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitDepth, true)
    writeString(view, 36, 'data')
    view.setUint32(40, bufferLength, true)

    let offset = 44
    for (let i = 0; i < result.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, result[i]))
        s = s < 0 ? s * 0x8000 : s * 0x7FFF
        view.setInt16(offset, s, true)
    }

    return new Blob([view], { type: 'audio/wav' })

    function interleave(inputL: Float32Array, inputR: Float32Array) {
        const length = inputL.length + inputR.length
        const result = new Float32Array(length)
        let index = 0, inputIndex = 0
        while (index < length) {
            result[index++] = inputL[inputIndex]
            result[index++] = inputR[inputIndex]
            inputIndex++
        }
        return result
    }

    function writeString(view: DataView, offset: number, str: string) {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i))
        }
    }
}

export default processAudioBlob
