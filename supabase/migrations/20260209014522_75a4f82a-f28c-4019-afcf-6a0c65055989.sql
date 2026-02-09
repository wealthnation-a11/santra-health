-- Add state column to profiles table
ALTER TABLE public.profiles ADD COLUMN state text;

-- Add library_id column to conversations table
-- NULL = general "New Chat", otherwise contains library identifier
ALTER TABLE public.conversations ADD COLUMN library_id text;

-- Create index for library conversations lookup
CREATE INDEX idx_conversations_library ON public.conversations(user_id, library_id);