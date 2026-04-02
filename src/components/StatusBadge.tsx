import { WeeklyHours } from '@/types';
import { isBusinessOpenFromHours } from '@/lib/supabase-helpers';

interface StatusBadgeProps {
  hours: WeeklyHours | any;
  size?: 'sm' | 'md';
}

export function StatusBadge({ hours, size = 'md' }: StatusBadgeProps) {
  const open = isBusinessOpenFromHours(hours as WeeklyHours);

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      } ${
        open
          ? 'bg-status-open-bg text-status-open'
          : 'bg-status-closed-bg text-status-closed'
      }`}
    >
      <span className={`rounded-full ${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'} ${open ? 'bg-status-open' : 'bg-status-closed'}`} />
      {open ? 'Aberto' : 'Fechado'}
    </span>
  );
}
