import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useReviewsByBusiness(businessId: string) {
  return useQuery({
    queryKey: ['reviews', businessId],
    queryFn: async () => {
      // Fetch reviews
      const { data: reviewsData, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch profile info for each unique user
      const userIds = [...new Set((reviewsData || []).map((r: any) => r.user_id))];
      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        // Fetch profiles
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, reviewer_badge, review_count')
          .in('id', userIds);
        
        // user_roles has RLS for direct reads, so use the security definer helper.
        const rolesEntries = await Promise.all(
          userIds.map(async (userId) => {
            const { data } = await supabase.rpc('has_role', {
              _user_id: userId,
              _role: 'admin',
            });

            return [userId, data ? 'admin' : 'user'] as const;
          })
        );
        const rolesMap = Object.fromEntries(rolesEntries);

        (profiles || []).forEach((p: any) => { 
          profilesMap[p.id] = {
            ...p,
            role: rolesMap[p.id] || 'user'
          }; 
        });
      }

      return (reviewsData || []).map((r: any) => ({
        ...r,
        profiles: profilesMap[r.user_id] || { full_name: null, avatar_url: null, role: 'user' },
      }));
    },
    enabled: !!businessId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (review: { business_id: string; user_id: string; rating: number; comment: string }) => {
      const { data, error } = await supabase.from('reviews').insert(review).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', vars.business_id] });
    },
  });
}
