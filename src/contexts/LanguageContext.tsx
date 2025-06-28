
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

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [currentLanguage, setCurrentLanguageState] = useState<Language>('en');

  // Load saved language on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('dictionary-language') as Language;
    if (savedLanguage && ['en', 'de', 'pt'].includes(savedLanguage)) {
      setCurrentLanguageState(savedLanguage);
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
