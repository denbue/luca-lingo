
import React, { useState } from 'react';
import { DictionaryData, DictionaryEntry, Definition } from '../types/dictionary';
import { X, Plus, Trash2, Save } from 'lucide-react';

interface EditFormProps {
  data: DictionaryData;
  onSave: (data: DictionaryData) => void;
  onCancel: () => void;
}

const EditForm = ({ data, onSave, onCancel }: EditFormProps) => {
  const [formData, setFormData] = useState<DictionaryData>({
    title: data.title,
    description: data.description,
    entries: data.entries.map(entry => ({
      ...entry,
      definitions: [...entry.definitions]
    }))
  });

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({ ...prev, title: value }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
  };

  const handleAddEntry = () => {
    const newEntry: DictionaryEntry = {
      id: generateId(),
      word: '',
      ipa: '',
      definitions: [{
        id: generateId(),
        grammaticalClass: '',
        meaning: '',
        example: ''
      }],
      origin: '',
      colorCombo: 1
    };
    
    setFormData(prev => ({
      ...prev,
      entries: [...prev.entries, newEntry]
    }));
  };

  const handleDeleteEntry = (entryId: string) => {
    setFormData(prev => ({
      ...prev,
      entries: prev.entries.filter(entry => entry.id !== entryId)
    }));
  };

  const handleEntryChange = (entryId: string, field: keyof DictionaryEntry, value: any) => {
    setFormData(prev => ({
      ...prev,
      entries: prev.entries.map(entry =>
        entry.id === entryId ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const handleAddDefinition = (entryId: string) => {
    const newDefinition: Definition = {
      id: generateId(),
      grammaticalClass: '',
      meaning: '',
      example: ''
    };

    setFormData(prev => ({
      ...prev,
      entries: prev.entries.map(entry =>
        entry.id === entryId
          ? { ...entry, definitions: [...entry.definitions, newDefinition] }
          : entry
      )
    }));
  };

  const handleDeleteDefinition = (entryId: string, definitionId: string) => {
    setFormData(prev => ({
      ...prev,
      entries: prev.entries.map(entry =>
        entry.id === entryId
          ? { ...entry, definitions: entry.definitions.filter(def => def.id !== definitionId) }
          : entry
      )
    }));
  };

  const handleDefinitionChange = (entryId: string, definitionId: string, field: keyof Definition, value: string) => {
    setFormData(prev => ({
      ...prev,
      entries: prev.entries.map(entry =>
        entry.id === entryId
          ? {
              ...entry,
              definitions: entry.definitions.map(def =>
                def.id === definitionId ? { ...def, [field]: value } : def
              )
            }
          : entry
      )
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto mx-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-funnel-display text-2xl font-bold">Edit Dictionary</h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          {/* Dictionary metadata */}
          <div className="space-y-4">
            <div>
              <label className="block font-funnel-sans font-bold text-sm mb-2">
                Dictionary Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg font-funnel-sans"
                placeholder="Enter dictionary title"
              />
            </div>

            <div>
              <label className="block font-funnel-sans font-bold text-sm mb-2">
                Dictionary Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg font-funnel-sans h-24 resize-none"
                placeholder="Enter dictionary description"
              />
            </div>
          </div>

          {/* Entries section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-funnel-display text-lg font-bold">Dictionary Entries</h3>
              <button
                onClick={handleAddEntry}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Plus size={16} />
                <span className="font-funnel-sans text-sm">Add Entry</span>
              </button>
            </div>

            <div className="space-y-6">
              {formData.entries.map((entry, entryIndex) => (
                <div key={entry.id} className="border border-gray-300 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-funnel-display font-bold">Entry {entryIndex + 1}</h4>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block font-funnel-sans font-bold text-sm mb-2">
                        Word *
                      </label>
                      <input
                        type="text"
                        value={entry.word}
                        onChange={(e) => handleEntryChange(entry.id, 'word', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg font-funnel-sans"
                        placeholder="Enter word"
                      />
                    </div>

                    <div>
                      <label className="block font-funnel-sans font-bold text-sm mb-2">
                        IPA Pronunciation
                      </label>
                      <input
                        type="text"
                        value={entry.ipa}
                        onChange={(e) => handleEntryChange(entry.id, 'ipa', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg font-funnel-sans"
                        placeholder="Enter IPA pronunciation"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block font-funnel-sans font-bold text-sm mb-2">
                      Origin
                    </label>
                    <input
                      type="text"
                      value={entry.origin}
                      onChange={(e) => handleEntryChange(entry.id, 'origin', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg font-funnel-sans"
                      placeholder="Enter word origin"
                    />
                  </div>

                  {/* Definitions */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h5 className="font-funnel-display font-bold">Definitions</h5>
                      <button
                        onClick={() => handleAddDefinition(entry.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        <Plus size={14} />
                        <span className="font-funnel-sans text-xs">Add Definition</span>
                      </button>
                    </div>

                    {entry.definitions.map((definition, defIndex) => (
                      <div key={definition.id} className="border border-gray-200 rounded p-3">
                        <div className="flex justify-between items-start mb-3">
                          <span className="font-funnel-sans text-sm font-bold">Definition {defIndex + 1}</span>
                          <button
                            onClick={() => handleDeleteDefinition(entry.id, definition.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block font-funnel-sans font-bold text-xs mb-1">
                              Grammatical Class *
                            </label>
                            <input
                              type="text"
                              value={definition.grammaticalClass}
                              onChange={(e) => handleDefinitionChange(entry.id, definition.id, 'grammaticalClass', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded font-funnel-sans text-sm"
                              placeholder="e.g., noun, verb, adjective"
                            />
                          </div>

                          <div>
                            <label className="block font-funnel-sans font-bold text-xs mb-1">
                              Meaning *
                            </label>
                            <input
                              type="text"
                              value={definition.meaning}
                              onChange={(e) => handleDefinitionChange(entry.id, definition.id, 'meaning', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded font-funnel-sans text-sm"
                              placeholder="Enter definition"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-funnel-sans font-bold text-xs mb-1">
                            Example (optional)
                          </label>
                          <input
                            type="text"
                            value={definition.example || ''}
                            onChange={(e) => handleDefinitionChange(entry.id, definition.id, 'example', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded font-funnel-sans text-sm"
                            placeholder="Enter example sentence"
                          />
                        </div>
                      </div>
                    ))}

                    {entry.definitions.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <p className="font-funnel-sans text-sm">No definitions yet. Add one to get started.</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {formData.entries.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="font-funnel-sans text-sm">No entries yet. Add one to get started.</p>
                </div>
              )}
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg font-funnel-sans hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Save size={16} />
              <span className="font-funnel-sans">Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditForm;
