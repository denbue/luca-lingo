
-- Create translations table for dictionary metadata
CREATE TABLE public.dictionary_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dictionary_id UUID REFERENCES public.dictionaries(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('de', 'pt')),
  title TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(dictionary_id, language)
);

-- Create translations table for entry definitions and origins
CREATE TABLE public.entry_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES public.dictionary_entries(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('de', 'pt')),
  origin TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(entry_id, language)
);

-- Create translations table for individual definitions
CREATE TABLE public.definition_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  definition_id UUID REFERENCES public.definitions(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('de', 'pt')),
  grammatical_class TEXT,
  meaning TEXT,
  example TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(definition_id, language)
);

-- Enable Row Level Security for all translation tables
ALTER TABLE public.dictionary_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entry_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.definition_translations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (matching the existing dictionary tables)
CREATE POLICY "Anyone can view dictionary_translations" ON public.dictionary_translations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert dictionary_translations" ON public.dictionary_translations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update dictionary_translations" ON public.dictionary_translations FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete dictionary_translations" ON public.dictionary_translations FOR DELETE USING (true);

CREATE POLICY "Anyone can view entry_translations" ON public.entry_translations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert entry_translations" ON public.entry_translations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update entry_translations" ON public.entry_translations FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete entry_translations" ON public.entry_translations FOR DELETE USING (true);

CREATE POLICY "Anyone can view definition_translations" ON public.definition_translations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert definition_translations" ON public.definition_translations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update definition_translations" ON public.definition_translations FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete definition_translations" ON public.definition_translations FOR DELETE USING (true);

-- Enable real-time for live updates
ALTER TABLE public.dictionary_translations REPLICA IDENTITY FULL;
ALTER TABLE public.entry_translations REPLICA IDENTITY FULL;
ALTER TABLE public.definition_translations REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.dictionary_translations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.entry_translations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.definition_translations;
