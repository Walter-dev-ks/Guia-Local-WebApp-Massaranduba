import { Header } from '@/components/Header';
import { BusinessCard } from '@/components/BusinessCard';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function FavoritesPage() {
  const { user } = useAuth();
  const { data: favoriteIds } = useFavorites();

  const { data: businesses, isLoading } = useQuery({
    queryKey: ['favorite-businesses', favoriteIds],
    queryFn: async () => {
      if (!favoriteIds?.length) return [];
      const { data, error } = await supabase
        .from('businesses')
        .select('*, categories(name, slug, icon), subcategories(name, slug)')
        .in('id', favoriteIds)
        .eq('active', true);
      if (error) throw error;
      return data;
    },
    enabled: !!favoriteIds?.length,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-3xl mx-auto px-4 pb-12">
        <div className="py-6">
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Heart size={24} className="text-destructive fill-destructive" />
            Meus Favoritos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Estabelecimentos que você marcou como favorito</p>
        </div>

        {!user ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-muted-foreground">Faça login para ver seus favoritos.</p>
            <Button asChild><Link to="/login">Entrar</Link></Button>
          </div>
        ) : isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : !businesses?.length ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground font-display font-medium text-lg">
              Nenhum favorito ainda. Explore estabelecimentos e marque seus preferidos!
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {businesses.map((b: any) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
