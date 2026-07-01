
-- 1. blocked_signups: remove public INSERT policy (now handled by edge function with service role)
DROP POLICY IF EXISTS "Anyone can log blocked signup" ON public.blocked_signups;

-- 2. profiles: prevent non-admins from writing to admin-only columns via trigger
CREATE OR REPLACE FUNCTION public.profiles_block_admin_field_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  NEW.daily_message_limit_override := OLD.daily_message_limit_override;
  NEW.monthly_voice_limit_override := OLD.monthly_voice_limit_override;
  NEW.banned_at := OLD.banned_at;
  NEW.ban_reason := OLD.ban_reason;
  NEW.admin_notes := OLD.admin_notes;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_block_admin_fields ON public.profiles;
CREATE TRIGGER profiles_block_admin_fields
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.profiles_block_admin_field_updates();

-- 3. subscriptions: remove user INSERT/UPDATE. Only service role (edge functions) may write.
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;

-- 4. storage lab-uploads: add explicit UPDATE policy scoped to owner folder
DROP POLICY IF EXISTS "Users can update their own lab files" ON storage.objects;
CREATE POLICY "Users can update their own lab files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'lab-uploads' AND (storage.foldername(name))[1] = (auth.uid())::text)
WITH CHECK (bucket_id = 'lab-uploads' AND (storage.foldername(name))[1] = (auth.uid())::text);

-- 5. realtime.messages: restrict Broadcast/Presence channel access.
-- App uses Postgres Changes (governed by public.messages RLS), so lock down realtime.messages channels.
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Deny realtime broadcast/presence by default" ON realtime.messages;
CREATE POLICY "Deny realtime broadcast/presence by default"
ON realtime.messages
FOR SELECT
TO authenticated
USING (false);

-- 6. SECURITY DEFINER function exposure: revoke from PUBLIC/anon; keep authenticated only where needed.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef = true
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %I.%I(%s) FROM PUBLIC, anon;', r.nspname, r.proname, r.args);
  END LOOP;
END $$;

-- Trigger-only functions: no execute grants needed
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM authenticated;
REVOKE ALL ON FUNCTION public.profiles_block_admin_field_updates() FROM PUBLIC, anon, authenticated;
