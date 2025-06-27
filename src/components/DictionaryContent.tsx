
import React from 'react';
import { DictionaryData } from '../types/dictionary';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../hooks/useTranslations';
import DictionaryEntry from './DictionaryEntry';

interface DictionaryContentProps {
  data: DictionaryData | null;
  loading: boolean;
}

const DictionaryContent = ({ data, loading }: DictionaryContentProps) => {
  const { currentLanguage } = useLanguage();
  const { translations } = useTranslations();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading dictionary...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">No dictionary data available</div>
      </div>
    );
  }

  // Get translated title and description
  const getTranslatedText = (originalText: string, translatedText?: string) => {
    if (currentLanguage === 'en') return originalText;
    return translatedText || `${originalText} [Translation needed]`;
  };

  const dictionaryTranslation = translations.dictionaryTranslations[currentLanguage as 'de' | 'pt'];
  const title = getTranslatedText(data.title, dictionaryTranslation?.title);
  const description = getTranslatedText(data.description, dictionaryTranslation?.description);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-funnel-display text-3xl font-bold mb-2">{title}</h1>
        <p className="font-funnel-sans text-gray-600">{description}</p>
      </div>

      <div className="space-y-4">
        {data.entries.map((entry) => (
          <DictionaryEntry 
            key={entry.id} 
            entry={entry}
            entryTranslation={translations.entryTranslations[entry.id]}
            definitionTranslations={entry.definitions.reduce((acc, def) => {
              acc[def.id] = translations.definitionTranslations[def.id];
              return acc;
            }, {} as Record<string, any>)}
          />
        ))}
      </div>
    </div>
  );
};

export default DictionaryContent;
