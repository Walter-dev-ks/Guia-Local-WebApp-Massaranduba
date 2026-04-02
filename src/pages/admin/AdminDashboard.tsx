import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Rss, MessageSquare, AlertTriangle, Users } from 'lucide-react';

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [biz, posts, unreadReviews, unreadQuestions, users] = await Promise.all([
        supabase.from('businesses').select('id', { count: 'exact', head: true }),
        supabase.from('feed_posts').select('id', { count: 'exact', head: true }).eq('active', true),
        supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('read', false),
        supabase.from('questions').select('id', { count: 'exact', head: true }).eq('read', false),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);
      return {
        businesses: biz.count || 0,
        posts: posts.count || 0,
        unreadReviews: unreadReviews.count || 0,
        unreadQuestions: unreadQuestions.count || 0,
        users: users.count || 0,
      };
    },
  });

  const cards = [
    { title: 'Empresas', value: stats?.businesses ?? '-', icon: Building2, color: 'text-primary' },
    { title: 'Posts Ativos', value: stats?.posts ?? '-', icon: Rss, color: 'text-accent' },
    { title: 'Usuários', value: stats?.users ?? '-', icon: Users, color: 'text-blue-500' },
    { title: 'Avaliações Não Lidas', value: stats?.unreadReviews ?? '-', icon: MessageSquare, color: 'text-amber-500' },
    { title: 'Perguntas Não Lidas', value: stats?.unreadQuestions ?? '-', icon: AlertTriangle, color: 'text-destructive' },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <Icon size={20} className={card.color} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-display font-bold text-foreground">{card.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
