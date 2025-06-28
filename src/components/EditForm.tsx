
import React, { useState } from 'react';
import { DictionaryData, DictionaryEntry } from '../types/dictionary';
import EntryListView from './EntryListView';
import EntryEditView from './EntryEditView';
import MetadataEditView from './MetadataEditView';
import EditModeSelector from './EditModeSelector';
import TranslationListView from './TranslationListView';
import TranslationEditView from './TranslationEditView';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

const DICTIONARY_ID = '00000000-0000-0000-0000-000000000001';

const EditForm = ({ data, onSave, onCancel }: EditFormProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('mode-selector');
  const [currentEntry, setCurrentEntry] = useState<DictionaryEntry | null>(null);
  const [isNewEntry, setIsNewEntry] = useState(false);
  const [formData, setFormData] = useState<DictionaryData>(data);
  const [translationLanguage, setTranslationLanguage] = useState<'de' | 'pt'>('de');
  const { toast } = useToast();

  const handleEditEntry = (entry: DictionaryEntry) => {
    setCurrentEntry(entry);
    setIsNewEntry(false);
    setViewMode('edit-entry');
  };

  const handleDeleteEntry = (entryId: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      const updatedEntries = formData.entries.filter(entry => entry.id !== entryId);
      setFormData({ ...formData, entries: updatedEntries });
    }
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

  const handleSaveTranslation = async (entryId: string, translations: any) => {
    try {
      console.log('Saving translations for entry:', entryId, translations);

      // Save German translations
      if (translations.german) {
        // Save entry translation (origin) only if it has content
        if (translations.german.origin && translations.german.origin.trim()) {
          const { error: entryError } = await supabase
            .from('entry_translations')
            .upsert({
              entry_id: entryId,
              language: 'de',
              origin: translations.german.origin
            }, {
              onConflict: 'entry_id,language'
            });

          if (entryError) {
            console.error('Error saving German entry translation:', entryError);
            throw entryError;
          }
        }

        // Save definition translations
        for (const defTranslation of translations.german.definitions) {
          // Only save if at least one field has content
          if (defTranslation.grammaticalClass?.trim() || defTranslation.meaning?.trim() || defTranslation.example?.trim()) {
            const { error: defError } = await supabase
              .from('definition_translations')
              .upsert({
                definition_id: defTranslation.id,
                language: 'de',
                grammatical_class: defTranslation.grammaticalClass || null,
                meaning: defTranslation.meaning || null,
                example: defTranslation.example || null
              }, {
                onConflict: 'definition_id,language'
              });

            if (defError) {
              console.error('Error saving German definition translation:', defError);
              throw defError;
            }
          }
        }
      }

      // Save Portuguese translations
      if (translations.portuguese) {
        // Save entry translation (origin) only if it has content
        if (translations.portuguese.origin && translations.portuguese.origin.trim()) {
          const { error: entryError } = await supabase
            .from('entry_translations')
            .upsert({
              entry_id: entryId,
              language: 'pt',
              origin: translations.portuguese.origin
            }, {
              onConflict: 'entry_id,language'
            });

          if (entryError) {
            console.error('Error saving Portuguese entry translation:', entryError);
            throw entryError;
          }
        }

        // Save definition translations
        for (const defTranslation of translations.portuguese.definitions) {
          // Only save if at least one field has content
          if (defTranslation.grammaticalClass?.trim() || defTranslation.meaning?.trim() || defTranslation.example?.trim()) {
            const { error: defError } = await supabase
              .from('definition_translations')
              .upsert({
                definition_id: defTranslation.id,
                language: 'pt',
                grammatical_class: defTranslation.grammaticalClass || null,
                meaning: defTranslation.meaning || null,
                example: defTranslation.example || null
              }, {
                onConflict: 'definition_id,language'
              });

            if (defError) {
              console.error('Error saving Portuguese definition translation:', defError);
              throw defError;
            }
          }
        }
      }

      toast({
        title: "Translations saved",
        description: "Entry translations have been saved successfully",
      });

      setViewMode('manage-translations');
      setCurrentEntry(null);
    } catch (error: any) {
      console.error('Error saving translations:', error);
      toast({
        title: "Error saving translations",
        description: error.message || "Failed to save translations",
        variant: "destructive"
      });
    }
  };

  const handleFinalSave = () => {
    onSave(formData);
  };

  const handleAddEntry = async () => {
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

  const handleSaveEntry = async (entry: DictionaryEntry) => {
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
                onBack={() => setViewMode('mode-selector')}
              />
              <div className="flex justify-center mt-8 space-x-4">
                <button
                  onClick={handleFinalSave}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg font-funnel-sans font-bold hover:bg-green-600 transition-colors"
                >
                  Save All Changes
                </button>
                <button
                  onClick={() => setViewMode('mode-selector')}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg font-funnel-sans font-bold hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {viewMode === 'manage-translations' && (
            <>
              <TranslationListView
                data={formData}
                onEditEntry={handleTranslateEntry}
                onEditMetadata={handleTranslateMetadata}
                onBackToEditSelector={() => setViewMode('mode-selector')}
              />
              <div className="flex justify-center mt-8 space-x-4">
                <button
                  onClick={handleFinalSave}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg font-funnel-sans font-bold hover:bg-green-600 transition-colors"
                >
                  Save All Changes
                </button>
                <button
                  onClick={() => setViewMode('mode-selector')}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg font-funnel-sans font-bold hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
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
