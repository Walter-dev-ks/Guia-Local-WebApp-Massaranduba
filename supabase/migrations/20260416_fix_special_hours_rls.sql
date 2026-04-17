-- Ensure special_hours column exists and fix RLS policies if needed
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS special_hours JSONB NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_businesses_special_hours ON public.businesses USING GIN (special_hours);

-- Recreate RLS policies to refresh policy state for the updated schema
DROP POLICY IF EXISTS "Businesses are viewable by everyone" ON public.businesses;
DROP POLICY IF EXISTS "Admins can manage businesses" ON public.businesses;

CREATE POLICY "Businesses are viewable by everyone" ON public.businesses
  FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage businesses" ON public.businesses
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));
