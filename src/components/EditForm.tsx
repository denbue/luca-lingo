import React, { useState } from 'react';
import { DictionaryData, DictionaryEntry } from '../types/dictionary';
import EntryListView from './EntryListView';
import EntryEditView from './EntryEditView';
import MetadataEditView from './MetadataEditView';
import EditModeSelector from './EditModeSelector';
import TranslationListView from './TranslationListView';
import TranslationEditView from './TranslationEditView';
import { useTranslations } from '../hooks/useTranslations';

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

// AI Translation function
const translateText = async (text: string, targetLanguage: 'de' | 'pt'): Promise<string> => {
  try {
    const languageNames = { de: 'German', pt: 'Portuguese' };
    
    // Simple translation logic - in a real app, you'd use a proper translation API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY || 'dummy-key'}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the given text to ${languageNames[targetLanguage]}. Return only the translation, no explanations.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error('Translation API failed');
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Translation failed:', error);
    // Fallback: return original text with a note
    return `${text} [Translation needed]`;
  }
};

const EditForm = ({ data, onSave, onCancel }: EditFormProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('mode-selector');
  const [currentEntry, setCurrentEntry] = useState<DictionaryEntry | null>(null);
  const [isNewEntry, setIsNewEntry] = useState(false);
  const [formData, setFormData] = useState<DictionaryData>(data);
  const [translationLanguage, setTranslationLanguage] = useState<'de' | 'pt'>('de');

  const { translateText, saveDictionaryTranslation, saveEntryTranslations, saveDefinitionTranslations } = useTranslations();

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

  const handleSaveTranslation = (entryId: string, translations: any) => {
    const entry = formData.entries.find(e => e.id === entryId);
    if (!entry) return;

    // Convert translations to the format expected by the hook
    const entryTranslations: any = {};
    const definitionTranslations: any = {};

    if (translations.german) {
      entryTranslations.german = { origin: translations.german.origin };
      
      translations.german.definitions.forEach((def: any, index: number) => {
        const originalDef = entry.definitions[index];
        if (originalDef) {
          definitionTranslations[originalDef.id] = {
            ...(definitionTranslations[originalDef.id] || {}),
            german: {
              grammaticalClass: def.grammaticalClass,
              meaning: def.meaning,
              example: def.example
            }
          };
        }
      });
    }

    if (translations.portuguese) {
      entryTranslations.portuguese = { origin: translations.portuguese.origin };
      
      translations.portuguese.definitions.forEach((def: any, index: number) => {
        const originalDef = entry.definitions[index];
        if (originalDef) {
          definitionTranslations[originalDef.id] = {
            ...(definitionTranslations[originalDef.id] || {}),
            portuguese: {
              grammaticalClass: def.grammaticalClass,
              meaning: def.meaning,
              example: def.example
            }
          };
        }
      });
    }

    // Save translations
    saveEntryTranslations(entryId, entryTranslations);
    
    // Save definition translations
    Object.entries(definitionTranslations).forEach(([defId, translations]) => {
      saveDefinitionTranslations(defId, translations as any);
    });

    setViewMode('manage-translations');
    setCurrentEntry(null);
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
      console.log('Generating AI translations for new entry:', entry.word);
      
      try {
        // Generate translations for entry origin
        const germanOrigin = entry.origin ? await translateText(entry.origin, 'de') : '';
        const portugueseOrigin = entry.origin ? await translateText(entry.origin, 'pt') : '';

        // Generate translations for definitions
        const germanDefinitions = await Promise.all(entry.definitions.map(async (def) => ({
          id: def.id,
          grammaticalClass: def.grammaticalClass ? await translateText(def.grammaticalClass, 'de') : '',
          meaning: def.meaning ? await translateText(def.meaning, 'de') : '',
          example: def.example ? await translateText(def.example, 'de') : ''
        })));

        const portugueseDefinitions = await Promise.all(entry.definitions.map(async (def) => ({
          id: def.id,
          grammaticalClass: def.grammaticalClass ? await translateText(def.grammaticalClass, 'pt') : '',
          meaning: def.meaning ? await translateText(def.meaning, 'pt') : '',
          example: def.example ? await translateText(def.example, 'pt') : ''
        })));

        // Save entry translations
        await saveEntryTranslations(entry.id, {
          german: { origin: germanOrigin },
          portuguese: { origin: portugueseOrigin }
        });

        // Save definition translations
        for (let i = 0; i < entry.definitions.length; i++) {
          const def = entry.definitions[i];
          await saveDefinitionTranslations(def.id, {
            german: germanDefinitions[i],
            portuguese: portugueseDefinitions[i]
          });
        }

        console.log('AI translations saved successfully');
      } catch (error) {
        console.error('Failed to generate translations:', error);
      }
      
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
                saveDictionaryTranslation(translationLanguage, title, description);
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
