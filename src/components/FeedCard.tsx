import { useState, useRef, useEffect } from 'react'; // Adicionado useEffect aqui
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Megaphone, Tag, Star, CheckCircle2, MessageCircle, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStorageUrl, isBusinessOpenFromHours } from '@/lib/supabase-helpers';
import { StarRating } from '@/components/StarRating';
import { usePostReactions } from '@/hooks/usePostReactions';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { WeeklyHours } from '@/types';

interface FeedPostData {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  images?: string[] | null;
  type: string;
  published_at: string | null;
  businesses: {
    id: string;
    trade_name: string;
    verified: boolean;
    cover_photo: string | null;
    whatsapp?: string | null;
    hours?: any;
    rating?: number;
    review_count?: number;
  } | null;
}

interface FeedCardProps {
  post: FeedPostData;
  index: number;
}

const typeConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  promotion: { label: 'Promoção', icon: Tag, className: 'bg-accent text-accent-foreground' },
  announcement: { label: 'Aviso', icon: Megaphone, className: 'bg-secondary text-secondary-foreground' },
  sponsored: { label: 'Patrocinado', icon: Star, className: 'bg-amber-500 text-white animate-pulse-slow shadow-sm' },
};

export function FeedCard({ post, index }: FeedCardProps) {
  const config = typeConfig[post.type] || typeConfig.promotion;
  const Icon = config.icon;
  const business = post.businesses;
  const { user } = useAuth();
  const navigate = useNavigate();
  const { likes, dislikes, userReaction, toggleReaction } = usePostReactions(post.id);

  // --- LÓGICA DO CARROSSEL, SWIPE E CARREGAMENTO ---
  const allImages = post.images && post.images.length > 0 
    ? post.images 
    : (post.image_url ? [post.image_url] : []);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // --- LÓGICA DE PRÉ-CARREGAMENTO INTELIGENTE ---
  useEffect(() => {
    if (allImages.length > 1) {
      allImages.slice(1).forEach((imagePath) => {
        const img = new Image();
        img.src = getStorageUrl(imagePath);
      });
    }
  }, [allImages]);

  const nextImage = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    setImageLoaded(false);
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    setImageLoaded(false);
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) nextImage(e);
    else if (distance < -50) prevImage(e);
    touchStartX.current = 0;
    touchEndX.current = 0;
  };
  // ---------------------------

  const isOpen = business?.hours ? isBusinessOpenFromHours(business.hours as WeeklyHours) : null;

  const handleReaction = (e: React.MouseEvent, reaction: 'like' | 'dislike') => {
    e.stopPropagation();
    if (!user) {
      toast.error('Faça login para reagir');
      return;
    }
    toggleReaction.mutate(reaction);
  };

  const handleCardClick = () => {
    if (business?.id) {
      navigate(`/empresa/${business.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <div 
        onClick={handleCardClick}
        className={`bg-card rounded-2xl overflow-hidden border card-shadow hover:card-shadow-hover transition-all duration-300 cursor-pointer active:scale-[0.98] ${
          post.type === 'sponsored' ? 'border-amber-500/30 ring-1 ring-amber-500/10 shadow-amber-500/5' : 'border-border/50'
        }`}
      >
        {/* Cabeçalho - Estilo Lista no Mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden flex-shrink-0">
              {business?.cover_photo ? (
                <img src={getStorageUrl(business.cover_photo)} alt={business.trade_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary-foreground font-display font-bold text-base sm:text-sm">
                  {business?.trade_name?.charAt(0) || '?'}
                </span>
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold sm:font-semibold text-foreground hover:text-primary transition-colors truncate">
                  {business?.trade_name}
                </span>
                {business?.verified && (
                  <CheckCircle2 size={14} className="text-accent fill-accent/20 flex-shrink-0" />
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-muted-foreground">
                  {post.published_at ? new Date(post.published_at).toLocaleDateString('pt-BR') : ''}
                </p>
                {isOpen !== null && (
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${isOpen ? 'text-status-open' : 'text-status-closed'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-status-open' : 'bg-status-closed'}`} />
                    {isOpen ? 'Aberto' : 'Fechado'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
            {business?.rating !== undefined && business.rating > 0 && (
              <StarRating rating={Number(business.rating)} count={business.review_count} size="sm" />
            )}
            <Badge className={`${config.className} text-xs gap-1 px-2.5 py-0.5`}>
              <Icon size={12} />
              {config.label}
            </Badge>
          </div>
        </div>

        {/* ÁREA DO CARROSSEL COM SWIPE E SKELETON */}
        <div 
          className="relative aspect-[4/3] bg-muted overflow-hidden group select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {!imageLoaded && allImages.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse">
              <ImageIcon className="w-10 h-10 text-muted-foreground/20" />
            </div>
          )}

          <AnimatePresence mode="wait">
            {allImages.length > 0 ? (
              <motion.img
                key={allImages[currentImageIndex]}
                src={getStorageUrl(allImages[currentImageIndex])}
                alt={post.title}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                initial={{ opacity: 0 }}
                animate={{ opacity: imageLoaded ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-8 h-full flex items-center justify-center">
                <span className="font-display text-5xl font-bold text-primary/15">
                  {business?.trade_name?.charAt(0) || '📢'}
                </span>
              </div>
            )}
          </AnimatePresence>

          {allImages.length > 1 && (
            <>
              <div className="hidden sm:flex absolute inset-0 items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button variant="ghost" size="icon" onClick={prevImage} className="h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm">
                  <ChevronLeft size={20} />
                </Button>
                <Button variant="ghost" size="icon" onClick={nextImage} className="h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm">
                  <ChevronRight size={20} />
                </Button>
              </div>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allImages.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'w-4 bg-white shadow-sm' : 'w-1.5 bg-white/50'}`} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Reações e Conteúdo */}
        <div className="flex items-center gap-4 px-4 pt-3">
          <button onClick={(e) => handleReaction(e, 'like')} className={`flex items-center gap-1.5 text-sm transition-colors ${userReaction === 'like' ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary'}`}>
            <ThumbsUp size={18} className={userReaction === 'like' ? 'fill-primary' : ''} />
            {likes > 0 && <span>{likes}</span>}
          </button>
          <button onClick={(e) => handleReaction(e, 'dislike')} className={`flex items-center gap-1.5 text-sm transition-colors ${userReaction === 'dislike' ? 'text-destructive font-semibold' : 'text-muted-foreground hover:text-destructive'}`}>
            <ThumbsDown size={18} className={userReaction === 'dislike' ? 'fill-destructive' : ''} />
            {dislikes > 0 && <span>{dislikes}</span>}
          </button>
        </div>

        <div className="p-4 pt-2">
          <h3 className="font-display font-bold text-foreground text-lg mb-1.5 line-clamp-2">{post.title}</h3>
          {post.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">{post.description}</p>
          )}

          {/* Botões de Tamanho Igual e Acessíveis */}
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-2">
            <Button size="lg" variant="default" className="gap-2 flex-1 text-sm h-11 sm:h-9 sm:size-sm w-full">
              <ArrowRight size={16} className="sm:w-3.5 sm:h-3.5" />
              Ver Perfil
            </Button>
            {business?.id && (
              <Button size="lg" variant="outline" className="gap-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground text-sm h-11 sm:h-9 sm:size-sm w-full" onClick={(e) => e.stopPropagation()} asChild>
                <a href={`https://wa.me/${business?.whatsapp || ''}?text=${encodeURIComponent('Olá! Vim através do app Guia Local - Massaranduba. Podemos conversar?'  )}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={16} className="sm:w-3.5 sm:h-3.5" />
                  WhatsApp
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
