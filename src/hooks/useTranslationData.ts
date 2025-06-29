
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DictionaryEntry } from '@/types/dictionary';
import { useToast } from '@/hooks/use-toast';

interface TranslationData {
  definitions: Array<{
    id: string;
    grammaticalClass: string;
    meaning: string;
    example: string;
  }>;
  origin: string;
}

export const useTranslationData = (entry: DictionaryEntry | null) => {
  const [germanTranslations, setGermanTranslations] = useState<TranslationData>({
    definitions: [],
    origin: ''
  });
  const [portugueseTranslations, setPortugueseTranslations] = useState<TranslationData>({
    definitions: [],
    origin: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!entry) return;

    // Initialize empty translations structure
    const emptyTranslations: TranslationData = {
      definitions: entry.definitions.map(def => ({
        id: def.id,
        grammaticalClass: '',
        meaning: '',
        example: ''
      })),
      origin: ''
    };

    setGermanTranslations(emptyTranslations);
    setPortugueseTranslations(emptyTranslations);

    loadExistingTranslations();
  }, [entry]);

  const loadExistingTranslations = async () => {
    if (!entry) return;

    setLoading(true);
    try {
      console.log('Loading existing translations for entry:', entry.id);

      // Load entry translations
      const { data: entryTranslations, error: entryError } = await supabase
        .from('entry_translations')
        .select('*')
        .eq('entry_id', entry.id)
        .in('language', ['de', 'pt']);

      if (entryError) {
        console.error('Error loading entry translations:', entryError);
      }

      // Load definition translations
      const definitionIds = entry.definitions.map(def => def.id);
      const { data: definitionTranslations, error: defError } = await supabase
        .from('definition_translations')
        .select('*')
        .in('definition_id', definitionIds)
        .in('language', ['de', 'pt']);

      if (defError) {
        console.error('Error loading definition translations:', defError);
      }

      // Process German translations
      const germanEntryTranslation = entryTranslations?.find(t => t.language === 'de');
      const germanDefTranslations = definitionTranslations?.filter(t => t.language === 'de') || [];

      const germanData: TranslationData = {
        origin: germanEntryTranslation?.origin || '',
        definitions: entry.definitions.map(def => {
          const translation = germanDefTranslations.find(t => t.definition_id === def.id);
          return {
            id: def.id,
            grammaticalClass: translation?.grammatical_class || '',
            meaning: translation?.meaning || '',
            example: translation?.example || ''
          };
        })
      };

      // Process Portuguese translations
      const portugueseEntryTranslation = entryTranslations?.find(t => t.language === 'pt');
      const portugueseDefTranslations = definitionTranslations?.filter(t => t.language === 'pt') || [];

      const portugueseData: TranslationData = {
        origin: portugueseEntryTranslation?.origin || '',
        definitions: entry.definitions.map(def => {
          const translation = portugueseDefTranslations.find(t => t.definition_id === def.id);
          return {
            id: def.id,
            grammaticalClass: translation?.grammatical_class || '',
            meaning: translation?.meaning || '',
            example: translation?.example || ''
          };
        })
      };

      console.log('Loaded German translations:', germanData);
      console.log('Loaded Portuguese translations:', portugueseData);

      setGermanTranslations(germanData);
      setPortugueseTranslations(portugueseData);

    } catch (error: any) {
      console.error('Error loading existing translations:', error);
      toast({
        title: "Error loading translations",
        description: error.message || "Failed to load existing translations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    germanTranslations,
    setGermanTranslations,
    portugueseTranslations,
    setPortugueseTranslations,
    loading
  };
};
