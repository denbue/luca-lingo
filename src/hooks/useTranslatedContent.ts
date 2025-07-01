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
  const [originLabel, setOriginLabel] = useState('Origin: ');
  const { toast } = useToast();

  const forceRefresh = useCallback(() => {
    console.log('Force refreshing translated content...');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!data || language === 'en') {
      console.log(`Setting data directly for language: ${language}`);
      setTranslatedData(data);
      setOriginLabel('Origin: ');
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

      // Get dictionary translations (title, description, and origin label)
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

      // Set the origin label based on translation or fallback
      const translatedOriginLabel = dictTranslations?.origin_label || 
        (language === 'de' ? 'Herkunft: ' : language === 'pt' ? 'Origem: ' : 'Origin: ');
      setOriginLabel(translatedOriginLabel);

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
        console.log(`Entry translations for ${language}:`, entryTranslations?.length || 0, 'translations found');
        entryTranslations?.forEach(et => {
          console.log(`Entry translation: ${et.entry_id} -> "${et.origin}"`);
        });
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
        console.log(`Definition translations for ${language}:`, definitionTranslations?.length || 0, 'translations found');
        definitionTranslations?.forEach(dt => {
          console.log(`Definition translation: ${dt.definition_id} -> class: "${dt.grammatical_class}", meaning: "${dt.meaning?.substring(0, 30)}..."`);
        });
      }

      // Create translated data structure - IDs are now stable
      const translatedEntries = data.entries.map(entry => {
        const entryTranslation = entryTranslations?.find(t => t.entry_id === entry.id);
        
        console.log(`Processing entry "${entry.word}" (ID: ${entry.id}) - Found translation: ${!!entryTranslation}`);
        
        const translatedDefinitions = entry.definitions.map(def => {
          const defTranslation = definitionTranslations?.find(t => t.definition_id === def.id);
          
          const translatedDef = {
            ...def,
            grammaticalClass: defTranslation?.grammatical_class || def.grammaticalClass,
            meaning: defTranslation?.meaning || def.meaning,
            example: defTranslation?.example || def.example
          };

          if (defTranslation) {
            console.log(`Definition ${def.id} translated: class="${translatedDef.grammaticalClass}", meaning="${translatedDef.meaning?.substring(0, 30)}..."`);
          } else {
            console.log(`Definition ${def.id} not translated (using original): class="${def.grammaticalClass}", meaning="${def.meaning?.substring(0, 30)}..."`);
          }

          return translatedDef;
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
      
      // Log summary of translations applied
      const entriesWithOriginTranslations = translatedEntries.filter(e => e.origin !== data.entries.find(orig => orig.id === e.id)?.origin).length;
      const definitionsWithTranslations = translatedEntries.flatMap(e => e.definitions).filter(d => {
        const origEntry = data.entries.find(e => e.id === translatedEntries.find(te => te.definitions.includes(d))?.id);
        const origDef = origEntry?.definitions.find(od => od.id === d.id);
        return origDef && (d.grammaticalClass !== origDef.grammaticalClass || d.meaning !== origDef.meaning || d.example !== origDef.example);
      }).length;
      
      console.log(`Translation summary for ${language}:`, {
        entriesWithOriginTranslations,
        definitionsWithTranslations,
        totalEntries: translatedEntries.length,
        totalDefinitions: translatedEntries.flatMap(e => e.definitions).length
      });

      setTranslatedData(translatedDictionary);

    } catch (error: any) {
      console.error('Error loading translations:', error);
      toast({
        title: "Error loading translations",
        description: error.message || "Failed to load translations",
        variant: "destructive"
      });
      setTranslatedData(data); // Fallback to original data
      setOriginLabel('Origin: ');
    } finally {
      setLoading(false);
    }
  };

  return { translatedData, loading, forceRefresh, originLabel };
};
