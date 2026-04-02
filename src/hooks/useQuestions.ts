import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useQuestionsByBusiness(businessId: string) {
  return useQuery({
    queryKey: ['questions', businessId],
    queryFn: async () => {
      const { data: questionsData, error } = await supabase
        .from('questions')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const userIds = [...new Set((questionsData || []).map((q: any) => q.user_id))];
      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);
        (profiles || []).forEach((p: any) => { profilesMap[p.id] = p; });
      }

      return (questionsData || []).map((q: any) => ({
        ...q,
        profiles: profilesMap[q.user_id] || { full_name: null, avatar_url: null },
      }));
    },
    enabled: !!businessId,
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (q: { business_id: string; user_id: string; question: string }) => {
      const { data, error } = await supabase.from('questions').insert(q).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['questions', vars.business_id] });
    },
  });
}
