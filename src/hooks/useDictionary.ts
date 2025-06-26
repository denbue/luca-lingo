
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DictionaryData, DictionaryEntry, Definition } from '@/types/dictionary';
import { useToast } from '@/hooks/use-toast';

const DICTIONARY_ID = '00000000-0000-0000-0000-000000000001';

// Helper function to generate proper UUIDs
const generateUUID = () => {
  return crypto.randomUUID();
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
          id: entry.id,
          word: entry.word,
          ipa: entry.ipa || '',
          origin: entry.origin || '',
          audioUrl: entry.audio_url || undefined,
          colorCombo: entry.color_combo as 1 | 2 | 3 | 4,
          definitions: entry.definitions
            .sort((a: any, b: any) => a.position - b.position)
            .map((def: any) => ({
              id: def.id,
              grammaticalClass: def.grammatical_class,
              meaning: def.meaning,
              example: def.example || undefined
            }))
        }))
        .sort((a, b) => a.word.toLowerCase().localeCompare(b.word.toLowerCase())); // Sort alphabetically

      const dictionaryData: DictionaryData = {
        title: dictionary.title,
        description: dictionary.description || '',
        entries: transformedEntries
      };

      console.log('Final dictionary data:', dictionaryData);
      setData(dictionaryData);
      
      // Migrate from localStorage if this is the first load and no entries exist
      if (transformedEntries.length === 0) {
        await migrateFromLocalStorage(dictionaryData);
      }
    } catch (error) {
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
        const migratedData = {
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
        
        await saveData(migratedData);
        localStorage.removeItem('lucas-dictionary');
        toast({
          title: "Data migrated",
          description: "Your dictionary has been moved to the cloud for sharing",
        });
      }
    } catch (error) {
      console.error('Error migrating from localStorage:', error);
      toast({
        title: "Migration failed",
        description: `Could not migrate local data: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  // Save dictionary data to Supabase
  const saveData = async (newData: DictionaryData) => {
    try {
      console.log('Saving dictionary data to Supabase:', newData);

      // Sort entries alphabetically before saving
      const sortedData = {
        ...newData,
        entries: [...newData.entries].sort((a, b) => a.word.toLowerCase().localeCompare(b.word.toLowerCase()))
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

      // Delete existing entries and definitions
      const { error: deleteError } = await supabase
        .from('dictionary_entries')
        .delete()
        .eq('dictionary_id', DICTIONARY_ID);

      if (deleteError) {
        console.error('Error deleting existing entries:', deleteError);
        throw deleteError;
      }

      // Insert new entries and definitions
      for (let i = 0; i < sortedData.entries.length; i++) {
        const entry = sortedData.entries[i];
        
        // Ensure we have a proper UUID for the entry
        const entryId = entry.id && entry.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) 
          ? entry.id 
          : generateUUID();
        
        console.log('Inserting entry:', { ...entry, id: entryId });
        
        // Insert entry
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

        // Insert definitions
        for (let j = 0; j < entry.definitions.length; j++) {
          const definition = entry.definitions[j];
          
          // Ensure we have a proper UUID for the definition
          const definitionId = definition.id && definition.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
            ? definition.id
            : generateUUID();
          
          console.log('Inserting definition:', { ...definition, id: definitionId });
          
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

      console.log('Dictionary data saved successfully');
      toast({
        title: "Changes saved",
        description: "Dictionary updated successfully",
      });

      // Reload data to reflect changes
      await loadData();

    } catch (error) {
      console.error('Error saving dictionary:', error);
      toast({
        title: "Error saving changes",
        description: `Failed to save dictionary data: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    loadData();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('dictionary-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dictionaries'
        },
        () => {
          console.log('Dictionary metadata changed, reloading...');
          loadData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dictionary_entries'
        },
        () => {
          console.log('Dictionary entries changed, reloading...');
          loadData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'definitions'
        },
        () => {
          console.log('Definitions changed, reloading...');
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    data,
    loading,
    saveData,
    refetch: loadData
  };
};
