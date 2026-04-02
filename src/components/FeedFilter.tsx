import { Button } from '@/components/ui/button';
import { Megaphone, Tag, LayoutGrid } from 'lucide-react';

export type FeedFilterType = 'all' | 'promotion' | 'announcement';

interface FeedFilterProps {
  currentFilter: FeedFilterType;
  onFilterChange: (filter: FeedFilterType) => void;
}

export function FeedFilter({ currentFilter, onFilterChange }: FeedFilterProps) {
  const filters = [
    { id: 'all', label: 'Tudo', icon: LayoutGrid },
    { id: 'promotion', label: 'Promoções', icon: Tag },
    { id: 'announcement', label: 'Avisos', icon: Megaphone },
  ] as const;

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = currentFilter === filter.id;
        
        return (
          <Button
            key={filter.id}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(filter.id)}
            className={`gap-2 rounded-full shrink-0 transition-all ${
              isActive ? 'shadow-md scale-105' : 'text-muted-foreground'
            }`}
          >
            <Icon size={16} />
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
}
