import React from 'react'

const HowItWorks: React.FC = () => {
  return (
    <div className="how-it-works p-4 rounded-lg border border-gray">
      <h2 className="text-2xl font-bold mb-2">How It Works</h2>
      <ol className="list-decimal ml-5 space-y-2">
        <li>Record your voice using the microphone</li>
        <li>Select your preferred animal voice style</li>
        <li>Generate your Animalese speech</li>
        <li>Download or share your creation</li>
      </ol>
    </div>
  )
}

export default HowItWorks 