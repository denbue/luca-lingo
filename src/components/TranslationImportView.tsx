
import React, { useState } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { DictionaryData } from '../types/dictionary';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '../contexts/LanguageContext';

interface TranslationImportViewProps {
  data: DictionaryData;
  language: 'de' | 'pt';
  onBack: () => void;
  onRefreshData?: () => void;
}

const DICTIONARY_ID = '00000000-0000-0000-0000-000000000001';

const TranslationImportView = ({ data, language, onBack, onRefreshData }: TranslationImportViewProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { setCurrentLanguage } = useLanguage();

  const parseTranslationFile = (text: string) => {
    const lines = text.split('\n');
    const translations: any = {
      dictionary: {},
      entries: []
    };

    let currentEntry: any = null;
    let currentEntryIndex = -1;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('---')) continue;

      // Parse dictionary translations
      if (trimmedLine.startsWith('DICTIONARY_TITLE_TRANSLATION:')) {
        const translation = trimmedLine.replace('DICTIONARY_TITLE_TRANSLATION:', '').trim();
        if (translation && translation !== '[ADD YOUR TRANSLATION HERE]') {
          translations.dictionary.title = translation;
        }
      } else if (trimmedLine.startsWith('DICTIONARY_DESCRIPTION_TRANSLATION:')) {
        const translation = trimmedLine.replace('DICTIONARY_DESCRIPTION_TRANSLATION:', '').trim();
        if (translation && translation !== '[ADD YOUR TRANSLATION HERE]') {
          translations.dictionary.description = translation;
        }
      }
      // Parse entry translations
      else if (trimmedLine.match(/^ENTRY_(\d+)_WORD:/)) {
        const entryNum = parseInt(trimmedLine.match(/^ENTRY_(\d+)_WORD:/)?.[1] || '0');
        const word = trimmedLine.replace(/^ENTRY_\d+_WORD:/, '').trim();
        
        if (entryNum !== currentEntryIndex) {
          if (currentEntry) {
            translations.entries.push(currentEntry);
          }
          currentEntry = {
            word: word,
            origin: '',
            definitions: []
          };
          currentEntryIndex = entryNum;
        }
      } else if (trimmedLine.match(/^ENTRY_(\d+)_ORIGIN_TRANSLATION:/)) {
        const translation = trimmedLine.replace(/^ENTRY_\d+_ORIGIN_TRANSLATION:/, '').trim();
        if (translation && translation !== '[ADD YOUR TRANSLATION HERE]' && currentEntry) {
          currentEntry.origin = translation;
        }
      } else if (trimmedLine.match(/^ENTRY_(\d+)_DEF_(\d+)_CLASS:/)) {
        const matches = trimmedLine.match(/^ENTRY_(\d+)_DEF_(\d+)_CLASS:/);
        const defNum = parseInt(matches?.[2] || '0');
        const grammaticalClass = trimmedLine.replace(/^ENTRY_\d+_DEF_\d+_CLASS:/, '').trim();
        
        if (currentEntry) {
          // Ensure we have enough definition slots
          while (currentEntry.definitions.length < defNum) {
            currentEntry.definitions.push({
              grammaticalClass: '',
              meaning: '',
              example: '',
              grammaticalClassTranslation: '',
              meaningTranslation: '',
              exampleTranslation: ''
            });
          }
          currentEntry.definitions[defNum - 1].grammaticalClass = grammaticalClass;
        }
      } else if (trimmedLine.match(/^ENTRY_(\d+)_DEF_(\d+)_CLASS_TRANSLATION:/)) {
        const matches = trimmedLine.match(/^ENTRY_(\d+)_DEF_(\d+)_CLASS_TRANSLATION:/);
        const defNum = parseInt(matches?.[2] || '0');
        const translation = trimmedLine.replace(/^ENTRY_\d+_DEF_\d+_CLASS_TRANSLATION:/, '').trim();
        
        if (translation && translation !== '[ADD YOUR TRANSLATION HERE]' && currentEntry && currentEntry.definitions[defNum - 1]) {
          currentEntry.definitions[defNum - 1].grammaticalClassTranslation = translation;
        }
      } else if (trimmedLine.match(/^ENTRY_(\d+)_DEF_(\d+)_MEANING:/)) {
        const matches = trimmedLine.match(/^ENTRY_(\d+)_DEF_(\d+)_MEANING:/);
        const defNum = parseInt(matches?.[2] || '0');
        const meaning = trimmedLine.replace(/^ENTRY_\d+_DEF_\d+_MEANING:/, '').trim();
        
        if (currentEntry && currentEntry.definitions[defNum - 1]) {
          currentEntry.definitions[defNum - 1].meaning = meaning;
        }
      } else if (trimmedLine.match(/^ENTRY_(\d+)_DEF_(\d+)_MEANING_TRANSLATION:/)) {
        const matches = trimmedLine.match(/^ENTRY_(\d+)_DEF_(\d+)_MEANING_TRANSLATION:/);
        const defNum = parseInt(matches?.[2] || '0');
        const translation = trimmedLine.replace(/^ENTRY_\d+_DEF_\d+_MEANING_TRANSLATION:/, '').trim();
        
        if (translation && translation !== '[ADD YOUR TRANSLATION HERE]' && currentEntry && currentEntry.definitions[defNum - 1]) {
          currentEntry.definitions[defNum - 1].meaningTranslation = translation;
        }
      } else if (trimmedLine.match(/^ENTRY_(\d+)_DEF_(\d+)_EXAMPLE:/)) {
        const matches = trimmedLine.match(/^ENTRY_(\d+)_DEF_(\d+)_EXAMPLE:/);
        const defNum = parseInt(matches?.[2] || '0');
        const example = trimmedLine.replace(/^ENTRY_\d+_DEF_\d+_EXAMPLE:/, '').trim();
        
        if (currentEntry && currentEntry.definitions[defNum - 1]) {
          currentEntry.definitions[defNum - 1].example = example;
        }
      } else if (trimmedLine.match(/^ENTRY_(\d+)_DEF_(\d+)_EXAMPLE_TRANSLATION:/)) {
        const matches = trimmedLine.match(/^ENTRY_(\d+)_DEF_(\d+)_EXAMPLE_TRANSLATION:/);
        const defNum = parseInt(matches?.[2] || '0');
        const translation = trimmedLine.replace(/^ENTRY_\d+_DEF_\d+_EXAMPLE_TRANSLATION:/, '').trim();
        
        if (translation && translation !== '[ADD YOUR TRANSLATION HERE]' && currentEntry && currentEntry.definitions[defNum - 1]) {
          currentEntry.definitions[defNum - 1].exampleTranslation = translation;
        }
      }
    }

    // Don't forget the last entry
    if (currentEntry) {
      translations.entries.push(currentEntry);
    }

    return translations;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const importSummary = {
      dictionaryTranslated: false,
      entriesProcessed: 0,
      entriesTranslated: 0,
      definitionsProcessed: 0,
      definitionsTranslated: 0,
      errors: [] as string[]
    };

    try {
      const text = await file.text();
      const translations = parseTranslationFile(text);

      console.log(`Importing ${language} translations:`, translations);

      // Import dictionary translations - only save if there's actual content
      if (translations.dictionary.title || translations.dictionary.description) {
        try {
          const { error: dictError } = await supabase
            .from('dictionary_translations')
            .upsert({
              dictionary_id: DICTIONARY_ID,
              language: language,
              title: translations.dictionary.title || null,
              description: translations.dictionary.description || null
            }, {
              onConflict: 'dictionary_id,language'
            });

          if (dictError) {
            console.error(`Error saving ${language} dictionary translation:`, dictError);
            importSummary.errors.push(`Dictionary translation error: ${dictError.message}`);
          } else {
            importSummary.dictionaryTranslated = true;
          }
        } catch (error: any) {
          importSummary.errors.push(`Dictionary translation error: ${error.message}`);
        }
      }

      // Import entry translations with improved matching and error handling
      for (const entryTranslation of translations.entries) {
        const { word, origin, definitions } = entryTranslation;
        importSummary.entriesProcessed++;
        
        // Find the entry by word using case-insensitive search and multiple matching strategies
        let matchingEntry = data.entries.find(entry => 
          entry.word.toLowerCase() === word.toLowerCase()
        );

        // If not found, try matching by removing special characters and spaces
        if (!matchingEntry) {
          const normalizeWord = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
          const normalizedSearchWord = normalizeWord(word);
          matchingEntry = data.entries.find(entry => 
            normalizeWord(entry.word) === normalizedSearchWord
          );
        }

        if (!matchingEntry) {
          console.warn(`Entry not found for word: "${word}"`);
          importSummary.errors.push(`Entry not found: "${word}"`);
          continue;
        }

        console.log(`Processing entry: "${word}" -> Found: "${matchingEntry.word}" (ID: ${matchingEntry.id})`);

        // Save entry translation (origin) - only if there's actual content
        if (origin) {
          try {
            const { error: entryError } = await supabase
              .from('entry_translations')
              .upsert({
                entry_id: matchingEntry.id,
                language: language,
                origin: origin
              }, {
                onConflict: 'entry_id,language'
              });

            if (entryError) {
              console.error(`Error saving ${language} entry translation for ${word}:`, entryError);
              importSummary.errors.push(`Entry "${word}" origin translation error: ${entryError.message}`);
            } else {
              importSummary.entriesTranslated++;
              console.log(`Successfully saved ${language} entry translation for "${word}"`);
            }
          } catch (error: any) {
            importSummary.errors.push(`Entry "${word}" origin translation error: ${error.message}`);
          }
        }

        // Save definition translations with improved matching
        for (let defIndex = 0; defIndex < definitions.length; defIndex++) {
          const defTranslation = definitions[defIndex];
          const { grammaticalClass, meaning, example } = defTranslation;
          importSummary.definitionsProcessed++;
          
          console.log(`Processing definition ${defIndex + 1} for "${word}":`, {
            grammaticalClass,
            meaning: meaning?.substring(0, 50) + '...',
            hasTranslations: !!(defTranslation.grammaticalClassTranslation || defTranslation.meaningTranslation || defTranslation.exampleTranslation)
          });

          // Find matching definition using multiple strategies
          let matchingDefinition = null;

          // Strategy 1: Match by exact grammatical class and meaning
          matchingDefinition = matchingEntry.definitions.find(def =>
            def.grammaticalClass.toLowerCase().trim() === grammaticalClass.toLowerCase().trim() &&
            def.meaning.toLowerCase().trim() === meaning.toLowerCase().trim()
          );

          // Strategy 2: Match by position if exact match fails
          if (!matchingDefinition && defIndex < matchingEntry.definitions.length) {
            matchingDefinition = matchingEntry.definitions[defIndex];
            console.log(`Using position-based matching for definition ${defIndex + 1} of "${word}"`);
          }

          // Strategy 3: Match by grammatical class only if still no match
          if (!matchingDefinition) {
            matchingDefinition = matchingEntry.definitions.find(def =>
              def.grammaticalClass.toLowerCase().trim() === grammaticalClass.toLowerCase().trim()
            );
            if (matchingDefinition) {
              console.log(`Using grammatical class only matching for definition of "${word}"`);
            }
          }

          if (!matchingDefinition) {
            console.warn(`Definition not found for: "${word}" - ${grammaticalClass} - ${meaning?.substring(0, 30)}...`);
            importSummary.errors.push(`Definition not found for "${word}": ${grammaticalClass} - ${meaning?.substring(0, 30)}...`);
            continue;
          }

          console.log(`Matched definition for "${word}": ${matchingDefinition.grammaticalClass} - ${matchingDefinition.meaning?.substring(0, 30)}... (ID: ${matchingDefinition.id})`);

          // Only save translations that have actual content
          const hasTranslations = defTranslation.grammaticalClassTranslation || 
                                 defTranslation.meaningTranslation || 
                                 defTranslation.exampleTranslation;

          if (hasTranslations) {
            try {
              const { error: defError } = await supabase
                .from('definition_translations')
                .upsert({
                  definition_id: matchingDefinition.id,
                  language: language,
                  grammatical_class: defTranslation.grammaticalClassTranslation || null,
                  meaning: defTranslation.meaningTranslation || null,
                  example: defTranslation.exampleTranslation || null
                }, {
                  onConflict: 'definition_id,language'
                });

              if (defError) {
                console.error(`Error saving ${language} definition translation:`, defError);
                importSummary.errors.push(`Definition translation error for "${word}": ${defError.message}`);
              } else {
                importSummary.definitionsTranslated++;
                console.log(`Successfully saved ${language} definition translation for "${word}" - ${matchingDefinition.grammaticalClass}`);
              }
            } catch (error: any) {
              importSummary.errors.push(`Definition translation error for "${word}": ${error.message}`);
            }
          }
        }
      }

      // Show comprehensive import summary
      const successMessage = `${language === 'de' ? 'German' : 'Portuguese'} translations imported:\n` +
                            `• Dictionary: ${importSummary.dictionaryTranslated ? 'Translated' : 'Skipped'}\n` +
                            `• Entries: ${importSummary.entriesTranslated}/${importSummary.entriesProcessed} translated\n` +
                            `• Definitions: ${importSummary.definitionsTranslated}/${importSummary.definitionsProcessed} translated`;

      if (importSummary.errors.length > 0) {
        console.warn('Import completed with errors:', importSummary.errors);
        toast({
          title: "Import completed with warnings",
          description: `${successMessage}\n\n${importSummary.errors.length} warnings - check console for details`,
          variant: "default"
        });
      } else {
        toast({
          title: "Translations imported successfully",
          description: successMessage,
        });
      }

      console.log(`Successfully imported ${language} translations. Summary:`, importSummary);
      
      // Auto-switch to the imported language
      setCurrentLanguage(language);
      
      // Trigger data refresh if callback provided
      if (onRefreshData) {
        onRefreshData();
      }

      // Small delay to ensure language switch is processed
      setTimeout(() => {
        onBack();
      }, 500);

    } catch (error: any) {
      console.error(`Error importing ${language} translations:`, error);
      toast({
        title: "Import failed",
        description: error.message || `Failed to import ${language} translations`,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
        </button>
        <h3 className="font-funnel-display text-lg font-bold">Back</h3>
      </div>

      <h2 className="font-funnel-display text-2xl font-bold">
        Import {language === 'de' ? 'German' : 'Portuguese'} Translations
      </h2>

      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-funnel-display font-bold mb-2">File Format</h4>
          <p className="font-funnel-sans text-sm text-gray-700 mb-3">
            Upload the text file created by "Export Translation Template". The file contains all dictionary content 
            with translation placeholder lines. Simply fill in your translations and upload the file back.
          </p>
          <p className="font-funnel-sans text-sm text-gray-600">
            For fields that are empty in English (like missing examples), leave the translation line empty too - 
            don't add any translation text for empty original fields.
          </p>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h4 className="font-funnel-display font-bold mb-2">Upload Translation File</h4>
          <p className="font-funnel-sans text-sm text-gray-600 mb-4">
            Select the text file with {language === 'de' ? 'German' : 'Portuguese'} translations
          </p>
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
            id="translation-upload"
          />
          <label
            htmlFor="translation-upload"
            className={`inline-block px-6 py-3 bg-blue-500 text-white rounded-lg font-funnel-sans font-bold cursor-pointer transition-colors ${
              isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
          >
            {isUploading ? 'Uploading...' : 'Choose File'}
          </label>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-funnel-display font-bold mb-2">Important Notes</h4>
          <ul className="font-funnel-sans text-sm text-gray-700 space-y-1">
            <li>• Use "Export Translation Template" to get the translation file</li>
            <li>• Only fill in translations where there's original English content</li>
            <li>• Leave translation lines empty when the original field is empty</li>
            <li>• Translations are matched by word and definition content</li>
            <li>• The import will try multiple matching strategies for better accuracy</li>
            <li>• Existing translations for the same language will be overwritten</li>
            <li>• Words not found in the dictionary will be skipped</li>
            <li>• After upload, the app will automatically switch to the imported language</li>
            <li>• A detailed summary will show what was successfully imported</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TranslationImportView;
