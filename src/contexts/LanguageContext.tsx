
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '../types/translations';

interface LanguageContextType {
  currentLanguage: Language;
  setCurrentLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

// Function to detect system language and map it to supported languages
const detectSystemLanguage = (): Language => {
  const systemLanguage = navigator.language.toLowerCase();
  console.log('Detected system language:', systemLanguage);
  
  // Check for German variants
  if (systemLanguage.startsWith('de')) {
    console.log('System language detected as German variant, setting to German');
    return 'de';
  }
  
  // Check for Portuguese variants
  if (systemLanguage.startsWith('pt')) {
    console.log('System language detected as Portuguese variant, setting to Portuguese');
    return 'pt';
  }
  
  // Default to English for everything else
  console.log('System language not German or Portuguese, defaulting to English');
  return 'en';
};

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [currentLanguage, setCurrentLanguageState] = useState<Language>('en');

  // Load saved language on mount, or use system language detection
  useEffect(() => {
    const savedLanguage = localStorage.getItem('dictionary-language') as Language;
    
    if (savedLanguage && ['en', 'de', 'pt'].includes(savedLanguage)) {
      console.log('Using saved language:', savedLanguage);
      setCurrentLanguageState(savedLanguage);
    } else {
      // No saved language, use system language detection
      const detectedLanguage = detectSystemLanguage();
      console.log('No saved language, using detected language:', detectedLanguage);
      setCurrentLanguageState(detectedLanguage);
      localStorage.setItem('dictionary-language', detectedLanguage);
    }
  }, []);

  // Save language when it changes
  const setCurrentLanguage = (language: Language) => {
    console.log('Setting language to:', language);
    setCurrentLanguageState(language);
    localStorage.setItem('dictionary-language', language);
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setCurrentLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
