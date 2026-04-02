import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function usePostReactions(postId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: reactions } = useQuery({
    queryKey: ['post-reactions', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feed_post_reactions' as any)
        .select('*')
        .eq('post_id', postId);
      if (error) throw error;
      return data as any[];
    },
  });

  const likes = reactions?.filter((r: any) => r.reaction === 'like').length || 0;
  const dislikes = reactions?.filter((r: any) => r.reaction === 'dislike').length || 0;
  const userReaction = reactions?.find((r: any) => r.user_id === user?.id)?.reaction as string | undefined;

  const toggleReaction = useMutation({
    mutationFn: async (reaction: 'like' | 'dislike') => {
      if (!user) throw new Error('Login necessário');

      if (userReaction === reaction) {
        // Remove reaction
        await supabase
          .from('feed_post_reactions' as any)
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else if (userReaction) {
        // Update reaction
        await supabase
          .from('feed_post_reactions' as any)
          .update({ reaction } as any)
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Insert reaction
        await supabase
          .from('feed_post_reactions' as any)
          .insert({ post_id: postId, user_id: user.id, reaction } as any);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-reactions', postId] });
    },
  });

  return { likes, dislikes, userReaction, toggleReaction };
}
