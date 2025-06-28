
-- Create tables to store translations for dictionary metadata
CREATE TABLE IF NOT EXISTS dictionary_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dictionary_id UUID REFERENCES dictionaries(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('de', 'pt')),
  title TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(dictionary_id, language)
);

-- Create tables to store translations for dictionary entries
CREATE TABLE IF NOT EXISTS entry_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES dictionary_entries(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('de', 'pt')),
  origin TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(entry_id, language)
);

-- Create tables to store translations for definitions
CREATE TABLE IF NOT EXISTS definition_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  definition_id UUID REFERENCES definitions(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('de', 'pt')),
  grammatical_class TEXT,
  meaning TEXT,
  example TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(definition_id, language)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dictionary_translations_dict_lang ON dictionary_translations(dictionary_id, language);
CREATE INDEX IF NOT EXISTS idx_entry_translations_entry_lang ON entry_translations(entry_id, language);
CREATE INDEX IF NOT EXISTS idx_definition_translations_def_lang ON definition_translations(definition_id, language);
