
-- Phase 1: Add proper foreign key constraints to ensure referential integrity
ALTER TABLE entry_translations 
ADD CONSTRAINT fk_entry_translations_entry_id 
FOREIGN KEY (entry_id) REFERENCES dictionary_entries(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE definition_translations 
ADD CONSTRAINT fk_definition_translations_definition_id 
FOREIGN KEY (definition_id) REFERENCES definitions(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE definitions 
ADD CONSTRAINT fk_definitions_entry_id 
FOREIGN KEY (entry_id) REFERENCES dictionary_entries(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE dictionary_entries 
ADD CONSTRAINT fk_dictionary_entries_dictionary_id 
FOREIGN KEY (dictionary_id) REFERENCES dictionaries(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Phase 2: Add unique constraints to prevent duplicate translations
ALTER TABLE entry_translations 
ADD CONSTRAINT unique_entry_translation_per_language 
UNIQUE (entry_id, language);

ALTER TABLE definition_translations 
ADD CONSTRAINT unique_definition_translation_per_language 
UNIQUE (definition_id, language);

ALTER TABLE dictionary_translations 
ADD CONSTRAINT unique_dictionary_translation_per_language 
UNIQUE (dictionary_id, language);

-- Phase 3: Add a permanent slug identifier to entries for stable references
ALTER TABLE dictionary_entries 
ADD COLUMN slug text;

-- Create a function to generate slugs from words
CREATE OR REPLACE FUNCTION generate_slug(input_text text) 
RETURNS text AS $$
BEGIN
  RETURN lower(regexp_replace(trim(input_text), '[^a-zA-Z0-9]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Update existing entries with slugs based on their words
UPDATE dictionary_entries 
SET slug = generate_slug(word) 
WHERE slug IS NULL;

-- Add unique constraint on slug within each dictionary
ALTER TABLE dictionary_entries 
ADD CONSTRAINT unique_slug_per_dictionary 
UNIQUE (dictionary_id, slug);

-- Create a trigger to automatically generate slugs for new entries
CREATE OR REPLACE FUNCTION auto_generate_slug() 
RETURNS trigger AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.word);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_slug
  BEFORE INSERT OR UPDATE ON dictionary_entries
  FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();
