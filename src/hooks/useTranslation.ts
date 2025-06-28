
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

      if (error) {
        console.error('Translation error:', error);
        throw error;
      }
      
      return data.translation || '';
    } catch (error: any) {
      console.error('Translation error:', error);
      
      let errorMessage = "Failed to translate text";
      if (error.message?.includes('rate limit')) {
        errorMessage = "Translation service is temporarily busy. Please try again in a few minutes.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Translation failed",
        description: errorMessage,
        variant: "destructive"
      });
      return '';
    } finally {
      setIsTranslating(false);
    }
  };

  return { translateText, isTranslating };
};
