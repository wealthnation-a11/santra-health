
-- Create user_memory table for AI cross-conversation context
CREATE TABLE public.user_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  memory_text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  source_conversation_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own memories"
ON public.user_memory FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own memories"
ON public.user_memory FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories"
ON public.user_memory FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories"
ON public.user_memory FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Index for fast lookup by user
CREATE INDEX idx_user_memory_user_id ON public.user_memory(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_memory_updated_at
BEFORE UPDATE ON public.user_memory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
