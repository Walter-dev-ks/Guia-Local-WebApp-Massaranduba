import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/StatusBadge';
import { StarRating } from '@/components/StarRating';
import { MapPin, Phone, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getStorageUrl } from '@/lib/supabase-helpers';

interface BusinessCardProps {
  business: any;
  index?: number;
}

export function BusinessCard({ business, index = 0 }: BusinessCardProps) {
  const coverUrl = getStorageUrl(business.cover_photo);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
    >
      <Link to={`/empresa/${business.id}`} className="block">
        <div className="bg-card rounded-xl card-shadow hover:card-shadow-hover transition-all duration-300 overflow-hidden border border-border/50 group">
          <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
            {coverUrl ? (
              <img src={coverUrl} alt={business.trade_name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-display text-4xl font-bold text-primary/30">
                {business.trade_name?.charAt(0)}
              </span>
            )}
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-semibold text-foreground text-base truncate group-hover:text-primary transition-colors">
                    {business.trade_name}
                  </h3>
                  {business.verified && <CheckCircle2 size={14} className="text-accent shrink-0" />}
                </div>
                {business.subcategories?.name && (
                  <span className="text-xs text-muted-foreground">{business.subcategories.name}</span>
                )}
              </div>
              <StatusBadge hours={business.hours} specialHours={business.special_hours} size="sm" />
            </div>

            <StarRating rating={Number(business.rating) || 0} count={business.review_count} size="sm" />

            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin size={12} className="shrink-0" />
                <span className="truncate">{business.address}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone size={12} className="shrink-0" />
                <span>{business.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
