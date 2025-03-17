import React from 'react'

const RecordVoice: React.FC = () => {
  return (
    <div className="record-voice p-4 rounded-lg border border-gray">
      <h2 className="text-2xl font-bold mb-2">Record Your Voice</h2>
      <div className="flex flex-col items-center gap-4">
        <button className="bg-blue p-3 rounded-full text-white">
          <span className="w-12 h-12 flex items-center justify-center">🎙️</span>
        </button>
        <p>Click the microphone to start recording</p>
        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full w-0 bg-green"></div>
        </div>
      </div>
    </div>
  )
}

export default RecordVoice 