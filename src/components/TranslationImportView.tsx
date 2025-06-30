
import React, { useState } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { DictionaryData } from '../types/dictionary';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TranslationImportViewProps {
  data: DictionaryData;
  language: 'de' | 'pt';
  onBack: () => void;
}

const DICTIONARY_ID = '00000000-0000-0000-0000-000000000001';

const TranslationImportView = ({ data, language, onBack }: TranslationImportViewProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

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
    try {
      const text = await file.text();
      const translations = parseTranslationFile(text);

      console.log(`Importing ${language} translations:`, translations);

      // Import dictionary translations
      if (translations.dictionary.title || translations.dictionary.description) {
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
          throw dictError;
        }
      }

      // Import entry translations
      for (const entryTranslation of translations.entries) {
        const { word, origin, definitions } = entryTranslation;
        
        // Find the entry by word
        const matchingEntry = data.entries.find(entry => 
          entry.word.toLowerCase() === word.toLowerCase()
        );

        if (!matchingEntry) {
          console.warn(`Entry not found for word: ${word}`);
          continue;
        }

        // Save entry translation (origin)
        if (origin) {
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
          }
        }

        // Save definition translations
        for (const defTranslation of definitions) {
          const { grammaticalClass, meaning, example } = defTranslation;
          
          // Find matching definition by grammatical class and meaning
          const matchingDefinition = matchingEntry.definitions.find(def =>
            def.grammaticalClass.toLowerCase() === grammaticalClass.toLowerCase() &&
            def.meaning.toLowerCase() === meaning.toLowerCase()
          );

          if (!matchingDefinition) {
            console.warn(`Definition not found for: ${grammaticalClass} - ${meaning}`);
            continue;
          }

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
          }
        }
      }

      toast({
        title: "Translations imported successfully",
        description: `${language === 'de' ? 'German' : 'Portuguese'} translations have been imported and saved.`,
      });

      onBack();

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
            Upload a text file with translations. Use the "Export Dictionary" function to create a translation template 
            with all the original content and placeholder lines for translations. Just fill in the translation lines and upload the file back.
          </p>
          <p className="font-funnel-sans text-sm text-gray-600">
            The template contains lines like "DICTIONARY_TITLE_TRANSLATION: [ADD YOUR TRANSLATION HERE]" - 
            simply replace the placeholder text with your translations.
          </p>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h4 className="font-funnel-display font-bold mb-2">Upload Translation File</h4>
          <p className="font-funnel-sans text-sm text-gray-600 mb-4">
            Select a text file with {language === 'de' ? 'German' : 'Portuguese'} translations
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
            <li>• Use the "Export Dictionary" function to get the translation template</li>
            <li>• Replace "[ADD YOUR TRANSLATION HERE]" with your actual translations</li>
            <li>• Translations are matched by word and definition content</li>
            <li>• Existing translations for the same language will be overwritten</li>
            <li>• Words not found in the dictionary will be skipped</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TranslationImportView;
