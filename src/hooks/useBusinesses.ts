import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useBusinesses() {
  return useQuery({
    queryKey: ['businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*, categories(name, slug, icon), subcategories(name, slug)')
        .eq('active', true)
        .order('trade_name');
      if (error) throw error;
      return data;
    },
  });
}

export function useBusinessById(id: string) {
  return useQuery({
    queryKey: ['business', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*, categories(name, slug, icon), subcategories(name, slug)')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useBusinessesByCategory(categorySlug: string) {
  return useQuery({
      // Busca Inteligente (Full Text Search)
      if (searchTerm) {
        // Busca simultânea em Nome e Descrição
        query = query.textSearch('fts', searchTerm, {
          config: 'portuguese',
          type: 'plain'
        });
      } else {
        // Filtros normais (Aqui mantemos a lógica original de IDs)
        if (category) {
          query = query.eq('category_id', category); // Verifique se o campo é category_id
        }
        if (subcategory) {
          query = query.eq('subcategory_id', subcategory); // Verifique se o campo é subcategory_id
        }
      }
      return data;
    },
    enabled: !!categorySlug,
  });
}

export function useBusinessesBySubcategory(subcategorySlug: string) {
  return useQuery({
    queryKey: ['businesses', 'subcategory', subcategorySlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*, categories(name, slug, icon), subcategories!inner(name, slug)')
        .eq('subcategories.slug', subcategorySlug)
        .eq('active', true)
        .order('trade_name');
      if (error) throw error;
      return data;
    },
    enabled: !!subcategorySlug,
  });
}

export function useSearchBusinesses(query: string) {
  return useQuery({
    queryKey: ['businesses', 'search', query],
    queryFn: async () => {
      // Use fuzzy search RPC
      const { data: fuzzyResults, error: err1 } = await supabase
        .rpc('search_businesses_fuzzy', { search_term: query });
      if (err1) throw err1;

      // Fetch category/subcategory details for the results
      if (!fuzzyResults || fuzzyResults.length === 0) return [];

      const ids = fuzzyResults.map((b: any) => b.id);
      const { data, error } = await supabase
        .from('businesses')
        .select('*, categories(name, slug, icon), subcategories(name, slug)')
        .in('id', ids)
        .eq('active', true);
      if (error) throw error;

      // Preserve fuzzy ordering
      const map = new Map((data || []).map((b: any) => [b.id, b]));
      return ids.map((id: string) => map.get(id)).filter(Boolean);
    },
    enabled: query.length > 0,
  });
}

export function useSearchCategories(query: string) {
  return useQuery({
    queryKey: ['categories', 'search', query],
    queryFn: async () => {
      const { data: fuzzyResults, error: err1 } = await supabase
        .rpc('search_categories_fuzzy', { search_term: query });
      if (err1) throw err1;

      if (!fuzzyResults || fuzzyResults.length === 0) return [];

      const ids = fuzzyResults.map((c: any) => c.id);
      const { data, error } = await supabase
        .from('categories')
        .select('*, subcategories(name, slug)')
        .in('id', ids);
      if (error) throw error;

      // Preserve fuzzy ordering
      const map = new Map((data || []).map((c: any) => [c.id, c]));
      return ids.map((id: string) => map.get(id)).filter(Boolean);
    },
    enabled: query.length > 0,
  });
}

export function useSearchSubcategories(query: string) {
  return useQuery({
    queryKey: ['subcategories', 'search', query],
    queryFn: async () => {
      const { data: fuzzyResults, error: err1 } = await supabase
        .rpc('search_subcategories_fuzzy', { search_term: query });
      if (err1) throw err1;

      if (!fuzzyResults || fuzzyResults.length === 0) return [];

      const ids = fuzzyResults.map((s: any) => s.id);
      const { data, error } = await supabase
        .from('subcategories')
        .select('*, categories(name, slug, icon)')
        .in('id', ids);
      if (error) throw error;

      const map = new Map((data || []).map((s: any) => [s.id, s]));
      return ids.map((id: string) => map.get(id)).filter(Boolean);
    },
    enabled: query.length > 0,
  });
}
