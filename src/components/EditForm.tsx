
import React, { useState } from 'react';
import { DictionaryData, DictionaryEntry } from '../types/dictionary';
import EntryListView from './EntryListView';
import EntryEditView from './EntryEditView';
import MetadataEditView from './MetadataEditView';

interface EditFormProps {
  data: DictionaryData;
  onSave: (data: DictionaryData) => void;
  onCancel: () => void;
}

type ViewMode = 'list' | 'edit-entry' | 'edit-metadata';

// Helper function to generate proper UUIDs
const generateUUID = () => {
  return crypto.randomUUID();
};

const EditForm = ({ data, onSave, onCancel }: EditFormProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentEntry, setCurrentEntry] = useState<DictionaryEntry | null>(null);
  const [isNewEntry, setIsNewEntry] = useState(false);
  const [formData, setFormData] = useState<DictionaryData>(data);

  const handleEditEntry = (entry: DictionaryEntry) => {
    setCurrentEntry(entry);
    setIsNewEntry(false);
    setViewMode('edit-entry');
  };

  const handleAddEntry = () => {
    const newEntry: DictionaryEntry = {
      id: generateUUID(),
      word: '',
      ipa: '',
      definitions: [{ id: generateUUID(), grammaticalClass: '', meaning: '' }],
      origin: '',
      colorCombo: 1 // Will be assigned properly when saved
    };
    setCurrentEntry(newEntry);
    setIsNewEntry(true);
    setViewMode('edit-entry');
  };

  const handleDeleteEntry = (entryId: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      const updatedEntries = formData.entries.filter(entry => entry.id !== entryId);
      setFormData({ ...formData, entries: updatedEntries });
    }
  };

  const handleSaveEntry = (entry: DictionaryEntry) => {
    let updatedEntries;
    
    if (isNewEntry) {
      updatedEntries = [...formData.entries, entry];
    } else {
      updatedEntries = formData.entries.map(e => e.id === entry.id ? entry : e);
    }
    
    setFormData({ ...formData, entries: updatedEntries });
    setViewMode('list');
    setCurrentEntry(null);
    setIsNewEntry(false);
  };

  const handleEditMetadata = () => {
    setViewMode('edit-metadata');
  };

  const handleSaveMetadata = (title: string, description: string) => {
    setFormData({ ...formData, title, description });
    setViewMode('list');
  };

  const handleFinalSave = () => {
    onSave(formData);
  };

  const handleCancel = () => {
    if (viewMode === 'list') {
      onCancel();
    } else {
      setViewMode('list');
      setCurrentEntry(null);
      setIsNewEntry(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-global-bg z-50 overflow-y-auto">
      <div className="p-5">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-funnel-display text-2xl font-bold">Edit Dictionary</h2>
            {viewMode === 'list' && (
              <button
                onClick={handleFinalSave}
                className="px-4 py-2 bg-green-500 text-white rounded-lg font-funnel-sans font-bold hover:bg-green-600 transition-colors"
              >
                Save All Changes
              </button>
            )}
          </div>

          {viewMode === 'list' && (
            <EntryListView
              data={formData}
              onEditEntry={handleEditEntry}
              onAddEntry={handleAddEntry}
              onDeleteEntry={handleDeleteEntry}
              onEditMetadata={handleEditMetadata}
            />
          )}

          {viewMode === 'edit-entry' && (
            <EntryEditView
              entry={currentEntry}
              onSave={handleSaveEntry}
              onCancel={handleCancel}
              isNew={isNewEntry}
            />
          )}

          {viewMode === 'edit-metadata' && (
            <MetadataEditView
              data={formData}
              onSave={handleSaveMetadata}
              onCancel={handleCancel}
            />
          )}

          {viewMode === 'list' && (
            <div className="flex justify-center mt-8">
              <button
                onClick={onCancel}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg font-funnel-sans font-bold hover:bg-gray-600 transition-colors"
              >
                Close Editor
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditForm;
