import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from './useFavorites';

export function useFeedPosts() {
  const { user } = useAuth();
  const { data: favoriteIds } = useFavorites();

  return useQuery({
    queryKey: ['feed_posts', favoriteIds],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('feed_posts')
        .select('*, businesses(id, trade_name, verified, cover_photo, hours, rating, review_count, whatsapp)')
        .eq('active', true)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (!data) return [];

      // Sort: sponsored by sort_order first, then favorites, then rest
      const favSet = new Set(favoriteIds || []);
      const sponsored = data
        .filter(p => p.type === 'sponsored')
        .sort((a, b) => ((a as any).sort_order || 0) - ((b as any).sort_order || 0));
      const favPosts = data.filter(p => p.type !== 'sponsored' && favSet.has(p.business_id));
      const rest = data.filter(p => p.type !== 'sponsored' && !favSet.has(p.business_id));

      return [...sponsored, ...favPosts, ...rest];
    },
  });
}
