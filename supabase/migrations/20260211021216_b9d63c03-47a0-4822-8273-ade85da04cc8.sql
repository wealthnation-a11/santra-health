
-- Create health_profiles table
CREATE TABLE public.health_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  allergies TEXT[] DEFAULT '{}',
  conditions TEXT[] DEFAULT '{}',
  medications TEXT[] DEFAULT '{}',
  blood_type TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.health_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own health profile"
ON public.health_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health profile"
ON public.health_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health profile"
ON public.health_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health profile"
ON public.health_profiles FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_health_profiles_updated_at
BEFORE UPDATE ON public.health_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
