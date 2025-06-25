
-- Create dictionaries table for metadata
CREATE TABLE public.dictionaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create dictionary_entries table
CREATE TABLE public.dictionary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dictionary_id UUID REFERENCES public.dictionaries(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  ipa TEXT,
  origin TEXT,
  audio_url TEXT, -- base64 encoded audio
  color_combo INTEGER CHECK (color_combo IN (1, 2, 3, 4)),
  position INTEGER DEFAULT 0, -- for ordering entries
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create definitions table
CREATE TABLE public.definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES public.dictionary_entries(id) ON DELETE CASCADE,
  grammatical_class TEXT NOT NULL,
  meaning TEXT NOT NULL,
  example TEXT,
  position INTEGER DEFAULT 0, -- for ordering definitions within an entry
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security (RLS) for public access
ALTER TABLE public.dictionaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dictionary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.definitions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is for family sharing)
CREATE POLICY "Anyone can view dictionaries" ON public.dictionaries FOR SELECT USING (true);
CREATE POLICY "Anyone can insert dictionaries" ON public.dictionaries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update dictionaries" ON public.dictionaries FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete dictionaries" ON public.dictionaries FOR DELETE USING (true);

CREATE POLICY "Anyone can view dictionary_entries" ON public.dictionary_entries FOR SELECT USING (true);
CREATE POLICY "Anyone can insert dictionary_entries" ON public.dictionary_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update dictionary_entries" ON public.dictionary_entries FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete dictionary_entries" ON public.dictionary_entries FOR DELETE USING (true);

CREATE POLICY "Anyone can view definitions" ON public.definitions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert definitions" ON public.definitions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update definitions" ON public.definitions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete definitions" ON public.definitions FOR DELETE USING (true);

-- Enable real-time for live updates
ALTER TABLE public.dictionaries REPLICA IDENTITY FULL;
ALTER TABLE public.dictionary_entries REPLICA IDENTITY FULL;
ALTER TABLE public.definitions REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.dictionaries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dictionary_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.definitions;

-- Insert the current dictionary as the default one
INSERT INTO public.dictionaries (id, title, description) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Lucas Dictionary', 'A collection of words and their meanings for Lucas to learn and understand.');
