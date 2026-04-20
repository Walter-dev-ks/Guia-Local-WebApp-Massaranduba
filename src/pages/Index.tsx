import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { CategoryCarousel } from '@/components/CategoryCarousel';
import { FeedCard } from '@/components/FeedCard';
import { UserProfileCard } from '@/components/UserProfileCard';
import { FeedFilter, type FeedFilterType } from '@/components/FeedFilter';
import { useFeedPosts } from '@/hooks/useFeedPosts';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const Index = () => {
  const [currentFilter, setCurrentFilter] = useState<FeedFilterType>('all');
  const { data: rawFeedPosts, isLoading, refetch } = useFeedPosts();
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['feed_posts'] });
    await refetch();
  };

  const processedFeed = useMemo(() => {
    if (!rawFeedPosts) return [];

    // 1. Separar patrocinados e posts normais
    const sponsored = rawFeedPosts.filter(p => p.type === 'sponsored');
    const organic = rawFeedPosts.filter(p => p.type !== 'sponsored');

    // 2. Filtrar os posts orgânicos se um filtro estiver ativo
    const filteredOrganic = currentFilter === 'all' 
      ? organic 
      : organic.filter(p => p.type === currentFilter);

    // 3. Injetar patrocinados no feed filtrado
    // Regra: Patrocinado no topo (índice 0) e depois a cada X posts, 
    // garantindo que nunca haja dois patrocinados seguidos.
    const result: any[] = [];
    let sponsoredIdx = 0;
    let organicIdx = 0;

    // Se houver patrocinados, coloca o primeiro no topo
    if (sponsored.length > 0) {
      result.push(sponsored[sponsoredIdx++]);
    }

    // Preenche o resto injetando patrocinados a cada 4 posts orgânicos
    while (organicIdx < filteredOrganic.length) {
      // Adiciona um bloco de posts orgânicos (ex: 3 posts)
      const chunkSize = 3;
      for (let i = 0; i < chunkSize && organicIdx < filteredOrganic.length; i++) {
        result.push(filteredOrganic[organicIdx++]);
      }

      // Após o bloco, se houver mais patrocinados, injeta um
      if (sponsoredIdx < sponsored.length) {
        result.push(sponsored[sponsoredIdx++]);
      }
    }

    // Se ainda sobrarem patrocinados e o feed estiver vazio ou curto, adiciona no fim
    // (mas a lógica acima já cobre a maioria dos casos)
    while (sponsoredIdx < sponsored.length && result.length < 10) {
      // Verifica se o último não é patrocinado para manter a regra de "não seguidos"
      if (result.length === 0 || result[result.length - 1].type !== 'sponsored') {
        result.push(sponsored[sponsoredIdx++]);
      } else {
        break; // Para evitar quebrar a regra de "não seguidos" no final
      }
    }

    return result;
  }, [rawFeedPosts, currentFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-3xl mx-auto px-4 pb-12">
        <UserProfileCard />
        <CategoryCarousel />

        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Feed Local
            </h2>
          </div>

          <FeedFilter 
            currentFilter={currentFilter} 
            onFilterChange={setCurrentFilter} 
          />

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-2xl" />
              ))}
            </div>
          ) : processedFeed.length ? (
            <>
              <div className="space-y-6">
                {processedFeed.map((post, i) => (
                  <FeedCard key={`${post.id}-${i}`} post={post as any} index={i} />
                ))}
              </div>
              <div className="text-center py-10 space-y-3">
                <p className="text-muted-foreground font-display font-medium">
                  Isso é tudo por hoje 🎉
                </p>
                <Button variant="outline" className="gap-2" onClick={handleRefresh}>
                  <RefreshCw size={16} />
                  Atualizar
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-16 space-y-4">
              <p className="text-muted-foreground font-display font-medium text-lg">
                Nenhuma postagem encontrada para este filtro.
              </p>
              <Button variant="outline" className="gap-2" onClick={() => setCurrentFilter('all')}>
                Ver tudo
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;
