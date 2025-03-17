import React from 'react'

const CreateVoice: React.FC = () => {
  return (
    <div className="create-voice p-4 rounded-lg border border-gray">
      <h2 className="text-2xl font-bold mb-2">Create Animalese</h2>
      <div className="space-y-4">
        <div className="form-group">
          <label className="block mb-1">Animal Type:</label>
          <select className="w-full p-2 border border-gray rounded-md bg-white dark:bg-gray-800">
            <option>Dog</option>
            <option>Cat</option>
            <option>Mouse</option>
            <option>Fox</option>
          </select>
        </div>
        <div className="form-group">
          <label className="block mb-1">Pitch:</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            defaultValue="50" 
            className="w-full" 
          />
        </div>
        <button className="w-full bg-green p-2 rounded-md text-white font-bold">
          Generate Animalese
        </button>
      </div>
    </div>
  )
}

export default CreateVoice 