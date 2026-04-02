
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS read boolean NOT NULL DEFAULT false;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS read boolean NOT NULL DEFAULT false;
