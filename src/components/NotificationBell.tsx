import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [localLastSeen, setLocalLastSeen] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch user's last seen timestamp from profile
  const { data: profile } = useQuery({
    queryKey: ['profile-notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('notifications_last_seen')
        .eq('id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const lastSeen = localLastSeen || profile?.notifications_last_seen || new Date(0).toISOString();

  const { data: posts } = useQuery({
    queryKey: ['notification-posts'],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data, error } = await supabase
        .from('feed_posts')
        .select('id, title, type, created_at, business_id, businesses(id, trade_name)')
        .eq('active', true)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000,
  });

  const unreadCount = posts?.filter(p => Date.parse(p.created_at) > Date.parse(lastSeen)).length || 0;

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Subscribe to realtime inserts for browser notifications
  useEffect(() => {
    const channel = supabase
      .channel('feed_posts_notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feed_posts' }, (payload) => {
        queryClient.invalidateQueries({ queryKey: ['notification-posts'] });
        queryClient.invalidateQueries({ queryKey: ['feed_posts'] });
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Nova promoção!', {
            body: (payload.new as any).title,
            icon: '/placeholder.svg',
          });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!user || !posts?.length) return null;
      const latestPostTimestamp = Date.parse(posts[0].created_at);
      const nowTimestamp = Date.now();
      const timestamp = new Date(Math.max(latestPostTimestamp, nowTimestamp)).toISOString();
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, notifications_last_seen: timestamp }, { onConflict: 'id' })
        .select('notifications_last_seen')
        .maybeSingle();
      if (error) throw error;
      return data?.notifications_last_seen || timestamp;
    },
    onSuccess: (timestamp) => {
      if (timestamp) {
        setLocalLastSeen(timestamp);
        queryClient.setQueryData(['profile-notifications', user?.id], { notifications_last_seen: timestamp });
      }
      queryClient.invalidateQueries({ queryKey: ['profile-notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notification-posts'] });
      setOpen(false);
    },
    onError: (error) => {
      console.error('Erro ao marcar notificações como lidas:', error);
    },
  });

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground hover:text-foreground">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h4 className="font-display font-semibold text-sm text-foreground">Notificações</h4>
          {unreadCount > 0 && (
            <button onClick={() => markAllRead.mutate()} className="text-xs text-primary hover:underline">
              Marcar como lida
            </button>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto">
          {!posts?.length ? (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhuma notificação</p>
          ) : (
            posts.map((post) => {
              const isUnread = post.created_at > lastSeen;
              const businessId = post.business_id || (post.businesses as any)?.id;
              const businessName = (post.businesses as any)?.trade_name || 'Estabelecimento';
              
              return (
                <Link
                  key={post.id}
                  to={businessId ? `/empresa/${businessId}?tab=posts` : '#'}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-3 hover:bg-muted transition-colors border-b border-border/50 last:border-0 ${isUnread ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {isUnread && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {businessName} • {new Date(post.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
