
CREATE OR REPLACE FUNCTION public.update_profile_review_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _count integer;
  _badge text;
BEGIN
  SELECT COUNT(*) INTO _count FROM public.reviews WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);
  
  IF _count <= 10 THEN _badge := 'Iniciante';
  ELSIF _count <= 25 THEN _badge := 'Explorador';
  ELSIF _count <= 50 THEN _badge := 'Avaliador';
  ELSIF _count <= 100 THEN _badge := 'Expert';
  ELSIF _count <= 250 THEN _badge := 'Mestre';
  ELSE _badge := 'Crítico Renomado';
  END IF;

  UPDATE public.profiles SET
    review_count = _count,
    reviewer_badge = _badge
  WHERE id = COALESCE(NEW.user_id, OLD.user_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;
