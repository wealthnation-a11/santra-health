ALTER TABLE public.subscriptions ADD COLUMN plan_type text NOT NULL DEFAULT 'chat';
UPDATE public.subscriptions SET plan_type = 'chat' WHERE plan_type = 'chat';
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_id_plan_type_key ON public.subscriptions (user_id, plan_type);