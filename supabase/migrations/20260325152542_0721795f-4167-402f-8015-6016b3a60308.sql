-- Add reviewer_badge and review_count to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reviewer_badge text NOT NULL DEFAULT 'Iniciante';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS review_count integer NOT NULL DEFAULT 0;

-- Change default approved to true for reviews and questions (auto-approve)
ALTER TABLE public.reviews ALTER COLUMN approved SET DEFAULT true;
ALTER TABLE public.questions ALTER COLUMN approved SET DEFAULT true;

-- Create function to update profile review_count
CREATE OR REPLACE FUNCTION public.update_profile_review_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles SET
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE user_id = COALESCE(NEW.user_id, OLD.user_id))
  WHERE id = COALESCE(NEW.user_id, OLD.user_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to update profile review_count on review insert/delete
DROP TRIGGER IF EXISTS on_review_update_profile_count ON public.reviews;
CREATE TRIGGER on_review_update_profile_count
AFTER INSERT OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_profile_review_count();