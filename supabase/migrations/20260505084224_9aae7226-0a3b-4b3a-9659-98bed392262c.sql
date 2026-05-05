
-- Edu Pro waitlist table
CREATE TABLE public.edu_pro_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  user_id UUID,
  notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX edu_pro_waitlist_email_key ON public.edu_pro_waitlist (lower(email));
ALTER TABLE public.edu_pro_waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone (even anon) can join the waitlist
CREATE POLICY "Anyone can join waitlist"
ON public.edu_pro_waitlist FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view waitlist"
ON public.edu_pro_waitlist FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete waitlist"
ON public.edu_pro_waitlist FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Blocked signup attempts table
CREATE TABLE public.blocked_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  reason TEXT NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX blocked_signups_attempted_at_idx ON public.blocked_signups (attempted_at DESC);
ALTER TABLE public.blocked_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log blocked signup"
ON public.blocked_signups FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view blocked signups"
ON public.blocked_signups FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blocked signups"
ON public.blocked_signups FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));
