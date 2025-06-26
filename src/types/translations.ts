
export type Language = 'en' | 'de' | 'pt';

export interface TranslatedText {
  en: string;
  de: string;
  pt: string;
}

export interface TranslatedDictionaryData {
  title: TranslatedText;
  description: TranslatedText;
  entries: TranslatedDictionaryEntry[];
}

export interface TranslatedDictionaryEntry {
  id: string;
  word: string; // Only in English
  ipa: string;
  definitions: TranslatedDefinition[];
  origin: TranslatedText;
  audioUrl?: string;
  colorCombo: 1 | 2 | 3 | 4;
}

export interface TranslatedDefinition {
  id: string;
  grammaticalClass: TranslatedText;
  meaning: TranslatedText;
  example?: TranslatedText;
}

export const LANGUAGES: Record<Language, string> = {
  en: 'English',
  de: 'German',
  pt: 'Portuguese'
};
