
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      const translations = JSON.parse(text);

      console.log(`Importing ${language} translations:`, translations);

      // Validate the structure
      if (!translations.dictionary || !translations.entries) {
        throw new Error('Invalid translation file format. Expected dictionary and entries properties.');
      }

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

  const downloadSampleFile = () => {
    const sampleData = {
      dictionary: {
        title: `[${language.toUpperCase()}] Dictionary Title Translation`,
        description: `[${language.toUpperCase()}] Dictionary Description Translation`
      },
      entries: data.entries.slice(0, 2).map(entry => ({
        word: entry.word,
        origin: `[${language.toUpperCase()}] Origin translation for ${entry.word}`,
        definitions: entry.definitions.map(def => ({
          grammaticalClass: def.grammaticalClass,
          meaning: def.meaning,
          example: def.example || "",
          grammaticalClassTranslation: `[${language.toUpperCase()}] ${def.grammaticalClass}`,
          meaningTranslation: `[${language.toUpperCase()}] ${def.meaning}`,
          exampleTranslation: def.example ? `[${language.toUpperCase()}] ${def.example}` : ""
        }))
      }))
    };

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sample-${language}-translations.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            Upload a JSON file with translations for dictionary entries and metadata. 
            The file should contain a "dictionary" object with title and description translations, 
            and an "entries" array with translations for each word.
          </p>
          <button
            onClick={downloadSampleFile}
            className="text-blue-600 hover:text-blue-800 font-funnel-sans text-sm underline"
          >
            Download sample file format
          </button>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h4 className="font-funnel-display font-bold mb-2">Upload Translation File</h4>
          <p className="font-funnel-sans text-sm text-gray-600 mb-4">
            Select a JSON file with {language === 'de' ? 'German' : 'Portuguese'} translations
          </p>
          <input
            type="file"
            accept=".json"
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
            <li>• Translations are matched by word and definition content</li>
            <li>• Existing translations for the same language will be overwritten</li>
            <li>• Words not found in the dictionary will be skipped</li>
            <li>• Make sure your JSON file is properly formatted</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TranslationImportView;
