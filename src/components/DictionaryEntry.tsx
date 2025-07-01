
import React, { useState } from 'react';
import { DictionaryEntry as DictionaryEntryType } from '../types/dictionary';
import { Plus, Minus, Volume2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslatedContent } from '../hooks/useTranslatedContent';

interface DictionaryEntryProps {
  entry: DictionaryEntryType;
  originLabel: string;
}

const colorCombos = {
  1: {
    primaryBg: '#F6CBB9',
    secondaryBg: '#9A2A1B',
    primaryFg: '#000000',
    secondaryFg: '#FFFFFF'
  },
  2: {
    primaryBg: '#9A2A1B',
    secondaryBg: '#F6CBB9',
    primaryFg: '#FFFFFF',
    secondaryFg: '#000000'
  },
  3: {
    primaryBg: '#67DEA9',
    secondaryBg: '#4B5177',
    primaryFg: '#000000',
    secondaryFg: '#FFFFFF'
  },
  4: {
    primaryBg: '#4B5177',
    secondaryBg: '#FFFFFF',
    primaryFg: '#FFFFFF',
    secondaryFg: '#000000'
  }
};

const DictionaryEntry = ({ entry, originLabel }: DictionaryEntryProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = colorCombos[entry.colorCombo];

  const playAudio = () => {
    if (entry.audioUrl) {
      const audio = new Audio(entry.audioUrl);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    } else {
      // Create a simple beep sound as fallback
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  return (
    <div
      className="w-full transition-all duration-300 ease-in-out rounded-[20px]"
      style={{
        backgroundColor: colors.primaryBg,
        color: colors.primaryFg
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex justify-between items-center text-left focus:outline-none"
      >
        <div className="flex-1">
          <h2 className="font-funnel-display text-2xl font-bold">{entry.word}</h2>
          <p 
            className={`font-funnel-sans text-base font-light opacity-80 mt-2 ${!isExpanded ? 'hidden' : ''}`}
          >
            {entry.ipa}
          </p>
        </div>
        {isExpanded ? (
          <Minus size={23} style={{ color: colors.primaryFg }} />
        ) : (
          <Plus size={23} style={{ color: colors.primaryFg }} />
        )}
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 animate-accordion-down">
          <div className="space-y-5">
            {entry.definitions.map((definition, index) => (
              <div key={definition.id}>
                <div
                  className="inline-block px-3 py-1 rounded-full text-sm font-funnel-sans font-light mb-3 border-[1px]"
                  style={{
                    borderColor: colors.primaryFg,
                    color: colors.primaryFg,
                    backgroundColor: 'transparent'
                  }}
                >
                  {definition.grammaticalClass}
                </div>
                <p className="font-funnel-sans text-base font-bold mb-2">
                  {definition.meaning}
                </p>
                {definition.example && (
                  <p className="font-funnel-sans text-base font-light italic opacity-80">
                    "{definition.example}"
                  </p>
                )}
              </div>
            ))}
          </div>

          <div
            className="w-full h-px my-5 opacity-60"
            style={{ backgroundColor: colors.primaryFg }}
          />

          {entry.origin && (
            <p className="font-funnel-sans text-base font-light opacity-60 mb-5">
              {originLabel} {entry.origin}
            </p>
          )}

          {entry.audioUrl && (
            <div className="flex justify-end">
              <button
                onClick={playAudio}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: colors.secondaryBg
                }}
              >
                <Volume2
                  size={24}
                  style={{ color: colors.secondaryFg }}
                />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DictionaryEntry;
