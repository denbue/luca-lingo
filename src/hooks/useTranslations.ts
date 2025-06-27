
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Language } from '@/types/translations';

export interface TranslationData {
  dictionaryTranslations: {
    de?: { title: string; description: string };
    pt?: { title: string; description: string };
  };
  entryTranslations: Record<string, {
    de?: { origin: string };
    pt?: { origin: string };
  }>;
  definitionTranslations: Record<string, {
    de?: { grammaticalClass: string; meaning: string; example?: string };
    pt?: { grammaticalClass: string; meaning: string; example?: string };
  }>;
}

const DICTIONARY_ID = '00000000-0000-0000-0000-000000000001';

export const useTranslations = () => {
  const [translations, setTranslations] = useState<TranslationData>({
    dictionaryTranslations: {},
    entryTranslations: {},
    definitionTranslations: {}
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadTranslations = async () => {
    try {
      console.log('Loading translations...');
      
      // Load dictionary translations
      const { data: dictTranslations, error: dictError } = await supabase
        .from('dictionary_translations')
        .select('*')
        .eq('dictionary_id', DICTIONARY_ID);

      if (dictError) throw dictError;

      // Load entry translations
      const { data: entryTranslations, error: entryError } = await supabase
        .from('entry_translations')
        .select('*');

      if (entryError) throw entryError;

      // Load definition translations
      const { data: defTranslations, error: defError } = await supabase
        .from('definition_translations')
        .select('*');

      if (defError) throw defError;

      // Transform data
      const dictionaryTranslations: TranslationData['dictionaryTranslations'] = {};
      dictTranslations?.forEach(t => {
        dictionaryTranslations[t.language as 'de' | 'pt'] = {
          title: t.title || '',
          description: t.description || ''
        };
      });

      const entryTranslationsMap: TranslationData['entryTranslations'] = {};
      entryTranslations?.forEach(t => {
        if (!entryTranslationsMap[t.entry_id!]) {
          entryTranslationsMap[t.entry_id!] = {};
        }
        entryTranslationsMap[t.entry_id!][t.language as 'de' | 'pt'] = {
          origin: t.origin || ''
        };
      });

      const definitionTranslationsMap: TranslationData['definitionTranslations'] = {};
      defTranslations?.forEach(t => {
        if (!definitionTranslationsMap[t.definition_id!]) {
          definitionTranslationsMap[t.definition_id!] = {};
        }
        definitionTranslationsMap[t.definition_id!][t.language as 'de' | 'pt'] = {
          grammaticalClass: t.grammatical_class || '',
          meaning: t.meaning || '',
          example: t.example || ''
        };
      });

      setTranslations({
        dictionaryTranslations,
        entryTranslations: entryTranslationsMap,
        definitionTranslations: definitionTranslationsMap
      });

      console.log('Translations loaded:', {
        dictionaryTranslations,
        entryTranslations: entryTranslationsMap,
        definitionTranslations: definitionTranslationsMap
      });
    } catch (error: any) {
      console.error('Error loading translations:', error);
      toast({
        title: "Error loading translations",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const translateText = async (text: string, targetLanguage: 'de' | 'pt'): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('translate-content', {
        body: { text, targetLanguage }
      });

      if (error) throw error;
      return data.translation;
    } catch (error: any) {
      console.error('Translation failed:', error);
      return `${text} [Translation needed]`;
    }
  };

  const saveDictionaryTranslation = async (language: 'de' | 'pt', title: string, description: string) => {
    try {
      const { error } = await supabase
        .from('dictionary_translations')
        .upsert({
          dictionary_id: DICTIONARY_ID,
          language,
          title,
          description
        });

      if (error) throw error;

      toast({
        title: "Translation saved",
        description: `Dictionary translation saved for ${language === 'de' ? 'German' : 'Portuguese'}`,
      });

      await loadTranslations();
    } catch (error: any) {
      console.error('Error saving dictionary translation:', error);
      toast({
        title: "Error saving translation",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const saveEntryTranslations = async (entryId: string, translations: {
    german?: { origin: string };
    portuguese?: { origin: string };
  }) => {
    try {
      const promises = [];

      if (translations.german) {
        promises.push(
          supabase.from('entry_translations').upsert({
            entry_id: entryId,
            language: 'de',
            origin: translations.german.origin
          })
        );
      }

      if (translations.portuguese) {
        promises.push(
          supabase.from('entry_translations').upsert({
            entry_id: entryId,
            language: 'pt',
            origin: translations.portuguese.origin
          })
        );
      }

      await Promise.all(promises);

      toast({
        title: "Translations saved",
        description: "Entry translations updated successfully",
      });

      await loadTranslations();
    } catch (error: any) {
      console.error('Error saving entry translations:', error);
      toast({
        title: "Error saving translations",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const saveDefinitionTranslations = async (definitionId: string, translations: {
    german?: { grammaticalClass: string; meaning: string; example?: string };
    portuguese?: { grammaticalClass: string; meaning: string; example?: string };
  }) => {
    try {
      const promises = [];

      if (translations.german) {
        promises.push(
          supabase.from('definition_translations').upsert({
            definition_id: definitionId,
            language: 'de',
            grammatical_class: translations.german.grammaticalClass,
            meaning: translations.german.meaning,
            example: translations.german.example
          })
        );
      }

      if (translations.portuguese) {
        promises.push(
          supabase.from('definition_translations').upsert({
            definition_id: definitionId,
            language: 'pt',
            grammatical_class: translations.portuguese.grammaticalClass,
            meaning: translations.portuguese.meaning,
            example: translations.portuguese.example
          })
        );
      }

      await Promise.all(promises);
      await loadTranslations();
    } catch (error: any) {
      console.error('Error saving definition translations:', error);
      toast({
        title: "Error saving translations",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const generateInitialTranslations = async () => {
    try {
      console.log('Generating initial translations...');
      toast({
        title: "Generating translations",
        description: "Creating AI translations for existing content...",
      });

      // This will be called to generate translations for existing content
      await loadTranslations();
    } catch (error: any) {
      console.error('Error generating initial translations:', error);
      toast({
        title: "Error generating translations",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadTranslations();
  }, []);

  return {
    translations,
    loading,
    translateText,
    saveDictionaryTranslation,
    saveEntryTranslations,
    saveDefinitionTranslations,
    generateInitialTranslations,
    refetch: loadTranslations
  };
};
