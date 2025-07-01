
-- First, let's check and remove any duplicate foreign key constraints
-- Drop the constraints we just added if they're duplicates
ALTER TABLE definitions 
DROP CONSTRAINT IF EXISTS fk_definitions_entry_id;

ALTER TABLE dictionary_entries 
DROP CONSTRAINT IF EXISTS fk_dictionary_entries_dictionary_id;

ALTER TABLE entry_translations 
DROP CONSTRAINT IF EXISTS fk_entry_translations_entry_id;

ALTER TABLE definition_translations 
DROP CONSTRAINT IF EXISTS fk_definition_translations_definition_id;

-- Now add them back properly, checking if the original constraints exist
-- Add foreign key for definitions -> dictionary_entries if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'definitions_entry_id_fkey' 
        AND table_name = 'definitions'
    ) THEN
        ALTER TABLE definitions 
        ADD CONSTRAINT definitions_entry_id_fkey 
        FOREIGN KEY (entry_id) REFERENCES dictionary_entries(id) 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Add foreign key for dictionary_entries -> dictionaries if it doesn't exist  
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'dictionary_entries_dictionary_id_fkey' 
        AND table_name = 'dictionary_entries'
    ) THEN
        ALTER TABLE dictionary_entries 
        ADD CONSTRAINT dictionary_entries_dictionary_id_fkey 
        FOREIGN KEY (dictionary_id) REFERENCES dictionaries(id) 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Add foreign key for entry_translations -> dictionary_entries if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'entry_translations_entry_id_fkey' 
        AND table_name = 'entry_translations'
    ) THEN
        ALTER TABLE entry_translations 
        ADD CONSTRAINT entry_translations_entry_id_fkey 
        FOREIGN KEY (entry_id) REFERENCES dictionary_entries(id) 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Add foreign key for definition_translations -> definitions if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'definition_translations_definition_id_fkey' 
        AND table_name = 'definition_translations'
    ) THEN
        ALTER TABLE definition_translations 
        ADD CONSTRAINT definition_translations_definition_id_fkey 
        FOREIGN KEY (definition_id) REFERENCES definitions(id) 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
