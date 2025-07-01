
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DictionaryData, DictionaryEntry } from '@/types/dictionary';
import { Language } from '@/types/translations';
import { useToast } from '@/hooks/use-toast';

const DICTIONARY_ID = '00000000-0000-0000-0000-000000000001';

export const useTranslatedContent = (data: DictionaryData | null, language: Language) => {
  const [translatedData, setTranslatedData] = useState<DictionaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  const forceRefresh = useCallback(() => {
    console.log('Force refreshing translated content...');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!data || language === 'en') {
      console.log(`Setting data directly for language: ${language}`);
      setTranslatedData(data);
      return;
    }

    console.log(`Loading translations for language: ${language} (trigger: ${refreshTrigger})`);
    loadTranslations();
  }, [data, language, refreshTrigger]);

  const loadTranslations = async () => {
    if (!data) return;

    setLoading(true);
    try {
      console.log(`Loading translations for language: ${language}`);

      // Get dictionary translations (title and description)
      const { data: dictTranslations, error: dictError } = await supabase
        .from('dictionary_translations')
        .select('*')
        .eq('dictionary_id', DICTIONARY_ID)
        .eq('language', language)
        .maybeSingle();

      if (dictError) {
        console.error('Error loading dictionary translations:', dictError);
      } else {
        console.log(`Dictionary translations for ${language}:`, dictTranslations);
      }

      // Get entry IDs - using the PRESERVED database IDs
      const entryIds = data.entries.map(entry => entry.id);
      console.log(`Looking for entry translations for ${entryIds.length} entries with preserved IDs`);

      // Get entry translations using the preserved IDs
      const { data: entryTranslations, error: entryError } = await supabase
        .from('entry_translations')
        .select('*')
        .eq('language', language)
        .in('entry_id', entryIds);

      if (entryError) {
        console.error('Error loading entry translations:', entryError);
      } else {
        console.log(`Entry translations for ${language}:`, entryTranslations);
      }

      // Get definition IDs - using the PRESERVED database IDs
      const definitionIds = data.entries.flatMap(entry => entry.definitions.map(def => def.id));
      console.log(`Looking for definition translations for ${definitionIds.length} definitions with preserved IDs`);

      // Get definition translations using the preserved IDs
      const { data: definitionTranslations, error: defError } = await supabase
        .from('definition_translations')
        .select('*')
        .eq('language', language)
        .in('definition_id', definitionIds);

      if (defError) {
        console.error('Error loading definition translations:', defError);
      } else {
        console.log(`Definition translations for ${language}:`, definitionTranslations);
      }

      // Create translated data structure - IDs are now stable
      const translatedEntries = data.entries.map(entry => {
        const entryTranslation = entryTranslations?.find(t => t.entry_id === entry.id);
        
        console.log(`Processing entry "${entry.word}" (ID: ${entry.id}) - stable ID used`);
        
        const translatedDefinitions = entry.definitions.map(def => {
          const defTranslation = definitionTranslations?.find(t => t.definition_id === def.id);
          
          return {
            ...def,
            grammaticalClass: defTranslation?.grammatical_class || def.grammaticalClass,
            meaning: defTranslation?.meaning || def.meaning,
            example: defTranslation?.example || def.example
          };
        });

        return {
          ...entry,
          origin: entryTranslation?.origin || entry.origin,
          definitions: translatedDefinitions
        };
      });

      const translatedDictionary: DictionaryData = {
        title: dictTranslations?.title || data.title,
        description: dictTranslations?.description || data.description,
        entries: translatedEntries
      };

      console.log(`Final translated data for ${language} with stable IDs:`, translatedDictionary);
      setTranslatedData(translatedDictionary);

    } catch (error: any) {
      console.error('Error loading translations:', error);
      toast({
        title: "Error loading translations",
        description: error.message || "Failed to load translations",
        variant: "destructive"
      });
      setTranslatedData(data); // Fallback to original data
    } finally {
      setLoading(false);
    }
  };

  return { translatedData, loading, forceRefresh };
};
