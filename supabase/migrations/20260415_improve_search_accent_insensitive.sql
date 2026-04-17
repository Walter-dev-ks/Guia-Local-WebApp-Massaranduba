-- Enable unaccent extension for accent-insensitive search
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Create helper function to normalize text (remove accents and convert to lowercase)
CREATE OR REPLACE FUNCTION normalize_text(text_input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT LOWER(unaccent(text_input));
$$;

-- Recreate search functions with accent-insensitive support
CREATE OR REPLACE FUNCTION search_businesses_fuzzy(search_term text)
RETURNS SETOF businesses
LANGUAGE sql STABLE
AS $$
  SELECT b.* FROM businesses b
  LEFT JOIN categories c ON b.category_id = c.id
  LEFT JOIN subcategories s ON b.subcategory_id = s.id
  WHERE b.active = true
    AND (
      normalize_text(b.trade_name) % normalize_text(search_term)
      OR normalize_text(b.trade_name) ILIKE '%' || normalize_text(search_term) || '%'
      OR normalize_text(b.description) ILIKE '%' || normalize_text(search_term) || '%'
      OR normalize_text(b.address) ILIKE '%' || normalize_text(search_term) || '%'
      OR normalize_text(c.name) % normalize_text(search_term)
      OR normalize_text(c.name) ILIKE '%' || normalize_text(search_term) || '%'
      OR normalize_text(s.name) % normalize_text(search_term)
      OR normalize_text(s.name) ILIKE '%' || normalize_text(search_term) || '%'
    )
  ORDER BY
    GREATEST(
      similarity(normalize_text(b.trade_name), normalize_text(search_term)),
      similarity(COALESCE(normalize_text(c.name), ''), normalize_text(search_term)),
      similarity(COALESCE(normalize_text(s.name), ''), normalize_text(search_term))
    ) DESC;
$$;

CREATE OR REPLACE FUNCTION search_categories_fuzzy(search_term text)
RETURNS SETOF categories
LANGUAGE sql STABLE
AS $$
  SELECT * FROM categories
  WHERE normalize_text(name) % normalize_text(search_term) 
    OR normalize_text(name) ILIKE '%' || normalize_text(search_term) || '%'
  ORDER BY similarity(normalize_text(name), normalize_text(search_term)) DESC;
$$;

CREATE OR REPLACE FUNCTION search_subcategories_fuzzy(search_term text)
RETURNS SETOF subcategories
LANGUAGE sql STABLE
AS $$
  SELECT * FROM subcategories
  WHERE normalize_text(name) % normalize_text(search_term) 
    OR normalize_text(name) ILIKE '%' || normalize_text(search_term) || '%'
  ORDER BY similarity(normalize_text(name), normalize_text(search_term)) DESC;
$$;
