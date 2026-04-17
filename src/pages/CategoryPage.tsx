import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { Header } from '@/components/Header';
import { BusinessCard } from '@/components/BusinessCard';
import { OpenNowFilter } from '@/components/OpenNowFilter';
import { useCategoryBySlug } from '@/hooks/useCategories';
import { useBusinessesByCategory, useBusinessesBySubcategory } from '@/hooks/useBusinesses';
import { isBusinessOpenFromHours } from '@/lib/supabase-helpers';
import { ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const CategoryPage = () => {
  const { categoryId, subcategoryId } = useParams();
  const [isOpenNowOnly, setIsOpenNowOnly] = useState(false);
  const { data: category, isLoading: catLoading } = useCategoryBySlug(categoryId || '');
  const { data: catBusinesses, isLoading: bizLoading } = useBusinessesByCategory(categoryId || '');
  const { data: subBusinesses } = useBusinessesBySubcategory(subcategoryId || '');

  let businesses = subcategoryId ? subBusinesses : catBusinesses;
  
  // Filtrar apenas estabelecimentos abertos agora se o filtro estiver ativo
  if (isOpenNowOnly && businesses) {
    businesses = businesses.filter((biz: any) => isBusinessOpenFromHours(biz.hours, biz.special_hours));
  }
  
  const isLoading = catLoading || bizLoading;

  const currentSub = subcategoryId && category
    ? category.subcategories?.find((s: any) => s.slug === subcategoryId)
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-3xl mx-auto px-4 py-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
          </div>
        </main>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container max-w-3xl mx-auto px-4 py-12 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">Categoria não encontrada</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-3xl mx-auto px-4 py-6 pb-12">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
          <ChevronRight size={14} />
          {currentSub ? (
            <>
              <Link to={`/categoria/${category.slug}`} className="hover:text-foreground transition-colors">{category.name}</Link>
              <ChevronRight size={14} />
              <span className="text-foreground font-medium">{currentSub.name}</span>
            </>
          ) : (
            <span className="text-foreground font-medium">{category.name}</span>
          )}
        </nav>

        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          {currentSub ? currentSub.name : category.name}
        </h1>

        {!subcategoryId && category.subcategories?.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-6">
            {category.subcategories.map((sub: any) => (
              <Link
                key={sub.id}
                to={`/categoria/${category.slug}/${sub.slug}`}
                className="px-4 py-1.5 rounded-full text-sm font-medium bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}

        {/* Filtro de Aberto Agora */}
        {businesses && businesses.length > 0 && (
          <div className="mb-6 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {isOpenNowOnly 
                ? `${businesses.length} estabelecimento(s) aberto(s) agora` 
                : `${businesses.length} estabelecimento(s) encontrado(s)`}
            </p>
            <OpenNowFilter onFilterChange={setIsOpenNowOnly} />
          </div>
        )}

        {!businesses?.length ? (
          <p className="text-muted-foreground py-8 text-center">
            Nenhum estabelecimento encontrado nesta categoria.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {businesses.map((biz: any, i: number) => (
              <BusinessCard key={biz.id} business={biz} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoryPage;
