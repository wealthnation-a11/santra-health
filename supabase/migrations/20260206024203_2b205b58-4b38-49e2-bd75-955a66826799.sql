-- Create message_feedback table for thumbs up/down ratings
CREATE TABLE public.message_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  feedback TEXT NOT NULL CHECK (feedback IN ('positive', 'negative')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Enable RLS
ALTER TABLE public.message_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own feedback"
  ON public.message_feedback
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feedback"
  ON public.message_feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
  ON public.message_feedback
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback"
  ON public.message_feedback
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add policies for messages table to allow updates and deletes (for edit/regenerate)
CREATE POLICY "Users can update messages in their conversations"
  ON public.messages
  FOR UPDATE
  USING (is_conversation_owner(conversation_id));

CREATE POLICY "Users can delete messages in their conversations"
  ON public.messages
  FOR DELETE
  USING (is_conversation_owner(conversation_id));