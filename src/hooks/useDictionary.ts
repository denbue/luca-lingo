import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DictionaryData, DictionaryEntry, Definition } from '@/types/dictionary';
import { useToast } from '@/hooks/use-toast';

const DICTIONARY_ID = '00000000-0000-0000-0000-000000000001';

// Helper function to generate proper UUIDs ONLY for truly new entries
const generateUUID = (): string => {
  return crypto.randomUUID();
};

// Helper function to assign color combos in sequence after alphabetical sorting
const assignColorCombos = (entries: DictionaryEntry[]): DictionaryEntry[] => {
  return entries.map((entry, index) => ({
    ...entry,
    colorCombo: ((index % 4) + 1) as 1 | 2 | 3 | 4
  }));
};

export const useDictionary = () => {
  const [data, setData] = useState<DictionaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load dictionary data from Supabase
  const loadData = async () => {
    try {
      console.log('Loading dictionary data from Supabase...');
      
      // Get dictionary metadata
      const { data: dictionary, error: dictError } = await supabase
        .from('dictionaries')
        .select('*')
        .eq('id', DICTIONARY_ID)
        .single();

      if (dictError) {
        console.error('Error loading dictionary metadata:', dictError);
        throw dictError;
      }

      console.log('Dictionary metadata loaded:', dictionary);

      // Try a simpler query first to diagnose the relationship issue
      console.log('Attempting to load entries without definitions first...');
      const { data: entriesOnly, error: entriesOnlyError } = await supabase
        .from('dictionary_entries')
        .select('*')
        .eq('dictionary_id', DICTIONARY_ID)
        .order('word');

      if (entriesOnlyError) {
        console.error('Error loading entries only:', entriesOnlyError);
        throw entriesOnlyError;
      }

      console.log('Entries loaded successfully:', entriesOnly?.length, 'entries');

      // Now try to load definitions separately
      console.log('Loading definitions separately...');
      const entryIds = entriesOnly?.map(entry => entry.id) || [];
      
      const { data: definitions, error: defsError } = await supabase
        .from('definitions')
        .select('*')
        .in('entry_id', entryIds)
        .order('position');

      if (defsError) {
        console.error('Error loading definitions:', defsError);
        throw defsError;
      }

      console.log('Definitions loaded successfully:', definitions?.length, 'definitions');

      // Transform the data manually
      const transformedEntries: DictionaryEntry[] = (entriesOnly || [])
        .map(entry => {
          const entryDefinitions = (definitions || [])
            .filter(def => def.entry_id === entry.id)
            .map((def: any) => ({
              id: def.id as string,
              grammaticalClass: def.grammatical_class,
              meaning: def.meaning,
              example: def.example || undefined
            }));

          return {
            id: entry.id as string,
            word: entry.word,
            ipa: entry.ipa || '',
            origin: entry.origin || '',
            audioUrl: entry.audio_url || undefined,
            colorCombo: entry.color_combo as 1 | 2 | 3 | 4,
            slug: entry.slug || undefined,
            definitions: entryDefinitions
          };
        })
        .sort((a, b) => a.word.toLowerCase().localeCompare(b.word.toLowerCase()));

      // Assign color combos in sequence after alphabetical sorting
      const entriesWithColors = assignColorCombos(transformedEntries);

      const dictionaryData: DictionaryData = {
        title: dictionary.title,
        description: dictionary.description || '',
        entries: entriesWithColors
      };

      console.log('Final dictionary data with manually joined data:', dictionaryData);
      setData(dictionaryData);
      
      // Migrate from localStorage if this is the first load and no entries exist
      if (transformedEntries.length === 0) {
        await migrateFromLocalStorage(dictionaryData);
      }
    } catch (error: any) {
      console.error('Error loading dictionary:', error);
      toast({
        title: "Error loading dictionary",
        description: `Failed to load dictionary data: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Migrate existing localStorage data to Supabase
  const migrateFromLocalStorage = async (currentData: DictionaryData) => {
    const savedData = localStorage.getItem('lucas-dictionary');
    if (!savedData) return;

    try {
      const localData: DictionaryData = JSON.parse(savedData);
      if (localData.entries && localData.entries.length > 0) {
        console.log('Migrating data from localStorage to Supabase...');
        
        // Convert old string IDs to proper UUIDs and sort alphabetically
        const migratedData: DictionaryData = {
          title: localData.title || currentData.title,
          description: localData.description || currentData.description,
          entries: localData.entries
            .map(entry => ({
              ...entry,
              id: generateUUID(), // Generate new UUID for migration
              definitions: entry.definitions.map(def => ({
                ...def,
                id: generateUUID() // Generate new UUID for migration
              }))
            }))
            .sort((a, b) => a.word.toLowerCase().localeCompare(b.word.toLowerCase()))
        };
        
        // Assign color combos in sequence after sorting
        migratedData.entries = assignColorCombos(migratedData.entries);
        
        await saveData(migratedData);
        localStorage.removeItem('lucas-dictionary');
        toast({
          title: "Data migrated",
          description: "Your dictionary has been moved to the cloud for sharing",
        });
      }
    } catch (error: any) {
      console.error('Error migrating from localStorage:', error);
      toast({
        title: "Migration failed",
        description: `Could not migrate local data: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  // FIXED: Save dictionary data with proper ID preservation
  const saveData = async (newData: DictionaryData) => {
    try {
      console.log('Saving dictionary data with ID preservation:', newData);

      // Sort entries alphabetically and assign color combos before saving
      const sortedData: DictionaryData = {
        ...newData,
        entries: assignColorCombos([...newData.entries].sort((a, b) => a.word.toLowerCase().localeCompare(b.word.toLowerCase())))
      };

      // Update dictionary metadata
      const { error: dictError } = await supabase
        .from('dictionaries')
        .update({
          title: sortedData.title,
          description: sortedData.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', DICTIONARY_ID);

      if (dictError) {
        console.error('Error updating dictionary metadata:', dictError);
        throw dictError;
      }

      // Get existing entries to understand what's in the database
      const { data: existingEntries, error: existingError } = await supabase
        .from('dictionary_entries')
        .select(`
          id, word, slug,
          definitions (id, grammatical_class, meaning, example)
        `)
        .eq('dictionary_id', DICTIONARY_ID);

      if (existingError) {
        console.error('Error fetching existing entries:', existingError);
        throw existingError;
      }

      // Create maps for efficient lookup - use ID as primary key
      const existingEntriesById = new Map(existingEntries?.map(entry => [entry.id, entry]) || []);
      const existingEntriesBySlug = new Map(existingEntries?.map(entry => [entry.slug, entry]) || []);

      // Process each entry in the sorted data
      for (let i = 0; i < sortedData.entries.length; i++) {
        const entry = sortedData.entries[i];
        let existingEntry = null;
        let entryId = entry.id;
        
        // First try to find by ID (most reliable)
        if (entry.id && existingEntriesById.has(entry.id)) {
          existingEntry = existingEntriesById.get(entry.id);
          console.log(`Found existing entry by ID: ${entry.word} (${entry.id})`);
        }
        // If not found by ID, try by slug as fallback
        else if (entry.slug && existingEntriesBySlug.has(entry.slug)) {
          existingEntry = existingEntriesBySlug.get(entry.slug);
          entryId = existingEntry.id; // Use the database ID
          console.log(`Found existing entry by slug: ${entry.word} (${entry.slug}) -> ID: ${entryId}`);
        }

        if (existingEntry) {
          // Update existing entry - PRESERVE the database ID
          console.log(`Updating existing entry: ${entry.word} with preserved ID: ${entryId}`);
          
          const { error: entryError } = await supabase
            .from('dictionary_entries')
            .update({
              word: entry.word,
              ipa: entry.ipa,
              origin: entry.origin,
              audio_url: entry.audioUrl,
              color_combo: entry.colorCombo,
              position: i,
              slug: entry.slug // Update slug if provided
            })
            .eq('id', entryId);

          if (entryError) {
            console.error('Error updating entry:', entryError);
            throw entryError;
          }
        } else {
          // Create new entry - generate new ID only for truly new entries
          if (!entry.id || !entry.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            entryId = generateUUID();
          }
          
          console.log(`Creating new entry: ${entry.word} with ID: ${entryId}`);
          
          const { error: entryError } = await supabase
            .from('dictionary_entries')
            .insert({
              id: entryId,
              dictionary_id: DICTIONARY_ID,
              word: entry.word,
              ipa: entry.ipa,
              origin: entry.origin,
              audio_url: entry.audioUrl,
              color_combo: entry.colorCombo,
              position: i,
              slug: entry.slug // Slug will be auto-generated by trigger if not provided
            });

          if (entryError) {
            console.error('Error inserting entry:', entryError);
            throw entryError;
          }
        }

        // Handle definitions with proper ID preservation
        const existingDefinitions = existingEntry?.definitions || [];
        const existingDefsById = new Map(existingDefinitions.map(def => [def.id, def]));

        // Delete definitions that no longer exist
        if (existingDefinitions.length > 0) {
          const currentDefIds = entry.definitions
            .filter(def => def.id && def.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i))
            .map(def => def.id);
          
          const defsToDelete = existingDefinitions
            .filter(def => !currentDefIds.includes(def.id))
            .map(def => def.id);
          
          if (defsToDelete.length > 0) {
            console.log(`Deleting ${defsToDelete.length} outdated definitions`);
            const { error: deleteDefError } = await supabase
              .from('definitions')
              .delete()
              .in('id', defsToDelete);

            if (deleteDefError) {
              console.error('Error deleting outdated definitions:', deleteDefError);
              throw deleteDefError;
            }
          }
        }

        // Update or insert definitions with ID preservation
        for (let j = 0; j < entry.definitions.length; j++) {
          const definition = entry.definitions[j];
          
          if (definition.id && existingDefsById.has(definition.id)) {
            // Update existing definition - PRESERVE the database ID
            console.log(`Updating existing definition: ${definition.meaning} (ID: ${definition.id})`);
            
            const { error: defError } = await supabase
              .from('definitions')
              .update({
                grammatical_class: definition.grammaticalClass,
                meaning: definition.meaning,
                example: definition.example,
                position: j
              })
              .eq('id', definition.id);

            if (defError) {
              console.error('Error updating definition:', defError);
              throw defError;
            }
          } else {
            // Create new definition
            const definitionId = definition.id && definition.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
              ? definition.id
              : generateUUID();
            
            console.log(`Creating new definition: ${definition.meaning} (ID: ${definitionId})`);
            
            const { error: defError } = await supabase
              .from('definitions')
              .insert({
                id: definitionId,
                entry_id: entryId,
                grammatical_class: definition.grammaticalClass,
                meaning: definition.meaning,
                example: definition.example,
                position: j
              });

            if (defError) {
              console.error('Error inserting definition:', defError);
              throw defError;
            }
          }
        }
      }

      // Delete entries that no longer exist
      const currentEntryIds = sortedData.entries
        .filter(entry => entry.id && entry.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i))
        .map(entry => entry.id);
      
      const entriesToDelete = (existingEntries || [])
        .filter(entry => !currentEntryIds.includes(entry.id))
        .map(entry => entry.id);

      if (entriesToDelete.length > 0) {
        console.log(`Deleting ${entriesToDelete.length} outdated entries`);
        const { error: deleteError } = await supabase
          .from('dictionary_entries')
          .delete()
          .in('id', entriesToDelete);

        if (deleteError) {
          console.error('Error deleting outdated entries:', deleteError);
          throw deleteError;
        }
      }

      console.log('Dictionary data saved successfully with all IDs preserved!');
      toast({
        title: "Changes saved",
        description: "Dictionary updated successfully with all translations preserved",
      });

      // Reload data to reflect changes
      await loadData();

    } catch (error: any) {
      console.error('Error saving dictionary:', error);
      toast({
        title: "Error saving changes",
        description: `Failed to save dictionary data: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  return {
    data,
    loading,
    saveData,
    refetch: loadData
  };
};
