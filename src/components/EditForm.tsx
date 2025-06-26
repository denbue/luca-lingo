
import React, { useState } from 'react';
import { DictionaryData, DictionaryEntry } from '../types/dictionary';
import EntryListView from './EntryListView';
import EntryEditView from './EntryEditView';
import MetadataEditView from './MetadataEditView';
import EditModeSelector from './EditModeSelector';
import TranslationListView from './TranslationListView';
import TranslationEditView from './TranslationEditView';

interface EditFormProps {
  data: DictionaryData;
  onSave: (data: DictionaryData) => void;
  onCancel: () => void;
}

type ViewMode = 'mode-selector' | 'edit-dictionary' | 'manage-translations' | 'edit-entry' | 'edit-metadata' | 'translate-entry' | 'translate-metadata';

// Helper function to generate proper UUIDs
const generateUUID = () => {
  return crypto.randomUUID();
};

const EditForm = ({ data, onSave, onCancel }: EditFormProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('mode-selector');
  const [currentEntry, setCurrentEntry] = useState<DictionaryEntry | null>(null);
  const [isNewEntry, setIsNewEntry] = useState(false);
  const [formData, setFormData] = useState<DictionaryData>(data);
  const [translationLanguage, setTranslationLanguage] = useState<'de' | 'pt'>('de');

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
      colorCombo: 1
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
    setViewMode('edit-dictionary');
    setCurrentEntry(null);
    setIsNewEntry(false);
  };

  const handleEditMetadata = () => {
    setViewMode('edit-metadata');
  };

  const handleSaveMetadata = (title: string, description: string) => {
    setFormData({ ...formData, title, description });
    setViewMode('edit-dictionary');
  };

  const handleTranslateEntry = (entryId: string) => {
    const entry = formData.entries.find(e => e.id === entryId);
    if (entry) {
      setCurrentEntry(entry);
      setViewMode('translate-entry');
    }
  };

  const handleTranslateMetadata = (language: 'de' | 'pt') => {
    setTranslationLanguage(language);
    setViewMode('translate-metadata');
  };

  const handleSaveTranslation = (entryId: string, translations: any) => {
    // For now, just log the translations - in a real app, you'd save them to the database
    console.log('Saving translations for entry:', entryId, translations);
    setViewMode('manage-translations');
    setCurrentEntry(null);
  };

  const handleFinalSave = () => {
    onSave(formData);
  };

  const handleCancel = () => {
    if (viewMode === 'mode-selector') {
      onCancel();
    } else if (viewMode === 'edit-dictionary' || viewMode === 'manage-translations') {
      setViewMode('mode-selector');
    } else {
      // Go back to appropriate parent view
      if (viewMode === 'edit-entry' || viewMode === 'edit-metadata') {
        setViewMode('edit-dictionary');
      } else {
        setViewMode('manage-translations');
      }
      setCurrentEntry(null);
      setIsNewEntry(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-global-bg z-50 overflow-y-auto">
      <div className="p-5">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-funnel-display text-2xl font-bold">
              {viewMode === 'mode-selector' ? 'Edit Dictionary' :
               viewMode === 'edit-dictionary' ? 'Edit Dictionary' :
               viewMode === 'manage-translations' ? 'Manage Translations' :
               'Edit Dictionary'}
            </h2>
            {(viewMode === 'edit-dictionary' || viewMode === 'manage-translations') && (
              <button
                onClick={handleFinalSave}
                className="px-4 py-2 bg-green-500 text-white rounded-lg font-funnel-sans font-bold hover:bg-green-600 transition-colors"
              >
                Save All Changes
              </button>
            )}
          </div>

          {viewMode === 'mode-selector' && (
            <EditModeSelector
              onSelectEditDictionary={() => setViewMode('edit-dictionary')}
              onSelectManageTranslations={() => setViewMode('manage-translations')}
              onCancel={onCancel}
            />
          )}

          {viewMode === 'edit-dictionary' && (
            <>
              <EntryListView
                data={formData}
                onEditEntry={handleEditEntry}
                onAddEntry={handleAddEntry}
                onDeleteEntry={handleDeleteEntry}
                onEditMetadata={handleEditMetadata}
              />
              <div className="flex justify-center mt-8 space-x-4">
                <button
                  onClick={() => setViewMode('manage-translations')}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg font-funnel-sans font-bold hover:bg-blue-600 transition-colors"
                >
                  Manage Translations
                </button>
                <button
                  onClick={() => setViewMode('mode-selector')}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg font-funnel-sans font-bold hover:bg-gray-600 transition-colors"
                >
                  Back to Mode Selection
                </button>
              </div>
            </>
          )}

          {viewMode === 'manage-translations' && (
            <TranslationListView
              data={formData}
              onEditEntry={handleTranslateEntry}
              onEditMetadata={handleTranslateMetadata}
              onBackToEditSelector={() => setViewMode('mode-selector')}
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

          {viewMode === 'translate-entry' && (
            <TranslationEditView
              entry={currentEntry}
              onSave={handleSaveTranslation}
              onCancel={handleCancel}
            />
          )}

          {viewMode === 'translate-metadata' && (
            <MetadataEditView
              data={formData}
              onSave={(title, description) => {
                console.log(`Saving ${translationLanguage} translation:`, { title, description });
                setViewMode('manage-translations');
              }}
              onCancel={handleCancel}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EditForm;
