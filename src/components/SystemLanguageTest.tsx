
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const SystemLanguageTest = () => {
  const { currentLanguage, setCurrentLanguage } = useLanguage();

  const testLanguageDetection = () => {
    const systemLanguage = navigator.language.toLowerCase();
    
    alert(`Your system language is: ${navigator.language}
Current app language: ${currentLanguage}
    
System language detection logic:
- If system starts with 'de' → German
- If system starts with 'pt' → Portuguese  
- Everything else → English

To test other languages, temporarily change your browser language in settings and refresh the page (or clear localStorage).`);
  };

  const simulateLanguage = (lang: string) => {
    // Temporarily override navigator.language for testing
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: lang
    });
    
    localStorage.removeItem('dictionary-language');
    alert(`Simulated system language set to: ${lang}. Refreshing page to test detection...`);
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50">
      <h4 className="font-funnel-display font-bold mb-2 text-sm">Language Test Panel</h4>
      <div className="space-y-2 text-xs">
        <div>System: {navigator.language}</div>
        <div>App: {currentLanguage}</div>
        <button
          onClick={testLanguageDetection}
          className="block w-full p-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
        >
          Test Info
        </button>
        <button
          onClick={() => simulateLanguage('de-DE')}
          className="block w-full p-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
        >
          Test German
        </button>
        <button
          onClick={() => simulateLanguage('pt-BR')}
          className="block w-full p-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
        >
          Test Portuguese
        </button>
        <button
          onClick={() => simulateLanguage('es-ES')}
          className="block w-full p-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
        >
          Test Other (Spanish)
        </button>
      </div>
    </div>
  );
};

export default SystemLanguageTest;
