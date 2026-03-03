
CREATE TABLE public.daily_message_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, usage_date)
);

ALTER TABLE public.daily_message_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily usage"
ON public.daily_message_usage
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily usage"
ON public.daily_message_usage
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily usage"
ON public.daily_message_usage
FOR UPDATE
USING (auth.uid() = user_id);

CREATE TRIGGER update_daily_message_usage_updated_at
BEFORE UPDATE ON public.daily_message_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
