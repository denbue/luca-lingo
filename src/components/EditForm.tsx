import React, { useState, useEffect } from 'react';
import { DictionaryData, DictionaryEntry } from '../types/dictionary';
import EditModeSelector from './EditModeSelector';
import MetadataEditView from './MetadataEditView';
import EntryListView from './EntryListView';
import EntryEditView from './EntryEditView';
import TranslationListView from './TranslationListView';
import TranslationEditView from './TranslationEditView';
import MetadataTranslationEditView from './MetadataTranslationEditView';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EditFormProps {
  data: DictionaryData;
  onSave: (data: DictionaryData) => Promise<void>;
  onCancel: () => void;
}

const DICTIONARY_ID = '00000000-0000-0000-0000-000000000001';

const EditForm = ({ data, onSave, onCancel }: EditFormProps) => {
  const [formData, setFormData] = useState<DictionaryData>(data);
  const [viewMode, setViewMode] = useState<'mode-selector' | 'edit-dictionary' | 'manage-translations' | 'edit-metadata' | 'edit-entry' | 'edit-translation' | 'edit-metadata-translation'>('mode-selector');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [isNewEntry, setIsNewEntry] = useState(false);
  const [pendingTranslations, setPendingTranslations] = useState<Map<string, any>>(new Map());
  const { toast } = useToast();

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleMetadataChange = (newMetadata: { title: string; description: string }) => {
    setFormData({
      ...formData,
      title: newMetadata.title,
      description: newMetadata.description
    });
  };

  const handleEntryChange = (entryId: string, updates: Partial<DictionaryEntry>) => {
    setFormData({
      ...formData,
      entries: formData.entries.map(entry =>
        entry.id === entryId ? { ...entry, ...updates } : entry
      )
    });
  };

  const handleAddEntry = () => {
    setIsNewEntry(true);
    setViewMode('edit-entry');
  };

  const handleSaveEntry = (newEntry: DictionaryEntry) => {
    if (isNewEntry) {
      setFormData({
        ...formData,
        entries: [...formData.entries, newEntry]
      });
    } else {
      setFormData({
        ...formData,
        entries: formData.entries.map(entry =>
          entry.id === newEntry.id ? newEntry : entry
        )
      });
    }
    setViewMode('edit-dictionary');
    setIsNewEntry(false);
  };

  const handleDeleteEntry = (entryId: string) => {
    setFormData({
      ...formData,
      entries: formData.entries.filter(entry => entry.id !== entryId)
    });
  };

  const selectedEntry = selectedEntryId ? formData.entries.find(entry => entry.id === selectedEntryId) : null;

  const handleSaveTranslation = async (entryId: string, translations: any) => {
    console.log('Saving translation for entry:', entryId, translations);
    
    // Store in pending translations map
    setPendingTranslations(prev => new Map(prev.set(entryId, translations)));
    
    try {
      // Save entry translations
      if (translations.german) {
        await saveEntryTranslation(entryId, 'de', translations.german);
      }
      if (translations.portuguese) {
        await saveEntryTranslation(entryId, 'pt', translations.portuguese);
      }

      toast({
        title: "Translation saved",
        description: "Entry translation saved successfully",
      });

      setViewMode('manage-translations');
    } catch (error: any) {
      console.error('Error saving translation:', error);
      toast({
        title: "Error saving translation",
        description: error.message || "Failed to save translation",
        variant: "destructive"
      });
    }
  };

  const saveEntryTranslation = async (entryId: string, language: 'de' | 'pt', translationData: any) => {
    try {
      console.log(`Saving ${language} translation for entry ${entryId}:`, translationData);

      // Save entry origin translation
      if (translationData.origin) {
        const { error: entryError } = await supabase
          .from('entry_translations')
          .upsert({
            entry_id: entryId,
            language: language,
            origin: translationData.origin.trim() || null
          }, {
            onConflict: 'entry_id,language'
          });

        if (entryError) {
          console.error(`Error saving ${language} entry translation:`, entryError);
          throw entryError;
        }
      }

      // Save definition translations
      for (const def of translationData.definitions) {
        if (def.grammaticalClass || def.meaning || def.example) {
          const { error: defError } = await supabase
            .from('definition_translations')
            .upsert({
              definition_id: def.id,
              language: language,
              grammatical_class: def.grammaticalClass?.trim() || null,
              meaning: def.meaning?.trim() || null,
              example: def.example?.trim() || null
            }, {
              onConflict: 'definition_id,language'
            });

          if (defError) {
            console.error(`Error saving ${language} definition translation:`, defError);
            throw defError;
          }
        }
      }

      console.log(`Successfully saved ${language} translation for entry ${entryId}`);
    } catch (error) {
      console.error(`Error in saveEntryTranslation for ${language}:`, error);
      throw error;
    }
  };

  const handleSaveMetadataTranslation = async (language: 'de' | 'pt', title: string, description: string) => {
    try {
      console.log(`Saving ${language} metadata translation:`, { title, description });

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
        console.error(`Error saving ${language} metadata translation:`, error);
        throw error;
      }

      toast({
        title: "Translation saved",
        description: `${language === 'de' ? 'German' : 'Portuguese'} metadata translation saved successfully`,
      });

      setViewMode('manage-translations');
    } catch (error: any) {
      console.error('Error saving metadata translation:', error);
      toast({
        title: "Error saving translation",
        description: error.message || "Failed to save metadata translation",
        variant: "destructive"
      });
    }
  };

  const handleSaveAll = async () => {
    try {
      console.log('Saving all changes...');
      
      // Save the main dictionary data
      await onSave(formData);
      
      // All translations should already be saved individually
      // No need to save them again here since they're saved immediately
      console.log('All changes saved successfully');
      
    } catch (error: any) {
      console.error('Error saving changes:', error);
      toast({
        title: "Error saving changes",
        description: error.message || "Failed to save changes",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 overflow-y-auto max-h-[90vh]">
          
          {viewMode === 'mode-selector' && (
            <EditModeSelector
              data={formData}
              onSelectEditDictionary={() => setViewMode('edit-dictionary')}
              onSelectManageTranslations={() => setViewMode('manage-translations')}
              onCancel={onCancel}
            />
          )}

          {viewMode === 'edit-dictionary' && (
            <MetadataEditView
              data={formData}
              onSave={handleMetadataChange}
              onCancel={() => setViewMode('mode-selector')}
            />
          )}

          {viewMode === 'manage-translations' && (
            <TranslationListView
              data={formData}
              onEditEntry={(entryId) => {
                setSelectedEntryId(entryId);
                setViewMode('edit-translation');
              }}
              onEditMetadata={() => setViewMode('edit-metadata-translation')}
              onCancel={() => setViewMode('mode-selector')}
            />
          )}

          {viewMode === 'edit-translation' && selectedEntry && (
            <TranslationEditView
              entry={selectedEntry}
              onSave={handleSaveTranslation}
              onCancel={() => setViewMode('manage-translations')}
            />
          )}

          {viewMode === 'edit-metadata-translation' && (
            <MetadataTranslationEditView
              data={formData}
              onSave={handleSaveMetadataTranslation}
              onCancel={() => setViewMode('manage-translations')}
            />
          )}

          {/* Save/Cancel buttons for dictionary editing mode */}
          {viewMode === 'edit-dictionary' && (
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleSaveAll}
                className="flex-1 p-3 bg-green-500 text-white rounded-lg font-funnel-sans font-bold hover:bg-green-600 transition-colors"
              >
                Save All Changes
              </button>
              <button
                onClick={onCancel}
                className="flex-1 p-3 bg-gray-500 text-white rounded-lg font-funnel-sans font-bold hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditForm;
