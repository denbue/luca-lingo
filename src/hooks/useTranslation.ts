
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
      console.log('Calling translation function for:', text);
      
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: { text, targetLanguage, context }
      });

      if (error) {
        console.error('Translation function error:', error);
        
        // Handle specific OpenAI quota error
        if (error.message?.includes('insufficient_quota') || error.message?.includes('quota')) {
          toast({
            title: "OpenAI API Quota Exceeded",
            description: "Your OpenAI API key has exceeded its quota. Please check your OpenAI billing and usage limits.",
            variant: "destructive"
          });
          return '';
        }
        
        // Handle rate limiting
        if (error.message?.includes('rate limit') || error.message?.includes('429')) {
          toast({
            title: "Rate Limited",
            description: "Translation service is temporarily busy. Please try again in a few minutes.",
            variant: "destructive"
          });
          return '';
        }
        
        throw error;
      }
      
      console.log('Translation successful:', data);
      return data?.translation || '';
    } catch (error: any) {
      console.error('Translation error:', error);
      
      let errorMessage = "Failed to translate text";
      
      // Check for specific error types
      if (error.message?.includes('insufficient_quota') || error.message?.includes('quota')) {
        errorMessage = "OpenAI API quota exceeded. Please check your billing settings.";
      } else if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        errorMessage = "Translation service is temporarily busy. Please try again in a few minutes.";
      } else if (error.message?.includes('API key')) {
        errorMessage = "OpenAI API key is invalid or not configured properly.";
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
