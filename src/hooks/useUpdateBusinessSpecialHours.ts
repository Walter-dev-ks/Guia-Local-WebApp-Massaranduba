import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { SpecialHours } from '@/lib/supabase-helpers';

export function useUpdateBusinessSpecialHours() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ businessId, specialHours }: { businessId: string; specialHours: SpecialHours }) => {
      const { error } = await supabase
        .from('businesses')
        .update({ special_hours: specialHours })
        .eq('id', businessId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
      queryClient.invalidateQueries({ queryKey: ['business-posts'] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      toast.success('Horários especiais atualizados!');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar horários:', error);
      toast.error('Erro ao atualizar horários especiais: ' + error.message);
    },
  });
}
