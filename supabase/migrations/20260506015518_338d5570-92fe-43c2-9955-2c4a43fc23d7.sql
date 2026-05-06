
-- App-wide settings (feature toggles, limits, broadcast banner, maintenance mode)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings (needed for banner/maintenance check on every page)
CREATE POLICY "Public can read app settings"
ON public.app_settings FOR SELECT TO public USING (true);

CREATE POLICY "Admins can insert app settings"
ON public.app_settings FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update app settings"
ON public.app_settings FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete app settings"
ON public.app_settings FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Seed defaults
INSERT INTO public.app_settings (key, value) VALUES
  ('broadcast_banner', '{"enabled": false, "message": "", "variant": "info"}'::jsonb),
  ('maintenance_mode', '{"enabled": false, "message": "Santra is undergoing brief maintenance. Please check back soon."}'::jsonb),
  ('feature_flags', '{"voice_input": true, "lab_interpreter": true, "tools": true, "libraries": true}'::jsonb),
  ('limits', '{"free_daily_messages": 15, "free_monthly_voice": 10}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Admin audit log
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  target_id text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit log"
ON public.admin_audit_log FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Banned users tracking on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ban_reason text;

-- RPC: update app setting (admin only)
CREATE OR REPLACE FUNCTION public.admin_set_setting(_key text, _value jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  INSERT INTO public.app_settings (key, value, updated_by, updated_at)
  VALUES (_key, _value, auth.uid(), now())
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = auth.uid(), updated_at = now();
  INSERT INTO public.admin_audit_log (admin_id, action, target_id, details)
  VALUES (auth.uid(), 'set_setting', _key, _value);
END;
$$;

-- RPC: grant role
CREATE OR REPLACE FUNCTION public.admin_grant_role(_user_id uuid, _role app_role)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, _role) ON CONFLICT DO NOTHING;
  INSERT INTO public.admin_audit_log (admin_id, action, target_id, details)
  VALUES (auth.uid(), 'grant_role', _user_id::text, jsonb_build_object('role', _role));
END;
$$;

-- RPC: revoke role
CREATE OR REPLACE FUNCTION public.admin_revoke_role(_user_id uuid, _role app_role)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  DELETE FROM public.user_roles WHERE user_id = _user_id AND role = _role;
  INSERT INTO public.admin_audit_log (admin_id, action, target_id, details)
  VALUES (auth.uid(), 'revoke_role', _user_id::text, jsonb_build_object('role', _role));
END;
$$;

-- RPC: ban user
CREATE OR REPLACE FUNCTION public.admin_ban_user(_user_id uuid, _reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  UPDATE public.profiles SET banned_at = now(), ban_reason = _reason WHERE id = _user_id;
  INSERT INTO public.admin_audit_log (admin_id, action, target_id, details)
  VALUES (auth.uid(), 'ban_user', _user_id::text, jsonb_build_object('reason', _reason));
END;
$$;

-- RPC: unban user
CREATE OR REPLACE FUNCTION public.admin_unban_user(_user_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  UPDATE public.profiles SET banned_at = NULL, ban_reason = NULL WHERE id = _user_id;
  INSERT INTO public.admin_audit_log (admin_id, action, target_id)
  VALUES (auth.uid(), 'unban_user', _user_id::text);
END;
$$;

-- RPC: set subscription (manual upgrade/downgrade/grant)
CREATE OR REPLACE FUNCTION public.admin_set_subscription(_user_id uuid, _plan_type text, _plan text, _status text DEFAULT 'active')
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  INSERT INTO public.subscriptions (user_id, plan_type, plan, status)
  VALUES (_user_id, _plan_type, _plan, _status)
  ON CONFLICT (user_id, plan_type) DO UPDATE SET plan = EXCLUDED.plan, status = EXCLUDED.status, updated_at = now();
  INSERT INTO public.admin_audit_log (admin_id, action, target_id, details)
  VALUES (auth.uid(), 'set_subscription', _user_id::text, jsonb_build_object('plan_type', _plan_type, 'plan', _plan, 'status', _status));
EXCEPTION WHEN OTHERS THEN
  -- fall back if no unique constraint
  UPDATE public.subscriptions SET plan = _plan, status = _status, updated_at = now()
  WHERE user_id = _user_id AND plan_type = _plan_type;
  IF NOT FOUND THEN
    INSERT INTO public.subscriptions (user_id, plan_type, plan, status) VALUES (_user_id, _plan_type, _plan, _status);
  END IF;
END;
$$;

-- RPC: delete conversation
CREATE OR REPLACE FUNCTION public.admin_delete_conversation(_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  DELETE FROM public.messages WHERE conversation_id = _conversation_id;
  DELETE FROM public.conversations WHERE id = _conversation_id;
  INSERT INTO public.admin_audit_log (admin_id, action, target_id)
  VALUES (auth.uid(), 'delete_conversation', _conversation_id::text);
END;
$$;

-- RPC: list audit log
CREATE OR REPLACE FUNCTION public.admin_list_audit_log(_limit int DEFAULT 100)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  RETURN COALESCE((
    SELECT jsonb_agg(row_to_json(a)) FROM (
      SELECT al.id, al.admin_id, al.action, al.target_id, al.details, al.created_at,
             p.full_name as admin_name
      FROM public.admin_audit_log al
      LEFT JOIN public.profiles p ON p.id = al.admin_id
      ORDER BY al.created_at DESC LIMIT _limit
    ) a
  ), '[]'::jsonb);
END;
$$;

-- Conversations: allow admins to view all (for moderation listing via direct table reads)
CREATE POLICY "Admins can view all conversations"
ON public.conversations FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all messages"
ON public.messages FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
