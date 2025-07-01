
export interface Definition {
  id: string;
  grammaticalClass: string;
  meaning: string;
  example?: string;
}

export interface DictionaryEntry {
  id: string;
  word: string;
  ipa: string;
  definitions: Definition[];
  origin: string;
  audioUrl?: string;
  colorCombo: 1 | 2 | 3 | 4;
  slug?: string; // Add slug field for stable identification
}

export interface DictionaryData {
  title: string;
  description: string;
  entries: DictionaryEntry[];
}
