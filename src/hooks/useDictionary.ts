
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DictionaryData, DictionaryEntry, Definition } from '@/types/dictionary';
import { useToast } from '@/hooks/use-toast';

const DICTIONARY_ID = '00000000-0000-0000-0000-000000000001';

export const useDictionary = () => {
  const [data, setData] = useState<DictionaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load dictionary data from Supabase
  const loadData = async () => {
    try {
      // Get dictionary metadata
      const { data: dictionary, error: dictError } = await supabase
        .from('dictionaries')
        .select('*')
        .eq('id', DICTIONARY_ID)
        .single();

      if (dictError) throw dictError;

      // Get dictionary entries with definitions
      const { data: entries, error: entriesError } = await supabase
        .from('dictionary_entries')
        .select(`
          *,
          definitions (*)
        `)
        .eq('dictionary_id', DICTIONARY_ID)
        .order('position');

      if (entriesError) throw entriesError;

      // Transform the data to match our existing format
      const transformedEntries: DictionaryEntry[] = entries.map(entry => ({
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
      }));

      const dictionaryData: DictionaryData = {
        title: dictionary.title,
        description: dictionary.description || '',
        entries: transformedEntries
      };

      setData(dictionaryData);
      
      // Migrate from localStorage if this is the first load and no entries exist
      if (transformedEntries.length === 0) {
        await migrateFromLocalStorage(dictionaryData);
      }
    } catch (error) {
      console.error('Error loading dictionary:', error);
      toast({
        title: "Error loading dictionary",
        description: "Failed to load dictionary data from server",
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
        await saveData({
          title: localData.title || currentData.title,
          description: localData.description || currentData.description,
          entries: localData.entries
        });
        localStorage.removeItem('lucas-dictionary');
        toast({
          title: "Data migrated",
          description: "Your dictionary has been moved to the cloud for sharing",
        });
      }
    } catch (error) {
      console.error('Error migrating from localStorage:', error);
    }
  };

  // Save dictionary data to Supabase
  const saveData = async (newData: DictionaryData) => {
    try {
      // Update dictionary metadata
      const { error: dictError } = await supabase
        .from('dictionaries')
        .update({
          title: newData.title,
          description: newData.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', DICTIONARY_ID);

      if (dictError) throw dictError;

      // Delete existing entries and definitions
      const { error: deleteError } = await supabase
        .from('dictionary_entries')
        .delete()
        .eq('dictionary_id', DICTIONARY_ID);

      if (deleteError) throw deleteError;

      // Insert new entries and definitions
      for (let i = 0; i < newData.entries.length; i++) {
        const entry = newData.entries[i];
        
        // Insert entry
        const { data: insertedEntry, error: entryError } = await supabase
          .from('dictionary_entries')
          .insert({
            id: entry.id,
            dictionary_id: DICTIONARY_ID,
            word: entry.word,
            ipa: entry.ipa,
            origin: entry.origin,
            audio_url: entry.audioUrl,
            color_combo: entry.colorCombo,
            position: i
          })
          .select()
          .single();

        if (entryError) throw entryError;

        // Insert definitions
        for (let j = 0; j < entry.definitions.length; j++) {
          const definition = entry.definitions[j];
          const { error: defError } = await supabase
            .from('definitions')
            .insert({
              id: definition.id,
              entry_id: entry.id,
              grammatical_class: definition.grammaticalClass,
              meaning: definition.meaning,
              example: definition.example,
              position: j
            });

          if (defError) throw defError;
        }
      }

      toast({
        title: "Changes saved",
        description: "Dictionary updated successfully",
      });

    } catch (error) {
      console.error('Error saving dictionary:', error);
      toast({
        title: "Error saving changes",
        description: "Failed to save dictionary data",
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
