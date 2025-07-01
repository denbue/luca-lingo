
-- Add origin_label column to dictionary_translations table
ALTER TABLE public.dictionary_translations 
ADD COLUMN origin_label text;
