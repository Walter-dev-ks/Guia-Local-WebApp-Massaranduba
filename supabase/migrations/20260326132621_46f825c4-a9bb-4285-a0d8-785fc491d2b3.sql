
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION search_businesses_fuzzy(search_term text)
RETURNS SETOF businesses
LANGUAGE sql STABLE
AS $$
  SELECT b.* FROM businesses b
  LEFT JOIN categories c ON b.category_id = c.id
  LEFT JOIN subcategories s ON b.subcategory_id = s.id
  WHERE b.active = true
    AND (
      b.trade_name % search_term
      OR b.trade_name ILIKE '%' || search_term || '%'
      OR b.description ILIKE '%' || search_term || '%'
      OR b.address ILIKE '%' || search_term || '%'
      OR c.name % search_term
      OR c.name ILIKE '%' || search_term || '%'
      OR s.name % search_term
      OR s.name ILIKE '%' || search_term || '%'
    )
  ORDER BY
    GREATEST(
      similarity(b.trade_name, search_term),
      similarity(COALESCE(c.name, ''), search_term),
      similarity(COALESCE(s.name, ''), search_term)
    ) DESC;
$$;

CREATE OR REPLACE FUNCTION search_categories_fuzzy(search_term text)
RETURNS SETOF categories
LANGUAGE sql STABLE
AS $$
  SELECT * FROM categories
  WHERE name % search_term OR name ILIKE '%' || search_term || '%'
  ORDER BY similarity(name, search_term) DESC;
$$;

CREATE OR REPLACE FUNCTION search_subcategories_fuzzy(search_term text)
RETURNS SETOF subcategories
LANGUAGE sql STABLE
AS $$
  SELECT * FROM subcategories
  WHERE name % search_term OR name ILIKE '%' || search_term || '%'
  ORDER BY similarity(name, search_term) DESC;
$$;
