
import React, { useState } from 'react';
import { DictionaryData, DictionaryEntry } from '../types/dictionary';
import EntryListView from './EntryListView';
import EntryEditView from './EntryEditView';
import MetadataEditView from './MetadataEditView';
import MetadataTranslationEditView from './MetadataTranslationEditView';
import EditModeSelector from './EditModeSelector';
import TranslationListView from './TranslationListView';
import TranslationEditView from './TranslationEditView';
import TranslationImportView from './TranslationImportView';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { exportDictionaryAsText } from '../utils/dictionaryExport';

interface EditFormProps {
  data: DictionaryData;
  onSave: (data: DictionaryData) => void;
  onCancel: () => void;
}

type ViewMode = 'mode-selector' | 'edit-dictionary' | 'manage-translations' | 'edit-entry' | 'edit-metadata' | 'translate-entry' | 'translate-metadata' | 'import-german' | 'import-portuguese';

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

      // Helper function to save entry translation
      const saveEntryTranslation = async (language: 'de' | 'pt', origin: string) => {
        if (!origin?.trim()) return;
        
        const { error } = await supabase
          .from('entry_translations')
          .upsert({
            entry_id: entryId,
            language: language,
            origin: origin.trim()
          }, {
            onConflict: 'entry_id,language'
          });

        if (error) {
          console.error(`Error saving ${language} entry translation:`, error);
          throw error;
        }
        console.log(`Successfully saved ${language} entry translation`);
      };

      // Helper function to save definition translations
      const saveDefinitionTranslations = async (language: 'de' | 'pt', definitions: any[]) => {
        for (const defTranslation of definitions) {
          // Only save if at least one field has content
          const hasContent = defTranslation.grammaticalClass?.trim() || 
                           defTranslation.meaning?.trim() || 
                           defTranslation.example?.trim();
          
          if (!hasContent) continue;

          const { error } = await supabase
            .from('definition_translations')
            .upsert({
              definition_id: defTranslation.id,
              language: language,
              grammatical_class: defTranslation.grammaticalClass?.trim() || null,
              meaning: defTranslation.meaning?.trim() || null,
              example: defTranslation.example?.trim() || null
            }, {
              onConflict: 'definition_id,language'
            });

          if (error) {
            console.error(`Error saving ${language} definition translation:`, error);
            throw error;
          }
          console.log(`Successfully saved ${language} definition translation for:`, defTranslation.id);
        }
      };

      // Save German translations
      if (translations.german) {
        await saveEntryTranslation('de', translations.german.origin);
        await saveDefinitionTranslations('de', translations.german.definitions);
      }

      // Save Portuguese translations
      if (translations.portuguese) {
        await saveEntryTranslation('pt', translations.portuguese.origin);
        await saveDefinitionTranslations('pt', translations.portuguese.definitions);
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

  const handleSaveMetadataTranslation = async (language: 'de' | 'pt', title: string, description: string) => {
    try {
      console.log(`Saving ${language} dictionary translation:`, { title, description });

      const { error } = await supabase
        .from('dictionary_translations')
        .upsert({
          dictionary_id: DICTIONARY_ID,
          language: language,
          title: title.trim() || null,
          description: description.trim() || null
        }, {
          onConflict: 'dictionary_id,language'
        });

      if (error) {
        console.error(`Error saving ${language} dictionary translation:`, error);
        throw error;
      }

      console.log(`Successfully saved ${language} dictionary translation`);
      
      toast({
        title: "Translation saved",
        description: `${language === 'de' ? 'German' : 'Portuguese'} dictionary translation saved successfully`,
      });

      setViewMode('manage-translations');
    } catch (error: any) {
      console.error('Error saving dictionary translation:', error);
      toast({
        title: "Error saving translation",
        description: error.message || "Failed to save dictionary translation",
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
    } else if (viewMode === 'edit-dictionary' || viewMode === 'manage-translations' || viewMode === 'import-german' || viewMode === 'import-portuguese') {
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

  const handleExport = () => {
    exportDictionaryAsText(data);
  };

  return (
    <div className="fixed inset-0 bg-global-bg z-50 overflow-y-auto">
      <div className="p-5">
        <div className="mb-8">
          {viewMode === 'mode-selector' && (
            <EditModeSelector
              data={formData}
              onSelectEditDictionary={() => setViewMode('edit-dictionary')}
              onSelectManageTranslations={() => setViewMode('manage-translations')}
              onSelectImportGerman={() => setViewMode('import-german')}
              onSelectImportPortuguese={() => setViewMode('import-portuguese')}
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
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setViewMode('mode-selector')}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg font-funnel-sans font-bold hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </>
          )}

          {viewMode === 'import-german' && (
            <TranslationImportView
              data={data}
              language="de"
              onBack={() => setViewMode('mode-selector')}
            />
          )}

          {viewMode === 'import-portuguese' && (
            <TranslationImportView
              data={data}
              language="pt"
              onBack={() => setViewMode('mode-selector')}
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
            <MetadataTranslationEditView
              data={formData}
              language={translationLanguage}
              onSave={() => setViewMode('manage-translations')}
              onCancel={handleCancel}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EditForm;
