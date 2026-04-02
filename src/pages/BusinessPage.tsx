import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { StatusBadge } from '@/components/StatusBadge';
import { StarRating } from '@/components/StarRating';
import { FeedCard } from '@/components/FeedCard';
import { useBusinessById } from '@/hooks/useBusinesses';
import { useReviewsByBusiness, useCreateReview } from '@/hooks/useReviews';
import { useQuestionsByBusiness, useCreateQuestion } from '@/hooks/useQuestions';
import { useAuth } from '@/contexts/AuthContext';
import { getStorageUrl } from '@/lib/supabase-helpers';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Phone, MessageCircle, MapPin, Share2, ChevronRight, Clock, Mail, Globe, Instagram, CheckCircle2, Star, Send, Heart, Award, Code2 } from 'lucide-react';
import { useFavorites, useToggleFavorite } from '@/hooks/useFavorites';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const dayLabels: Record<string, string> = {
  monday: 'Segunda', tuesday: 'Terça', wednesday: 'Quarta',
  thursday: 'Quinta', friday: 'Sexta', saturday: 'Sábado', sunday: 'Domingo',
};

const badgeBorderColors: Record<string, string> = {
  'Iniciante': 'border-muted-foreground/30',
  'Explorador': 'border-blue-400',
  'Avaliador': 'border-amber-400',
  'Expert': 'border-purple-400',
  'Mestre': 'border-destructive',
  'Crítico Renomado': 'border-emerald-400',
  'Desenvolvedor': 'border-primary shadow-[0_0_8px_rgba(var(--primary),0.3)]',
};

const badgeTextColors: Record<string, string> = {
  'Iniciante': 'text-muted-foreground',
  'Explorador': 'text-blue-600 dark:text-blue-400',
  'Avaliador': 'text-amber-600 dark:text-amber-400',
  'Expert': 'text-purple-600 dark:text-purple-400',
  'Mestre': 'text-destructive',
  'Crítico Renomado': 'text-emerald-600 dark:text-emerald-400',
  'Desenvolvedor': 'text-primary font-bold',
};

const BusinessPage = () => {
  const { businessId } = useParams();
  const { data: business, isLoading } = useBusinessById(businessId || '');
  const { data: reviews } = useReviewsByBusiness(businessId || '');
  const { data: questions } = useQuestionsByBusiness(businessId || '');
  const { user } = useAuth();
  const createReview = useCreateReview();
  const createQuestion = useCreateQuestion();
  const { data: favoriteIds } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  // Fetch active feed posts for this business
  const { data: businessPosts } = useQuery({
    queryKey: ['business-posts', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feed_posts')
        .select('*, businesses(id, trade_name, verified, cover_photo, hours, whatsapp)')
        .eq('business_id', businessId!)
        .eq('active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [questionText, setQuestionText] = useState('');

  const handleSubmitReview = async () => {
    if (!user || !businessId) return;
    try {
      await createReview.mutateAsync({
        business_id: businessId,
        user_id: user.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewComment('');
      setReviewRating(5);
      toast.success('Avaliação publicada com sucesso!');
    } catch {
      toast.error('Erro ao enviar avaliação.');
    }
  };

  const handleSubmitQuestion = async () => {
    if (!user || !businessId) return;
    try {
      await createQuestion.mutateAsync({
        business_id: businessId,
        user_id: user.id,
        question: questionText,
      });
      setQuestionText('');
      toast.success('Pergunta publicada! Será respondida em breve.');
    } catch {
      toast.error('Erro ao enviar pergunta.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-3xl mx-auto px-4 py-6">
          <Skeleton className="h-64 rounded-2xl mb-6" />
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-32" />
        </main>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container max-w-3xl mx-auto px-4 py-12 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">Estabelecimento não encontrado</h1>
        </div>
      </div>
    );
  }

  const coverUrl = getStorageUrl(business.cover_photo);
  const hours = business.hours as any;
  const photos = (business.photos || []).map((p: string) => getStorageUrl(p)).filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-3xl mx-auto px-4 pb-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground py-4 flex-wrap">
          <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
          <ChevronRight size={14} />
          {business.categories && (
            <>
              <Link to={`/categoria/${(business.categories as any).slug}`} className="hover:text-foreground transition-colors">
                {(business.categories as any).name}
              </Link>
              <ChevronRight size={14} />
            </>
          )}
          <span className="text-foreground font-medium">{business.trade_name}</span>
        </nav>

        {/* Cover */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-48 sm:h-64 rounded-2xl bg-gradient-to-br from-primary/25 to-accent/25 flex items-center justify-center mb-6 overflow-hidden"
        >
          {coverUrl ? (
            <img src={coverUrl} alt={business.trade_name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-display text-6xl font-bold text-primary/20">
              {business.trade_name?.charAt(0)}
            </span>
          )}
        </motion.div>

        {/* Header info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-foreground">{business.trade_name}</h1>
                {business.verified && <CheckCircle2 size={20} className="text-accent" />}
              </div>
              {business.subcategories && <span className="text-sm text-muted-foreground">{(business.subcategories as any).name}</span>}
            </div>
            <StatusBadge hours={hours} />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={Number(business.rating) || 0} count={business.review_count} />
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 flex-wrap mb-6">
            <Button size="sm" className="gap-1.5" asChild>
              <a href={`tel:${business.phone}`}>
                <Phone size={16} /> Ligar
              </a>
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 border-accent text-accent hover:bg-accent hover:text-accent-foreground" asChild>
              <a href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent('Olá! Vim através do app Guia Local - Massaranduba. Podemos conversar?')}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={16} /> WhatsApp
              </a>
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" asChild>
              <a href={`https://maps.google.com/?q=${encodeURIComponent((business.address || '') + ' ' + (business.city || ''))}`} target="_blank" rel="noopener noreferrer">
                <MapPin size={16} /> Como Chegar
              </a>
            </Button>
            <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => navigator.share?.({ title: business.trade_name, url: window.location.href })}>
              <Share2 size={16} /> Compartilhar
            </Button>
            {user && (
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5"
                onClick={() => toggleFavorite.mutate(businessId!)}
                disabled={toggleFavorite.isPending}
              >
                <Heart size={16} className={favoriteIds?.includes(businessId!) ? 'fill-destructive text-destructive' : ''} />
                {favoriteIds?.includes(businessId!) ? 'Favoritado' : 'Favoritar'}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="about" className="mt-2">
          <TabsList className="w-full justify-start bg-muted rounded-xl p-1 overflow-x-auto">
            <TabsTrigger value="about" className="rounded-lg">Sobre</TabsTrigger>
            <TabsTrigger value="posts" className="rounded-lg">Promoções ({businessPosts?.length || 0})</TabsTrigger>
            <TabsTrigger value="photos" className="rounded-lg">Fotos ({photos.length})</TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-lg">Avaliações ({reviews?.length || 0})</TabsTrigger>
            <TabsTrigger value="questions" className="rounded-lg">Perguntas ({questions?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="mt-4 space-y-6">
            <div>
              <h3 className="font-display font-semibold text-foreground mb-2">Descrição</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{business.description}</p>
            </div>

            <div>
              <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock size={16} /> Horário de Funcionamento
              </h3>
              <div className="space-y-2">
                {hours && Object.entries(hours).map(([day, h]: [string, any]) => (
                  <div key={day} className="flex justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                    <span className="text-foreground font-medium">{dayLabels[day] || day}</span>
                    <span className={h.closed ? 'text-status-closed' : 'text-muted-foreground'}>
                      {h.closed ? 'Fechado' : `${h.open} - ${h.close}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Endereço</h3>
                <p className="text-sm text-foreground">{business.address}, {business.city}</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Contato</h3>
                <div className="space-y-1">
                  <p className="text-sm text-foreground flex items-center gap-2"><Phone size={14} className="text-muted-foreground" /> {business.phone}</p>
                  {business.email && <p className="text-sm text-foreground flex items-center gap-2"><Mail size={14} className="text-muted-foreground" /> {business.email}</p>}
                </div>
              </div>
            </div>

            {business.instagram && (
              <Button variant="outline" className="w-full gap-2 rounded-xl" asChild>
                <a href={`https://instagram.com/${business.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                  <Instagram size={18} /> Seguir no Instagram
                </a>
              </Button>
            )}
          </TabsContent>

          <TabsContent value="posts" className="mt-4">
            <div className="space-y-4">
              {businessPosts?.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-2xl">
                  <p className="text-muted-foreground">Nenhuma promoção ativa no momento.</p>
                </div>
              ) : (
                businessPosts?.map((post: any) => (
                  <FeedCard key={post.id} post={post} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="photos" className="mt-4">
            {photos.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-2xl">
                <p className="text-muted-foreground">Nenhuma foto disponível.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((url: string, i: number) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-muted">
                    <img src={url} alt="" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            <div className="space-y-6">
              {user ? (
                <div className="bg-muted/30 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-semibold text-foreground">Sua Avaliação</h4>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setReviewRating(star)}>
                          <Star size={20} className={star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    placeholder="Conte sua experiência..."
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    className="bg-background border-border/50 focus:border-primary min-h-[100px]"
                  />
                  <Button size="sm" onClick={handleSubmitReview} disabled={createReview.isPending || !reviewComment.trim()}>
                    {createReview.isPending ? 'Enviando...' : 'Enviar Avaliação'}
                  </Button>
                </div>
              ) : (
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/login">Faça login para avaliar</Link>
                </Button>
              )}

              {reviews?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhuma avaliação ainda.</p>
              ) : (
                reviews?.map((review: any) => {
                  // Lógica de prioridade de selo: Admin/Developer sempre ganha dos níveis de reviewer
                  const isAdmin = review.profiles?.role === 'admin';
                  const badge = isAdmin ? 'Desenvolvedor' : (review.profiles?.reviewer_badge || 'Iniciante');
                  const borderClass = badgeBorderColors[badge] || badgeBorderColors['Iniciante'];
                  const badgeColor = badgeTextColors[badge] || badgeTextColors['Iniciante'];
                  
                  return (
                  <div key={review.id} className={`bg-card rounded-xl p-4 border-2 ${borderClass}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                          {review.profiles?.avatar_url ? (
                            <img src={review.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-primary font-display font-bold text-xs">
                              {review.profiles?.full_name?.charAt(0) || '?'}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-medium text-foreground">{review.profiles?.full_name || 'Usuário'}</span>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${badgeColor}`}>
                          {isAdmin ? <Code2 size={12} /> : <Award size={12} />}
                          {badge}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                    {review.comment && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{review.comment}</p>}
                  </div>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="questions" className="mt-4">
            <div className="space-y-4">
              {user ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Faça uma pergunta..."
                    value={questionText}
                    onChange={e => setQuestionText(e.target.value)}
                  />
                  <Button size="icon" onClick={handleSubmitQuestion} disabled={createQuestion.isPending || !questionText.trim()}>
                    <Send size={16} />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/login">Faça login para perguntar</Link>
                </Button>
              )}

              {questions?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhuma pergunta ainda.</p>
              ) : (
                questions?.map((q: any) => (
                  <div key={q.id} className="bg-card rounded-xl p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                        {q.profiles?.avatar_url ? (
                          <img src={q.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-primary font-display font-bold text-xs">{q.profiles?.full_name?.charAt(0) || '?'}</span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-foreground">{q.profiles?.full_name || 'Usuário'}</span>
                      <span className="text-xs text-muted-foreground">• {new Date(q.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <p className="text-sm text-foreground font-medium mb-2">"{q.question}"</p>
                    {q.answer ? (
                      <div className="bg-muted rounded-lg p-3 ml-4 border-l-2 border-primary">
                        <p className="text-sm text-muted-foreground">{q.answer}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic ml-4">Aguardando resposta...</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default BusinessPage;
