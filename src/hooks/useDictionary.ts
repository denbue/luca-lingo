
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DictionaryData, DictionaryEntry, Definition } from '@/types/dictionary';
import { useToast } from '@/hooks/use-toast';

const DICTIONARY_ID = '00000000-0000-0000-0000-000000000001';

// Helper function to generate proper UUIDs
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

      // Get dictionary entries with definitions
      const { data: entries, error: entriesError } = await supabase
        .from('dictionary_entries')
        .select(`
          *,
          definitions (*)
        `)
        .eq('dictionary_id', DICTIONARY_ID)
        .order('word'); // Order alphabetically by word

      if (entriesError) {
        console.error('Error loading dictionary entries:', entriesError);
        throw entriesError;
      }

      console.log('Dictionary entries loaded:', entries);

      // Transform the data to match our existing format and sort alphabetically
      const transformedEntries: DictionaryEntry[] = entries
        .map(entry => ({
          id: entry.id as string,
          word: entry.word,
          ipa: entry.ipa || '',
          origin: entry.origin || '',
          audioUrl: entry.audio_url || undefined,
          colorCombo: entry.color_combo as 1 | 2 | 3 | 4,
          definitions: entry.definitions
            .sort((a: any, b: any) => a.position - b.position)
            .map((def: any) => ({
              id: def.id as string,
              grammaticalClass: def.grammatical_class,
              meaning: def.meaning,
              example: def.example || undefined
            }))
        }))
        .sort((a, b) => a.word.toLowerCase().localeCompare(b.word.toLowerCase())); // Sort alphabetically

      // Assign color combos in sequence after alphabetical sorting
      const entriesWithColors = assignColorCombos(transformedEntries);

      const dictionaryData: DictionaryData = {
        title: dictionary.title,
        description: dictionary.description || '',
        entries: entriesWithColors
      };

      console.log('Final dictionary data:', dictionaryData);
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
              id: generateUUID(), // Generate new UUID
              definitions: entry.definitions.map(def => ({
                ...def,
                id: generateUUID() // Generate new UUID
              }))
            }))
            .sort((a, b) => a.word.toLowerCase().localeCompare(b.word.toLowerCase())) // Sort alphabetically
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

  // Save dictionary data to Supabase - FIXED VERSION THAT PRESERVES TRANSLATIONS
  const saveData = async (newData: DictionaryData) => {
    try {
      console.log('Saving dictionary data to Supabase:', newData);

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

      // Get existing entries to preserve IDs and maintain translation relationships
      const { data: existingEntries, error: existingError } = await supabase
        .from('dictionary_entries')
        .select(`
          id, word,
          definitions (id, grammatical_class, meaning, example)
        `)
        .eq('dictionary_id', DICTIONARY_ID);

      if (existingError) {
        console.error('Error fetching existing entries:', existingError);
        throw existingError;
      }

      const existingEntriesMap = new Map(existingEntries?.map(entry => [entry.word.toLowerCase(), entry]) || []);

      // Process each entry - update existing or create new
      for (let i = 0; i < sortedData.entries.length; i++) {
        const entry = sortedData.entries[i];
        const existingEntry = existingEntriesMap.get(entry.word.toLowerCase());
        
        let entryId = entry.id;
        
        if (existingEntry) {
          // Update existing entry (preserve ID to maintain translations)
          entryId = existingEntry.id;
          console.log(`Updating existing entry: ${entry.word} with ID: ${entryId}`);
          
          const { error: entryError } = await supabase
            .from('dictionary_entries')
            .update({
              word: entry.word,
              ipa: entry.ipa,
              origin: entry.origin,
              audio_url: entry.audioUrl,
              color_combo: entry.colorCombo,
              position: i
            })
            .eq('id', entryId);

          if (entryError) {
            console.error('Error updating entry:', entryError);
            throw entryError;
          }
        } else {
          // Create new entry
          console.log(`Creating new entry: ${entry.word}`);
          
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
              position: i
            });

          if (entryError) {
            console.error('Error inserting entry:', entryError);
            throw entryError;
          }
        }

        // Handle definitions - preserve existing definition IDs where possible
        const existingDefinitions = existingEntry?.definitions || [];
        const existingDefsMap = new Map(existingDefinitions.map(def => [
          `${def.grammatical_class.toLowerCase()}_${def.meaning.toLowerCase()}`, def
        ]));

        // Delete definitions that no longer exist
        if (existingDefinitions.length > 0) {
          const currentDefKeys = entry.definitions.map(def => 
            `${def.grammaticalClass.toLowerCase()}_${def.meaning.toLowerCase()}`
          );
          const defsToDelete = existingDefinitions
            .filter(def => !currentDefKeys.includes(`${def.grammatical_class.toLowerCase()}_${def.meaning.toLowerCase()}`))
            .map(def => def.id);
          
          if (defsToDelete.length > 0) {
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

        // Update or insert definitions
        for (let j = 0; j < entry.definitions.length; j++) {
          const definition = entry.definitions[j];
          const defKey = `${definition.grammaticalClass.toLowerCase()}_${definition.meaning.toLowerCase()}`;
          const existingDef = existingDefsMap.get(defKey);

          if (existingDef) {
            // Update existing definition (preserve ID to maintain translations)
            console.log(`Updating existing definition: ${definition.meaning}`);
            
            const { error: defError } = await supabase
              .from('definitions')
              .update({
                grammatical_class: definition.grammaticalClass,
                meaning: definition.meaning,
                example: definition.example,
                position: j
              })
              .eq('id', existingDef.id);

            if (defError) {
              console.error('Error updating definition:', defError);
              throw defError;
            }
          } else {
            // Create new definition
            console.log(`Creating new definition: ${definition.meaning}`);
            
            const definitionId = definition.id && definition.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
              ? definition.id
              : generateUUID();
            
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
      const currentWords = sortedData.entries.map(entry => entry.word.toLowerCase());
      const entriesToDelete = (existingEntries || [])
        .filter(entry => !currentWords.includes(entry.word.toLowerCase()))
        .map(entry => entry.id);

      if (entriesToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('dictionary_entries')
          .delete()
          .in('id', entriesToDelete);

        if (deleteError) {
          console.error('Error deleting outdated entries:', deleteError);
          throw deleteError;
        }
      }

      console.log('Dictionary data saved successfully with translations preserved!');
      toast({
        title: "Changes saved",
        description: "Dictionary updated successfully with translations preserved",
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
