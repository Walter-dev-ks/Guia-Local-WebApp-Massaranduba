import { useSearchParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { Header } from '@/components/Header';
import { BusinessCard } from '@/components/BusinessCard';
import { OpenNowFilter } from '@/components/OpenNowFilter';
import { useSearchBusinesses, useSearchCategories, useSearchSubcategories } from '@/hooks/useBusinesses';
import { isBusinessOpenFromHours } from '@/lib/supabase-helpers';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight } from 'lucide-react';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [isOpenNowOnly, setIsOpenNowOnly] = useState(false);
  const query = searchParams.get('q') || '';
  const { data: allBusinesses, isLoading: loadingBiz } = useSearchBusinesses(query);
  const { data: categories, isLoading: loadingCat } = useSearchCategories(query);
  const { data: subcategories, isLoading: loadingSub } = useSearchSubcategories(query);

  // Filtrar apenas estabelecimentos abertos agora se o filtro estiver ativo
  const businesses = isOpenNowOnly && allBusinesses
    ? allBusinesses.filter((biz: any) => isBusinessOpenFromHours(biz.hours))
    : allBusinesses;

  const isLoading = loadingBiz || loadingCat || loadingSub;
  const totalResults = (businesses?.length || 0) + (categories?.length || 0) + (subcategories?.length || 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-3xl mx-auto px-4 py-6 pb-12">
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">
          Resultados para "{query}"
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {isLoading ? 'Buscando...' : `${totalResults} resultado(s) encontrado(s)`}
        </p>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : totalResults === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            Nenhum resultado encontrado. Tente buscar com outras palavras.
          </p>
        ) : (
          <div className="space-y-8">
            {/* Categories */}
            {categories && categories.length > 0 && (
              <section>
                <h2 className="font-display text-lg font-semibold text-foreground mb-3">Categorias</h2>
                <div className="space-y-2">
                  {categories.map((cat: any) => (
                    <Link
                      key={cat.id}
                      to={`/categoria/${cat.slug}`}
                      className="flex items-center justify-between bg-card rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-colors group"
                    >
                      <div>
                        <span className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                          {cat.name}
                        </span>
                        {cat.subcategories?.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {cat.subcategories.map((s: any) => s.name).join(', ')}
                          </p>
                        )}
                      </div>
                      <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Subcategories */}
            {subcategories && subcategories.length > 0 && (
              <section>
                <h2 className="font-display text-lg font-semibold text-foreground mb-3">Subcategorias</h2>
                <div className="space-y-2">
                  {subcategories.map((sub: any) => (
                    <Link
                      key={sub.id}
                      to={`/categoria/${sub.categories?.slug}?sub=${sub.slug}`}
                      className="flex items-center justify-between bg-card rounded-xl p-4 border border-border/50 hover:border-accent/30 transition-colors group"
                    >
                      <div>
                        <span className="font-display font-semibold text-foreground group-hover:text-accent transition-colors">
                          {sub.name}
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          em {sub.categories?.name}
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-muted-foreground group-hover:text-accent transition-colors" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Businesses */}
            {businesses && businesses.length > 0 && (
              <section>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-display text-lg font-semibold text-foreground">Estabelecimentos</h2>
                  <OpenNowFilter onFilterChange={setIsOpenNowOnly} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {businesses.map((biz: any, i: number) => (
                    <BusinessCard key={biz.id} business={biz} index={i} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
