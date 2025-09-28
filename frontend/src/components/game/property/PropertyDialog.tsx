import React from 'react';
import { useGameContext } from '@/context/GameContext';
import Image from 'next/image';

export default function PropertyDialog() {
  const { 
    propertyDialog,
    closePropertyDialog, 
    mintProperty 
  } = useGameContext();

  const { isOpen, currentProperty, isMinting } = propertyDialog;

  if (!isOpen || !currentProperty) return null;

  const isSpecialProperty = currentProperty.type === 'special';

  const handleMint = () => {
    mintProperty();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{currentProperty.name}</h3>
          <button
            onClick={closePropertyDialog}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          {currentProperty.image && (
            <div className="flex justify-center mb-3">
              <Image 
                src={currentProperty.image} 
                alt={currentProperty.name} 
                width={200}
                height={200}
                className="rounded"
              />
            </div>
          )}
          
          <p className="text-gray-700">{currentProperty.description}</p>
          
          {isSpecialProperty && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-100">
              <h4 className="font-semibold text-yellow-700">Coming Soon</h4>
              <p className="text-yellow-600 text-sm mt-1">
                This is a special DAO property. In the future, you&apos;ll be able to participate 
                in governance decisions and earn rewards based on property performance.
              </p>
            </div>
          )}
          
          <div className="mt-4">
            <h4 className="font-semibold">Property Details:</h4>
            <ul className="mt-1 text-sm text-gray-600">
              <li>Position: {currentProperty.position}</li>
              <li>Type: {currentProperty.type}</li>
              <li>Value: {currentProperty.value} tokens</li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={closePropertyDialog}
            className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Close
          </button>
          
          {!isSpecialProperty && (
            <button
              onClick={handleMint}
              disabled={isMinting}
              className={`px-4 py-2 ${isMinting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded`}
            >
              {isMinting ? 'Minting...' : 'Mint NFT'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}