import React, { useState } from 'react';
import { DictionaryData, DictionaryEntry, Definition } from '../types/dictionary';
import { Plus, Minus, Trash2, Upload } from 'lucide-react';

interface EditFormProps {
  data: DictionaryData;
  onSave: (data: DictionaryData) => void;
  onCancel: () => void;
}

const EditForm = ({ data, onSave, onCancel }: EditFormProps) => {
  const [formData, setFormData] = useState<DictionaryData>(data);

  const addEntry = () => {
    const newEntry: DictionaryEntry = {
      id: Date.now().toString(),
      word: '',
      ipa: '',
      definitions: [{ id: Date.now().toString(), grammaticalClass: '', meaning: '' }],
      origin: '',
      colorCombo: ((formData.entries.length % 4) + 1) as 1 | 2 | 3 | 4
    };
    setFormData({
      ...formData,
      entries: [...formData.entries, newEntry]
    });
  };

  const removeEntry = (entryId: string) => {
    setFormData({
      ...formData,
      entries: formData.entries.filter(entry => entry.id !== entryId)
    });
  };

  const updateEntry = (entryId: string, updates: Partial<DictionaryEntry>) => {
    setFormData({
      ...formData,
      entries: formData.entries.map(entry =>
        entry.id === entryId ? { ...entry, ...updates } : entry
      )
    });
  };

  const handleAudioUpload = (entryId: string, file: File) => {
    // Create a URL for the uploaded file
    const audioUrl = URL.createObjectURL(file);
    updateEntry(entryId, { audioUrl });
  };

  const addDefinition = (entryId: string) => {
    const newDefinition: Definition = {
      id: Date.now().toString(),
      grammaticalClass: '',
      meaning: ''
    };
    
    setFormData({
      ...formData,
      entries: formData.entries.map(entry =>
        entry.id === entryId 
          ? { ...entry, definitions: [...entry.definitions, newDefinition] }
          : entry
      )
    });
  };

  const updateDefinition = (entryId: string, defId: string, updates: Partial<Definition>) => {
    setFormData({
      ...formData,
      entries: formData.entries.map(entry =>
        entry.id === entryId
          ? {
              ...entry,
              definitions: entry.definitions.map(def =>
                def.id === defId ? { ...def, ...updates } : def
              )
            }
          : entry
      )
    });
  };

  const removeDefinition = (entryId: string, defId: string) => {
    setFormData({
      ...formData,
      entries: formData.entries.map(entry =>
        entry.id === entryId
          ? {
              ...entry,
              definitions: entry.definitions.filter(def => def.id !== defId)
            }
          : entry
      )
    });
  };

  return (
    <div className="fixed inset-0 bg-global-bg z-50 overflow-y-auto">
      <div className="p-5">
        <div className="mb-8">
          <h2 className="font-funnel-display text-2xl font-bold mb-4">Edit Dictionary</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block font-funnel-sans font-bold mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg font-funnel-sans"
              />
            </div>
            
            <div>
              <label className="block font-funnel-sans font-bold mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg font-funnel-sans h-20"
              />
            </div>
          </div>

          <div className="space-y-6">
            {formData.entries.map((entry, index) => (
              <div key={entry.id} className="border border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-funnel-display text-lg font-bold">Entry {index + 1}</h3>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block font-funnel-sans font-bold mb-1 text-sm">Word</label>
                    <input
                      type="text"
                      value={entry.word}
                      onChange={(e) => updateEntry(entry.id, { word: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded font-funnel-sans text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-funnel-sans font-bold mb-1 text-sm">IPA Pronunciation</label>
                    <input
                      type="text"
                      value={entry.ipa}
                      onChange={(e) => updateEntry(entry.id, { ipa: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded font-funnel-sans text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-funnel-sans font-bold mb-1 text-sm">Audio File</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleAudioUpload(entry.id, file);
                          }
                        }}
                        className="hidden"
                        id={`audio-${entry.id}`}
                      />
                      <label
                        htmlFor={`audio-${entry.id}`}
                        className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 font-funnel-sans text-sm"
                      >
                        <Upload size={16} />
                        <span>Upload Audio</span>
                      </label>
                      {entry.audioUrl && (
                        <span className="text-green-600 font-funnel-sans text-sm">✓ Audio uploaded</span>
                      )}
                    </div>
                    {entry.audioUrl && (
                      <audio controls className="mt-2 w-full">
                        <source src={entry.audioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block font-funnel-sans font-bold text-sm">Definitions</label>
                      <button
                        onClick={() => addDefinition(entry.id)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    {entry.definitions.map((def) => (
                      <div key={def.id} className="border border-gray-200 rounded p-3 mb-2">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              placeholder="Grammatical class (e.g., noun, verb)"
                              value={def.grammaticalClass}
                              onChange={(e) => updateDefinition(entry.id, def.id, { grammaticalClass: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded font-funnel-sans text-xs"
                            />
                            <textarea
                              placeholder="Meaning/usage description"
                              value={def.meaning}
                              onChange={(e) => updateDefinition(entry.id, def.id, { meaning: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded font-funnel-sans text-xs h-16"
                            />
                            <input
                              type="text"
                              placeholder="Usage example (optional)"
                              value={def.example || ''}
                              onChange={(e) => updateDefinition(entry.id, def.id, { example: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded font-funnel-sans text-xs"
                            />
                          </div>
                          {entry.definitions.length > 1 && (
                            <button
                              onClick={() => removeDefinition(entry.id, def.id)}
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
                      value={entry.origin}
                      onChange={(e) => updateEntry(entry.id, { origin: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded font-funnel-sans text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addEntry}
            className="w-full mt-6 p-3 bg-blue-500 text-white rounded-lg font-funnel-sans font-bold hover:bg-blue-600 transition-colors"
          >
            Add New Entry
          </button>

          <div className="flex space-x-4 mt-8">
            <button
              onClick={() => onSave(formData)}
              className="flex-1 p-3 bg-green-500 text-white rounded-lg font-funnel-sans font-bold hover:bg-green-600 transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={onCancel}
              className="flex-1 p-3 bg-gray-500 text-white rounded-lg font-funnel-sans font-bold hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditForm;
