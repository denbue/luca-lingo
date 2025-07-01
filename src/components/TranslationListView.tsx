
import React from 'react';
import { DictionaryData } from '../types/dictionary';
import { Edit, ArrowLeft } from 'lucide-react';
import { useDictionaryTranslations } from '../hooks/useDictionaryTranslations';

interface TranslationListViewProps {
  data: DictionaryData;
  onEditEntry: (entryId: string) => void;
  onEditMetadata: (language: 'de' | 'pt') => void;
  onBackToEditSelector: () => void;
}

const TranslationListView = ({ data, onEditEntry, onEditMetadata, onBackToEditSelector }: TranslationListViewProps) => {
  const { germanTranslation, portugueseTranslation, loading } = useDictionaryTranslations(data);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToEditSelector}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={20} />
          </button>
          <h3 className="font-funnel-display text-lg font-bold">Back</h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="font-funnel-sans text-sm">Loading translations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={onBackToEditSelector}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
        </button>
        <h3 className="font-funnel-display text-lg font-bold">Back</h3>
      </div>

      <h2 className="font-funnel-display text-2xl font-bold">Manage Translations</h2>

      {/* Dictionary metadata sections */}
      <div className="space-y-4">
        {/* German Section */}
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-funnel-display text-lg font-bold">[German] Dictionary Information</h3>
            <button
              onClick={() => onEditMetadata('de')}
              className="text-blue-500 hover:text-blue-700"
            >
              <Edit size={18} />
            </button>
          </div>
          <div className="space-y-2">
            <div>
              <span className="font-funnel-sans font-bold text-sm">Title: </span>
              <span className="font-funnel-sans text-sm">
                {germanTranslation.title || `${data.title} (German translation needed)`}
              </span>
            </div>
            <div>
              <span className="font-funnel-sans font-bold text-sm">Description: </span>
              <span className="font-funnel-sans text-sm">
                {germanTranslation.description || `${data.description} (German translation needed)`}
              </span>
            </div>
            <div>
              <span className="font-funnel-sans font-bold text-sm">Origin Label: </span>
              <span className="font-funnel-sans text-sm">
                {germanTranslation.originLabel || 'Herkunft: (German translation needed)'}
              </span>
            </div>
          </div>
        </div>

        {/* Portuguese Section */}
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-funnel-display text-lg font-bold">[Portuguese] Dictionary Information</h3>
            <button
              onClick={() => onEditMetadata('pt')}
              className="text-blue-500 hover:text-blue-700"
            >
              <Edit size={18} />
            </button>
          </div>
          <div className="space-y-2">
            <div>
              <span className="font-funnel-sans font-bold text-sm">Title: </span>
              <span className="font-funnel-sans text-sm">
                {portugueseTranslation.title || `${data.title} (Portuguese translation needed)`}
              </span>
            </div>
            <div>
              <span className="font-funnel-sans font-bold text-sm">Description: </span>
              <span className="font-funnel-sans text-sm">
                {portugueseTranslation.description || `${data.description} (Portuguese translation needed)`}
              </span>
            </div>
            <div>
              <span className="font-funnel-sans font-bold text-sm">Origin Label: </span>
              <span className="font-funnel-sans text-sm">
                {portugueseTranslation.originLabel || 'Origem: (Portuguese translation needed)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Entries list section */}
      <div className="border border-gray-300 rounded-lg p-4">
        <div className="mb-4">
          <h3 className="font-funnel-display text-lg font-bold">Dictionary Entries ({data.entries.length})</h3>
          <p className="font-funnel-sans text-sm text-gray-600 mt-1">
            Click on any entry to manage its translations
          </p>
        </div>

        <div className="space-y-2">
          {data.entries.map((entry) => (
            <div 
              key={entry.id} 
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => onEditEntry(entry.id)}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ 
                    backgroundColor: entry.colorCombo === 1 ? '#F6CBB9' : 
                                   entry.colorCombo === 2 ? '#9A2A1B' :
                                   entry.colorCombo === 3 ? '#67DEA9' : '#4B5177'
                  }}
                />
                <h4 className="font-funnel-display font-bold">{entry.word}</h4>
              </div>
            </div>
          ))}
          
          {data.entries.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="font-funnel-sans text-sm">No entries to translate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranslationListView;
