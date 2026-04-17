-- Improve search tolerance with Levenshtein distance for typo tolerance
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;

-- Create improved search functions with better tolerance
CREATE OR REPLACE FUNCTION search_businesses_fuzzy(search_term text)
RETURNS SETOF businesses
LANGUAGE sql STABLE
AS $$
  SELECT b.* FROM businesses b
  LEFT JOIN categories c ON b.category_id = c.id
  LEFT JOIN subcategories s ON b.subcategory_id = s.id
  WHERE b.active = true
    AND (
      -- Fuzzy match (substring match)
      normalize_text(b.trade_name) ILIKE '%' || normalize_text(search_term) || '%'
      OR normalize_text(b.description) ILIKE '%' || normalize_text(search_term) || '%'
      OR normalize_text(b.address) ILIKE '%' || normalize_text(search_term) || '%'
      OR normalize_text(c.name) ILIKE '%' || normalize_text(search_term) || '%'
      OR normalize_text(s.name) ILIKE '%' || normalize_text(search_term) || '%'
      -- Similarity match (typo tolerance with pg_trgm)
      OR similarity(normalize_text(b.trade_name), normalize_text(search_term)) > 0.2
      OR similarity(normalize_text(c.name), normalize_text(search_term)) > 0.2
      OR similarity(normalize_text(s.name), normalize_text(search_term)) > 0.2
      -- Levenshtein distance (allow 2 character differences)
      OR levenshtein(normalize_text(b.trade_name), normalize_text(search_term)) <= 2
      OR levenshtein(COALESCE(normalize_text(c.name), ''), normalize_text(search_term)) <= 2
      OR levenshtein(COALESCE(normalize_text(s.name), ''), normalize_text(search_term)) <= 2
    )
  ORDER BY
    GREATEST(
      CASE WHEN normalize_text(b.trade_name) ILIKE '%' || normalize_text(search_term) || '%' THEN 1.0 ELSE 0 END,
      similarity(normalize_text(b.trade_name), normalize_text(search_term)),
      CASE WHEN levenshtein(normalize_text(b.trade_name), normalize_text(search_term)) <= 2 THEN 0.8 - (levenshtein(normalize_text(b.trade_name), normalize_text(search_term)) * 0.1) ELSE 0 END
    ) DESC
  LIMIT 100;
$$;

CREATE OR REPLACE FUNCTION search_categories_fuzzy(search_term text)
RETURNS SETOF categories
LANGUAGE sql STABLE
AS $$
  SELECT * FROM categories
  WHERE normalize_text(name) ILIKE '%' || normalize_text(search_term) || '%'
    OR similarity(normalize_text(name), normalize_text(search_term)) > 0.2
    OR levenshtein(normalize_text(name), normalize_text(search_term)) <= 2
  ORDER BY
    GREATEST(
      CASE WHEN normalize_text(name) ILIKE '%' || normalize_text(search_term) || '%' THEN 1.0 ELSE 0 END,
      similarity(normalize_text(name), normalize_text(search_term)),
      CASE WHEN levenshtein(normalize_text(name), normalize_text(search_term)) <= 2 THEN 0.8 - (levenshtein(normalize_text(name), normalize_text(search_term)) * 0.1) ELSE 0 END
    ) DESC
  LIMIT 100;
$$;

CREATE OR REPLACE FUNCTION search_subcategories_fuzzy(search_term text)
RETURNS SETOF subcategories
LANGUAGE sql STABLE
AS $$
  SELECT * FROM subcategories
  WHERE normalize_text(name) ILIKE '%' || normalize_text(search_term) || '%'
    OR similarity(normalize_text(name), normalize_text(search_term)) > 0.2
    OR levenshtein(normalize_text(name), normalize_text(search_term)) <= 2
  ORDER BY
    GREATEST(
      CASE WHEN normalize_text(name) ILIKE '%' || normalize_text(search_term) || '%' THEN 1.0 ELSE 0 END,
      similarity(normalize_text(name), normalize_text(search_term)),
      CASE WHEN levenshtein(normalize_text(name), normalize_text(search_term)) <= 2 THEN 0.8 - (levenshtein(normalize_text(name), normalize_text(search_term)) * 0.1) ELSE 0 END
    ) DESC
  LIMIT 100;
$$;
