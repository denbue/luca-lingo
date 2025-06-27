import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Volume2 } from 'lucide-react';
import { DictionaryEntry as DictionaryEntryType } from '../types/dictionary';
import { useLanguage } from '../contexts/LanguageContext';

interface DictionaryEntryProps {
  entry: DictionaryEntryType;
  entryTranslation?: {
    de?: { origin: string };
    pt?: { origin: string };
  };
  definitionTranslations?: Record<string, {
    de?: { grammaticalClass: string; meaning: string; example?: string };
    pt?: { grammaticalClass: string; meaning: string; example?: string };
  }>;
}

const DictionaryEntry = ({ entry, entryTranslation, definitionTranslations }: DictionaryEntryProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    if (entry.audioUrl) {
      const newAudio = new Audio(entry.audioUrl);
      setAudio(newAudio);
      audioRef.current = newAudio;
    }

    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [entry.audioUrl]);

  const playAudio = () => {
    if (audio) {
      audio.play();
    }
  };

  const colors: Record<1 | 2 | 3 | 4, string> = {
    1: '#F6CBB9',
    2: '#9A2A1B',
    3: '#67DEA9',
    4: '#4B5177'
  };

  const getTranslatedText = (originalText: string, translatedText?: string) => {
    if (currentLanguage === 'en') return originalText;
    return translatedText || `${originalText} [Translation needed]`;
  };

  const entryTranslationData = entryTranslation?.[currentLanguage as 'de' | 'pt'];
  const translatedOrigin = getTranslatedText(entry.origin, entryTranslationData?.origin);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: colors[entry.colorCombo] }}
            />
            <div>
              <h3 className="font-funnel-display text-lg font-bold">{entry.word}</h3>
              {entry.ipa && (
                <p className="font-funnel-sans text-sm text-gray-600">{entry.ipa}</p>
              )}
            </div>
            {entry.audioUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playAudio();
                }}
                className="text-blue-500 hover:text-blue-700 transition-colors"
              >
                <Volume2 size={20} />
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200">
          <div className="space-y-4 mt-4">
            {entry.definitions.map((definition, index) => {
              const defTranslation = definitionTranslations?.[definition.id]?.[currentLanguage as 'de' | 'pt'];
              const translatedGrammaticalClass = getTranslatedText(definition.grammaticalClass, defTranslation?.grammaticalClass);
              const translatedMeaning = getTranslatedText(definition.meaning, defTranslation?.meaning);
              const translatedExample = definition.example ? getTranslatedText(definition.example, defTranslation?.example) : undefined;

              return (
                <div key={definition.id} className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-funnel-sans font-bold">
                      {translatedGrammaticalClass}
                    </span>
                  </div>
                  <p className="font-funnel-sans text-gray-800 leading-relaxed">
                    {translatedMeaning}
                  </p>
                  {translatedExample && (
                    <p className="font-funnel-sans text-sm text-gray-600 italic">
                      "{translatedExample}"
                    </p>
                  )}
                </div>
              );
            })}
            
            {translatedOrigin && (
              <div className="pt-2 border-t border-gray-100">
                <p className="font-funnel-sans text-xs text-gray-500">
                  <span className="font-bold">Origin:</span> {translatedOrigin}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {entry.audioUrl && (
        <audio ref={audioRef} preload="none">
          <source src={entry.audioUrl} type="audio/mpeg" />
        </audio>
      )}
    </div>
  );
};

export default DictionaryEntry;
