
-- Chat Branching: add parent_message_id to messages
ALTER TABLE public.messages
ADD COLUMN parent_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL DEFAULT NULL;

-- Index for branch lookups
CREATE INDEX idx_messages_parent ON public.messages(parent_message_id);

-- Pinned Messages table
CREATE TABLE public.pinned_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, message_id)
);

ALTER TABLE public.pinned_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pins"
ON public.pinned_messages FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pins"
ON public.pinned_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pins"
ON public.pinned_messages FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX idx_pinned_messages_conversation ON public.pinned_messages(conversation_id);
