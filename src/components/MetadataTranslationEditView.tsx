
import React, { useState, useEffect } from 'react';
import { DictionaryData } from '../types/dictionary';
import { ArrowLeft } from 'lucide-react';
import { useDictionaryTranslations } from '../hooks/useDictionaryTranslations';

interface MetadataTranslationEditViewProps {
  data: DictionaryData;
  language: 'de' | 'pt';
  onSave: () => void;
  onCancel: () => void;
}

const MetadataTranslationEditView = ({ data, language, onSave, onCancel }: MetadataTranslationEditViewProps) => {
  const {
    germanTranslation,
    setGermanTranslation,
    portugueseTranslation,
    setPortugueseTranslation,
    loading,
    saveDictionaryTranslation
  } = useDictionaryTranslations(data);

  const currentTranslation = language === 'de' ? germanTranslation : portugueseTranslation;
  const setCurrentTranslation = language === 'de' ? setGermanTranslation : setPortugueseTranslation;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Update local state when translations load
  useEffect(() => {
    setTitle(currentTranslation.title);
    setDescription(currentTranslation.description);
  }, [currentTranslation]);

  const handleSave = async () => {
    try {
      await saveDictionaryTranslation(language, title, description);
      
      // Update the state
      setCurrentTranslation({
        title: title,
        description: description
      });
      
      onSave();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const languageName = language === 'de' ? 'German' : 'Portuguese';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <h3 className="font-funnel-display text-lg font-bold">Back</h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="font-funnel-sans text-sm">Loading existing translations...</p>
        </div>
      </div>
    );
  }

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

      <h2 className="font-funnel-display text-2xl font-bold">Edit [{languageName}] Dictionary Information</h2>

      <div className="border border-gray-300 rounded-lg p-4 space-y-4">
        <div className="text-xs text-gray-500 mb-4">
          Original: {data.title} | {data.description}
        </div>
        
        <div>
          <label className="block font-funnel-sans font-bold mb-2">{languageName} Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg font-funnel-sans"
            placeholder={`${languageName} translation of: ${data.title}`}
          />
        </div>
        
        <div>
          <label className="block font-funnel-sans font-bold mb-2">{languageName} Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg font-funnel-sans h-20"
            placeholder={`${languageName} translation of: ${data.description}`}
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleSave}
          className="flex-1 p-3 bg-green-500 text-white rounded-lg font-funnel-sans font-bold hover:bg-green-600 transition-colors"
        >
          Save {languageName} Translation
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

export default MetadataTranslationEditView;
