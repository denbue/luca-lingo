
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const translateText = async (text: string, targetLanguage: 'de' | 'pt', context?: string) => {
    if (!text.trim()) return '';
    
    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: { text, targetLanguage, context }
      });

      if (error) throw error;
      
      return data.translation || '';
    } catch (error: any) {
      console.error('Translation error:', error);
      toast({
        title: "Translation failed",
        description: error.message || "Failed to translate text",
        variant: "destructive"
      });
      return '';
    } finally {
      setIsTranslating(false);
    }
  };

  return { translateText, isTranslating };
};
