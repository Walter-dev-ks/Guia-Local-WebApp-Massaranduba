import { Link } from 'react-router-dom';
import { ShoppingBag, UtensilsCrossed, Heart, Wrench, GraduationCap, Sparkles } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

const iconMap: Record<string, React.ElementType> = {
  ShoppingBag, UtensilsCrossed, Heart, Wrench, GraduationCap, Sparkles,
};

export function CategoryCarousel() {
  const { data: categories, isLoading } = useCategories();
  const { user } = useAuth();
  const { data: favoriteIds } = useFavorites();

  if (isLoading) {
    return (
      <section className="py-6">
        <h2 className="font-display text-lg font-semibold text-foreground mb-4 px-1">Categorias</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 min-w-[80px]">
              <Skeleton className="w-16 h-16 rounded-full" />
              <Skeleton className="w-12 h-3" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!categories?.length) return null;

  const hasFavorites = user && favoriteIds && favoriteIds.length > 0;

  return (
    <section className="py-6">
      <h2 className="font-display text-lg font-semibold text-foreground mb-4 px-1">Categorias</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {/* Favoritos category */}
        {hasFavorites && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <Link
              to="/favoritos"
              className="flex flex-col items-center gap-2 min-w-[80px] group"
            >
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center group-hover:bg-destructive group-hover:text-destructive-foreground transition-colors duration-200">
                <Heart size={24} className="text-destructive group-hover:text-destructive-foreground" />
              </div>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center">
                Favoritos
              </span>
            </Link>
          </motion.div>
        )}

        {categories.map((cat, i) => {
          const Icon = iconMap[cat.icon] || ShoppingBag;
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (hasFavorites ? i + 1 : i) * 0.05 }}
            >
              <Link
                to={`/categoria/${cat.slug}`}
                className="flex flex-col items-center gap-2 min-w-[80px] group"
              >
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                  <Icon size={24} />
                </div>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center">
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
