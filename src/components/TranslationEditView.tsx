import React, { useState } from 'react';
import { DictionaryEntry } from '../types/dictionary';
import { ArrowLeft } from 'lucide-react';

interface TranslationEditViewProps {
  entry: DictionaryEntry | null;
  onSave: (entryId: string, translations: any) => void;
  onCancel: () => void;
}

const TranslationEditView = ({ entry, onSave, onCancel }: TranslationEditViewProps) => {
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
          <h4 className="font-funnel-display font-bold mb-4">[German] Translations</h4>
          
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
          <h4 className="font-funnel-display font-bold mb-4">[Portuguese] Translations</h4>
          
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
