
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Language, LANGUAGES } from '../types/translations';

const LanguageSelector = () => {
  const { currentLanguage, setCurrentLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageSelect = (language: Language) => {
    setCurrentLanguage(language);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-block px-3 py-1 rounded-full text-sm font-funnel-sans font-light border-[0.5px] border-black bg-transparent hover:bg-gray-100 transition-colors"
      >
        {LANGUAGES[currentLanguage]}
      </button>

      {isOpen && (
        <select
          value={currentLanguage}
          onChange={(e) => handleLanguageSelect(e.target.value as Language)}
          onBlur={() => setIsOpen(false)}
          className="absolute top-0 left-0 w-full opacity-0 cursor-pointer"
          size={3}
          autoFocus
        >
          {Object.entries(LANGUAGES).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      )}

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-32">
          {Object.entries(LANGUAGES).map(([code, name]) => (
            <button
              key={code}
              onClick={() => handleLanguageSelect(code as Language)}
              className={`w-full text-left px-3 py-2 text-sm font-funnel-sans hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                currentLanguage === code ? 'bg-blue-50 text-blue-600 font-bold' : ''
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
