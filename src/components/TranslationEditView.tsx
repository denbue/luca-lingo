
import React, { useState } from 'react';
import { DictionaryEntry } from '../types/dictionary';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface TranslationEditViewProps {
  entry: DictionaryEntry | null;
  onSave: (entryId: string, translations: any) => void;
  onCancel: () => void;
}

const TranslationEditView = ({ entry, onSave, onCancel }: TranslationEditViewProps) => {
  const { translateText, isTranslating } = useTranslation();
  
  const [germanTranslations, setGermanTranslations] = useState({
    definitions: entry?.definitions.map(def => ({
      id: def.id,
      grammaticalClass: '',
      meaning: '',
      example: ''
    })) || [],
    origin: ''
  });

  const [portugueseTranslations, setPortugueseTranslations] = useState({
    definitions: entry?.definitions.map(def => ({
      id: def.id,
      grammaticalClass: '',
      meaning: '',
      example: ''
    })) || [],
    origin: ''
  });

  const handleSave = () => {
    if (!entry) return;
    
    onSave(entry.id, {
      german: germanTranslations,
      portuguese: portugueseTranslations
    });
  };

  const handleTranslateGerman = async () => {
    if (!entry) return;

    // Translate origin
    if (entry.origin) {
      const translatedOrigin = await translateText(entry.origin, 'de', 'word origin/etymology');
      setGermanTranslations(prev => ({ ...prev, origin: translatedOrigin }));
    }

    // Translate definitions
    const translatedDefinitions = await Promise.all(
      entry.definitions.map(async (def) => {
        const [grammaticalClass, meaning, example] = await Promise.all([
          def.grammaticalClass ? translateText(def.grammaticalClass, 'de', 'grammatical class') : '',
          def.meaning ? translateText(def.meaning, 'de', 'definition meaning') : '',
          def.example ? translateText(def.example, 'de', 'usage example') : ''
        ]);

        return {
          id: def.id,
          grammaticalClass,
          meaning,
          example
        };
      })
    );

    setGermanTranslations(prev => ({ ...prev, definitions: translatedDefinitions }));
  };

  const handleTranslatePortuguese = async () => {
    if (!entry) return;

    // Translate origin
    if (entry.origin) {
      const translatedOrigin = await translateText(entry.origin, 'pt', 'word origin/etymology');
      setPortugueseTranslations(prev => ({ ...prev, origin: translatedOrigin }));
    }

    // Translate definitions
    const translatedDefinitions = await Promise.all(
      entry.definitions.map(async (def) => {
        const [grammaticalClass, meaning, example] = await Promise.all([
          def.grammaticalClass ? translateText(def.grammaticalClass, 'pt', 'grammatical class') : '',
          def.meaning ? translateText(def.meaning, 'pt', 'definition meaning') : '',
          def.example ? translateText(def.example, 'pt', 'usage example') : ''
        ]);

        return {
          id: def.id,
          grammaticalClass,
          meaning,
          example
        };
      })
    );

    setPortugueseTranslations(prev => ({ ...prev, definitions: translatedDefinitions }));
  };

  if (!entry) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
        </button>
        <h3 className="font-funnel-display text-lg font-bold">Back</h3>
      </div>

      <h2 className="font-funnel-display text-2xl font-bold">Edit "{entry.word}"</h2>

      <div className="space-y-6">
        {/* German Translations */}
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-funnel-display font-bold">[German] Translations</h4>
            <button
              onClick={handleTranslateGerman}
              disabled={isTranslating}
              className="flex items-center space-x-2 px-3 py-2 bg-purple-500 text-white rounded-lg font-funnel-sans text-sm hover:bg-purple-600 transition-colors disabled:opacity-50"
            >
              <Sparkles size={16} />
              <span>{isTranslating ? 'Translating...' : 'Translate with AI'}</span>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block font-funnel-sans font-bold mb-1 text-sm">Origin</label>
              <input
                type="text"
                value={germanTranslations.origin}
                onChange={(e) => setGermanTranslations(prev => ({ ...prev, origin: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded font-funnel-sans text-sm"
                placeholder={`German translation of: ${entry.origin}`}
              />
            </div>

            <div>
              <label className="block font-funnel-sans font-bold mb-2 text-sm">Definitions</label>
              {entry.definitions.map((def, index) => (
                <div key={def.id} className="border border-gray-200 rounded p-3 mb-3">
                  <div className="text-xs text-gray-500 mb-2">
                    Original: {def.grammaticalClass} - {def.meaning}
                    {def.example && ` (Example: ${def.example})`}
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="German grammatical class"
                      value={germanTranslations.definitions[index]?.grammaticalClass || ''}
                      onChange={(e) => {
                        const newDefs = [...germanTranslations.definitions];
                        newDefs[index] = { ...newDefs[index], grammaticalClass: e.target.value };
                        setGermanTranslations(prev => ({ ...prev, definitions: newDefs }));
                      }}
                      className="w-full p-2 border border-gray-300 rounded font-funnel-sans text-xs"
                    />
                    <textarea
                      placeholder="German meaning"
                      value={germanTranslations.definitions[index]?.meaning || ''}
                      onChange={(e) => {
                        const newDefs = [...germanTranslations.definitions];
                        newDefs[index] = { ...newDefs[index], meaning: e.target.value };
                        setGermanTranslations(prev => ({ ...prev, definitions: newDefs }));
                      }}
                      className="w-full p-2 border border-gray-300 rounded font-funnel-sans text-xs h-16"
                    />
                    <input
                      type="text"
                      placeholder="German example (optional)"
                      value={germanTranslations.definitions[index]?.example || ''}
                      onChange={(e) => {
                        const newDefs = [...germanTranslations.definitions];
                        newDefs[index] = { ...newDefs[index], example: e.target.value };
                        setGermanTranslations(prev => ({ ...prev, definitions: newDefs }));
                      }}
                      className="w-full p-2 border border-gray-300 rounded font-funnel-sans text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Portuguese Translations */}
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-funnel-display font-bold">[Portuguese] Translations</h4>
            <button
              onClick={handleTranslatePortuguese}
              disabled={isTranslating}
              className="flex items-center space-x-2 px-3 py-2 bg-purple-500 text-white rounded-lg font-funnel-sans text-sm hover:bg-purple-600 transition-colors disabled:opacity-50"
            >
              <Sparkles size={16} />
              <span>{isTranslating ? 'Translating...' : 'Translate with AI'}</span>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block font-funnel-sans font-bold mb-1 text-sm">Origin</label>
              <input
                type="text"
                value={portugueseTranslations.origin}
                onChange={(e) => setPortugueseTranslations(prev => ({ ...prev, origin: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded font-funnel-sans text-sm"
                placeholder={`Portuguese translation of: ${entry.origin}`}
              />
            </div>

            <div>
              <label className="block font-funnel-sans font-bold mb-2 text-sm">Definitions</label>
              {entry.definitions.map((def, index) => (
                <div key={def.id} className="border border-gray-200 rounded p-3 mb-3">
                  <div className="text-xs text-gray-500 mb-2">
                    Original: {def.grammaticalClass} - {def.meaning}
                    {def.example && ` (Example: ${def.example})`}
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Portuguese grammatical class"
                      value={portugueseTranslations.definitions[index]?.grammaticalClass || ''}
                      onChange={(e) => {
                        const newDefs = [...portugueseTranslations.definitions];
                        newDefs[index] = { ...newDefs[index], grammaticalClass: e.target.value };
                        setPortugueseTranslations(prev => ({ ...prev, definitions: newDefs }));
                      }}
                      className="w-full p-2 border border-gray-300 rounded font-funnel-sans text-xs"
                    />
                    <textarea
                      placeholder="Portuguese meaning"
                      value={portugueseTranslations.definitions[index]?.meaning || ''}
                      onChange={(e) => {
                        const newDefs = [...portugueseTranslations.definitions];
                        newDefs[index] = { ...newDefs[index], meaning: e.target.value };
                        setPortugueseTranslations(prev => ({ ...prev, definitions: newDefs }));
                      }}
                      className="w-full p-2 border border-gray-300 rounded font-funnel-sans text-xs h-16"
                    />
                    <input
                      type="text"
                      placeholder="Portuguese example (optional)"
                      value={portugueseTranslations.definitions[index]?.example || ''}
                      onChange={(e) => {
                        const newDefs = [...portugueseTranslations.definitions];
                        newDefs[index] = { ...newDefs[index], example: e.target.value };
                        setPortugueseTranslations(prev => ({ ...prev, definitions: newDefs }));
                      }}
                      className="w-full p-2 border border-gray-300 rounded font-funnel-sans text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleSave}
          className="flex-1 p-3 bg-green-500 text-white rounded-lg font-funnel-sans font-bold hover:bg-green-600 transition-colors"
        >
          Save Translations
        </button>
        <button
          onClick={onCancel}
          className="flex-1 p-3 bg-gray-500 text-white rounded-lg font-funnel-sans font-bold hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TranslationEditView;
