-- Add special_hours column to businesses table to store exceptions (holidays, special days)
-- Format: { "2024-12-25": { "open": "10:00", "close": "15:00", "closed": false, "reason": "Natal - Horário Especial" } }
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS special_hours JSONB NOT NULL DEFAULT '{}';

-- Create index for faster queries on special hours
CREATE INDEX IF NOT EXISTS idx_businesses_special_hours ON public.businesses USING GIN (special_hours);

-- Create helper function to check if business is open on a specific date
CREATE OR REPLACE FUNCTION is_business_open_on_date(
  business_hours JSONB,
  business_special_hours JSONB,
  check_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  date_str TEXT;
  special_day JSONB;
  day_name TEXT;
  day_hours JSONB;
  current_time TIME;
  open_time TIME;
  close_time TIME;
  is_closed BOOLEAN;
BEGIN
  date_str := TO_CHAR(check_date, 'YYYY-MM-DD');
  
  -- Check if there's a special hours entry for this date
  IF business_special_hours ? date_str THEN
    special_day := business_special_hours -> date_str;
    RETURN special_day;
  END IF;
  
  -- Otherwise, use regular weekly hours
  day_name := LOWER(TO_CHAR(check_date, 'Day'));
  day_name := TRIM(day_name);
  
  -- Map day names to the format used in hours (monday, tuesday, etc)
  day_name := CASE 
    WHEN day_name = 'sunday' THEN 'sunday'
    WHEN day_name = 'monday' THEN 'monday'
    WHEN day_name = 'tuesday' THEN 'tuesday'
    WHEN day_name = 'wednesday' THEN 'wednesday'
    WHEN day_name = 'thursday' THEN 'thursday'
    WHEN day_name = 'friday' THEN 'friday'
    WHEN day_name = 'saturday' THEN 'saturday'
    ELSE 'sunday'
  END;
  
  day_hours := business_hours -> day_name;
  RETURN day_hours;
END;
$$;

-- Create helper function to get status text for special hours
CREATE OR REPLACE FUNCTION get_business_status_text(
  business_hours JSONB,
  business_special_hours JSONB
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  today_date DATE;
  today_hours JSONB;
  is_closed BOOLEAN;
  has_special BOOLEAN;
BEGIN
  today_date := CURRENT_DATE;
  
  -- Check if today has special hours
  has_special := business_special_hours ? TO_CHAR(today_date, 'YYYY-MM-DD');
  
  today_hours := is_business_open_on_date(business_hours, business_special_hours, today_date);
  is_closed := COALESCE((today_hours ->> 'closed')::BOOLEAN, false);
  
  IF has_special AND NOT is_closed THEN
    RETURN 'Aberto em horário especial';
  ELSIF has_special AND is_closed THEN
    RETURN 'Fechado em horário especial';
  ELSIF is_closed THEN
    RETURN 'Fechado';
  ELSE
    RETURN 'Aberto';
  END IF;
END;
$$;
