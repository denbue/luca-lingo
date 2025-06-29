
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DictionaryData } from '@/types/dictionary';
import { useToast } from '@/hooks/use-toast';

const DICTIONARY_ID = '00000000-0000-0000-0000-000000000001';

interface DictionaryTranslation {
  title: string;
  description: string;
}

export const useDictionaryTranslations = (data: DictionaryData | null) => {
  const [germanTranslation, setGermanTranslation] = useState<DictionaryTranslation>({
    title: '',
    description: ''
  });
  const [portugueseTranslation, setPortugueseTranslation] = useState<DictionaryTranslation>({
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!data) return;
    loadExistingTranslations();
  }, [data]);

  const loadExistingTranslations = async () => {
    if (!data) return;

    setLoading(true);
    try {
      console.log('Loading existing dictionary translations');

      // Load dictionary translations for both languages
      const { data: translations, error } = await supabase
        .from('dictionary_translations')
        .select('*')
        .eq('dictionary_id', DICTIONARY_ID)
        .in('language', ['de', 'pt']);

      if (error) {
        console.error('Error loading dictionary translations:', error);
      }

      // Process German translations
      const germanData = translations?.find(t => t.language === 'de');
      if (germanData) {
        setGermanTranslation({
          title: germanData.title || '',
          description: germanData.description || ''
        });
      }

      // Process Portuguese translations
      const portugueseData = translations?.find(t => t.language === 'pt');
      if (portugueseData) {
        setPortugueseTranslation({
          title: portugueseData.title || '',
          description: portugueseData.description || ''
        });
      }

      console.log('Loaded dictionary translations:', { germanData, portugueseData });

    } catch (error: any) {
      console.error('Error loading dictionary translations:', error);
      toast({
        title: "Error loading translations",
        description: error.message || "Failed to load dictionary translations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveDictionaryTranslation = async (language: 'de' | 'pt', title: string, description: string) => {
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

    } catch (error: any) {
      console.error('Error saving dictionary translation:', error);
      toast({
        title: "Error saving translation",
        description: error.message || "Failed to save dictionary translation",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    germanTranslation,
    setGermanTranslation,
    portugueseTranslation,
    setPortugueseTranslation,
    loading,
    saveDictionaryTranslation
  };
};
