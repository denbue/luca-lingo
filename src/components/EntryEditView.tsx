
import React, { useState } from 'react';
import { DictionaryEntry, Definition } from '../types/dictionary';
import { Plus, Minus, Upload, X, ArrowLeft } from 'lucide-react';

interface EntryEditViewProps {
  entry: DictionaryEntry | null;
  onSave: (entry: DictionaryEntry) => void;
  onCancel: () => void;
  isNew?: boolean;
}

// Helper function to generate proper UUIDs
const generateUUID = () => {
  return crypto.randomUUID();
};

const EntryEditView = ({ entry, onSave, onCancel, isNew = false }: EntryEditViewProps) => {
  const [formData, setFormData] = useState<DictionaryEntry>(
    entry || {
      id: generateUUID(),
      word: '',
      ipa: '',
      definitions: [{ id: generateUUID(), grammaticalClass: '', meaning: '' }],
      origin: '',
      colorCombo: 1
    }
  );
  const [audioFileName, setAudioFileName] = useState<string>('');

  const handleAudioUpload = (file: File) => {
    // Validate file format
    const allowedFormats = ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg', 'audio/mpeg'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedFormats.includes(file.type)) {
      alert('Unsupported audio format. Please use MP3, WAV, M4A, or OGG files.');
      return;
    }
    
    if (file.size > maxSize) {
      alert('File too large. Please use files smaller than 5MB.');
      return;
    }

    // Store filename for display
    setAudioFileName(file.name);

    // Convert to base64 for proper persistence
    const reader = new FileReader();
    reader.onload = (e) => {
      const audioUrl = e.target?.result as string;
      setFormData({ ...formData, audioUrl });
    };
    reader.readAsDataURL(file);
  };

  const removeAudio = () => {
    setFormData({ ...formData, audioUrl: undefined });
    setAudioFileName('');
  };

  const addDefinition = () => {
    const newDefinition: Definition = {
      id: generateUUID(),
      grammaticalClass: '',
      meaning: ''
    };
    
    setFormData({
      ...formData,
      definitions: [...formData.definitions, newDefinition]
    });
  };

  const updateDefinition = (defId: string, updates: Partial<Definition>) => {
    setFormData({
      ...formData,
      definitions: formData.definitions.map(def =>
        def.id === defId ? { ...def, ...updates } : def
      )
    });
  };

  const removeDefinition = (defId: string) => {
    if (formData.definitions.length <= 1) return; // Don't allow removing the last definition
    
    setFormData({
      ...formData,
      definitions: formData.definitions.filter(def => def.id !== defId)
    });
  };

  const handleSave = () => {
    if (!formData.word.trim()) {
      alert('Please enter a word');
      return;
    }
    
    if (formData.definitions.some(def => !def.meaning.trim())) {
      alert('Please fill in all definition meanings');
      return;
    }
    
    onSave(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={20} />
          </button>
          <h3 className="font-funnel-display text-lg font-bold">
            {isNew ? 'Add New Entry' : `Edit "${entry?.word}"`}
          </h3>
        </div>
      </div>

      <div className="border border-gray-300 rounded-lg p-4 space-y-4">
        <div>
          <label className="block font-funnel-sans font-bold mb-1 text-sm">Word</label>
          <input
            type="text"
            value={formData.word}
            onChange={(e) => setFormData({ ...formData, word: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded font-funnel-sans text-sm"
            placeholder="Enter the word"
          />
        </div>

        <div>
          <label className="block font-funnel-sans font-bold mb-1 text-sm">IPA Pronunciation</label>
          <input
            type="text"
            value={formData.ipa}
            onChange={(e) => setFormData({ ...formData, ipa: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded font-funnel-sans text-sm"
            placeholder="Enter IPA pronunciation (optional)"
          />
        </div>

        <div>
          <label className="block font-funnel-sans font-bold mb-1 text-sm">Audio File</label>
          <p className="text-xs text-gray-600 mb-2">
            Supported formats: MP3, WAV, M4A, OGG • Maximum size: 5MB
          </p>
          
          {formData.audioUrl ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 font-funnel-sans text-sm">
                    ✓ {audioFileName || 'Audio file uploaded'}
                  </span>
                </div>
                <button
                  onClick={removeAudio}
                  className="text-red-500 hover:text-red-700"
                  title="Remove audio"
                >
                  <X size={16} />
                </button>
              </div>
              
              <audio controls className="w-full h-8">
                <source src={formData.audioUrl} />
                Your browser does not support the audio element.
              </audio>
              
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".mp3,.wav,.m4a,.ogg,audio/mp3,audio/wav,audio/m4a,audio/ogg,audio/mpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleAudioUpload(file);
                    }
                  }}
                  className="hidden"
                  id="audio-replace"
                />
                <label
                  htmlFor="audio-replace"
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 font-funnel-sans text-sm"
                >
                  <Upload size={16} />
                  <span>Replace Audio</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept=".mp3,.wav,.m4a,.ogg,audio/mp3,audio/wav,audio/m4a,audio/ogg,audio/mpeg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleAudioUpload(file);
                  }
                }}
                className="hidden"
                id="audio-upload"
              />
              <label
                htmlFor="audio-upload"
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 font-funnel-sans text-sm"
              >
                <Upload size={16} />
                <span>Upload Audio</span>
              </label>
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block font-funnel-sans font-bold text-sm">Definitions</label>
            <button
              onClick={addDefinition}
              className="text-blue-500 hover:text-blue-700"
            >
              <Plus size={16} />
            </button>
          </div>
          
          {formData.definitions.map((def, index) => (
            <div key={def.id} className="border border-gray-200 rounded p-3 mb-2">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    placeholder="Grammatical class (e.g., noun, verb)"
                    value={def.grammaticalClass}
                    onChange={(e) => updateDefinition(def.id, { grammaticalClass: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded font-funnel-sans text-xs"
                  />
                  <textarea
                    placeholder="Meaning/usage description"
                    value={def.meaning}
                    onChange={(e) => updateDefinition(def.id, { meaning: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded font-funnel-sans text-xs h-16"
                  />
                  <input
                    type="text"
                    placeholder="Usage example (optional)"
                    value={def.example || ''}
                    onChange={(e) => updateDefinition(def.id, { example: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded font-funnel-sans text-xs"
                  />
                </div>
                {formData.definitions.length > 1 && (
                  <button
                    onClick={() => removeDefinition(def.id)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <Minus size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block font-funnel-sans font-bold mb-1 text-sm">Origin</label>
          <input
            type="text"
            value={formData.origin}
            onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded font-funnel-sans text-sm"
            placeholder="Enter word origin (optional)"
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleSave}
          className="flex-1 p-3 bg-green-500 text-white rounded-lg font-funnel-sans font-bold hover:bg-green-600 transition-colors"
        >
          {isNew ? 'Add Entry' : 'Save Changes'}
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

export default EntryEditView;
