
import React, { useState, useEffect } from 'react';

interface PinEntryProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const PinEntry = ({ onSuccess, onCancel }: PinEntryProps) => {
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(false);

  const correctPin = '3047';

  const handleNumberPress = (number: string) => {
    if (currentIndex < 4) {
      const newPin = [...pin];
      newPin[currentIndex] = number;
      setPin(newPin);
      setCurrentIndex(currentIndex + 1);
      setError(false);
      
      if (currentIndex === 3) {
        const enteredPin = newPin.join('');
        if (enteredPin === correctPin) {
          onSuccess();
        } else {
          setError(true);
          setTimeout(() => {
            setPin(['', '', '', '']);
            setCurrentIndex(0);
            setError(false);
          }, 1000);
        }
      }
    }
  };

  const handleDelete = () => {
    if (currentIndex > 0) {
      const newPin = [...pin];
      newPin[currentIndex - 1] = '';
      setPin(newPin);
      setCurrentIndex(currentIndex - 1);
      setError(false);
    }
  };

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-5">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <h3 className="font-funnel-display text-xl font-bold text-gray-800 mb-2">Enter PIN</h3>
          <p className="text-gray-600 font-funnel-sans text-sm">Enter the 4-digit PIN to edit</p>
        </div>

        <div className="flex justify-center mb-8 space-x-3">
          {pin.map((digit, index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 ${
                digit 
                  ? error 
                    ? 'bg-red-500 border-red-500' 
                    : 'bg-gray-800 border-gray-800'
                  : 'border-gray-300'
              } transition-colors duration-200`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {numbers.slice(0, 9).map((number) => (
            <button
              key={number}
              onClick={() => handleNumberPress(number)}
              className="h-16 rounded-xl bg-gray-100 font-funnel-sans text-2xl font-medium text-gray-800 active:bg-gray-200 transition-colors duration-150"
            >
              {number}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleNumberPress('0')}
            className="h-16 rounded-xl bg-gray-100 font-funnel-sans text-2xl font-medium text-gray-800 active:bg-gray-200 transition-colors duration-150"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-16 rounded-xl bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors duration-150"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-600">
              <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 8l-4 4 4 4M12 8l-4 4 4 4" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>

        <button
          onClick={onCancel}
          className="w-full py-3 text-gray-600 font-funnel-sans font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PinEntry;
