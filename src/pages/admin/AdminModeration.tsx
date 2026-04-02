import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Star, MessageCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function AdminModeration() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: allReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['admin-all-reviews'],
    queryFn: async () => {
      const { data: reviewsData, error } = await supabase
        .from('reviews')
        .select('*, businesses(trade_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const userIds = [...new Set((reviewsData || []).map((r: any) => r.user_id))];
      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);
        (profiles || []).forEach((p: any) => { profilesMap[p.id] = p; });
      }

      return (reviewsData || []).map((r: any) => ({
        ...r,
        profiles: profilesMap[r.user_id] || { full_name: null },
      }));
    },
  });

  const { data: allQuestions, isLoading: questionsLoading } = useQuery({
    queryKey: ['admin-all-questions'],
    queryFn: async () => {
      const { data: questionsData, error } = await supabase
        .from('questions')
        .select('*, businesses(trade_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const userIds = [...new Set((questionsData || []).map((q: any) => q.user_id))];
      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);
        (profiles || []).forEach((p: any) => { profilesMap[p.id] = p; });
      }

      return (questionsData || []).map((q: any) => ({
        ...q,
        profiles: profilesMap[q.user_id] || { full_name: null },
      }));
    },
  });

  const toggleReadReview = useMutation({
    mutationFn: async ({ id, read }: { id: string; read: boolean }) => {
      const { error } = await supabase.from('reviews').update({ read }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const toggleReadQuestion = useMutation({
    mutationFn: async ({ id, read }: { id: string; read: boolean }) => {
      const { error } = await supabase.from('questions').update({ read }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-questions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const deleteReview = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Avaliação removida!');
    },
  });

  const [answers, setAnswers] = useState<Record<string, string>>({});

  const answerQuestion = useMutation({
    mutationFn: async ({ id, answer }: { id: string; answer: string }) => {
      const { error } = await supabase.from('questions').update({
        answer,
        answered_by: user?.id,
        answered_at: new Date().toISOString(),
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-questions'] });
      toast.success('Pergunta respondida!');
    },
  });

  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-questions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Pergunta removida!');
    },
  });

  const unreadReviews = allReviews?.filter((r: any) => !r.read).length || 0;
  const unreadQuestions = allQuestions?.filter((q: any) => !q.read).length || 0;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Moderação</h1>

      <Tabs defaultValue="reviews">
        <TabsList>
          <TabsTrigger value="reviews">
            Avaliações ({allReviews?.length || 0})
            {unreadReviews > 0 && <span className="ml-1.5 bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5">{unreadReviews}</span>}
          </TabsTrigger>
          <TabsTrigger value="questions">
            Perguntas ({allQuestions?.length || 0})
            {unreadQuestions > 0 && <span className="ml-1.5 bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5">{unreadQuestions}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="mt-4">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Comentário</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviewsLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
                ) : !allReviews?.length ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma avaliação.</TableCell></TableRow>
                ) : (
                  allReviews.map((r: any) => (
                    <TableRow key={r.id} className={!r.read ? 'bg-primary/5' : ''}>
                      <TableCell className="text-sm text-foreground">{r.profiles?.full_name || 'Usuário'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.businesses?.trade_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star size={14} className="fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium">{r.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{r.comment}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            title={r.read ? 'Marcar como não lida' : 'Marcar como lida'}
                            onClick={() => toggleReadReview.mutate({ id: r.id, read: !r.read })}
                          >
                            {r.read ? <EyeOff size={14} /> : <Eye size={14} />}
                          </Button>
                          <Button size="icon" variant="ghost" className="text-destructive h-7 w-7" onClick={() => { if (confirm('Remover avaliação?')) deleteReview.mutate(r.id); }}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="questions" className="mt-4">
          <div className="space-y-4">
            {questionsLoading ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : !allQuestions?.length ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma pergunta.</p>
            ) : (
              allQuestions.map((q: any) => (
                <div key={q.id} className={`bg-card rounded-xl p-4 border ${!q.read ? 'border-primary/30 bg-primary/5' : 'border-border'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-medium text-foreground">{q.profiles?.full_name || 'Usuário'}</span>
                      <span className="text-xs text-muted-foreground ml-2">→ {q.businesses?.trade_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{new Date(q.created_at).toLocaleDateString('pt-BR')}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        title={q.read ? 'Marcar como não lida' : 'Marcar como lida'}
                        onClick={() => toggleReadQuestion.mutate({ id: q.id, read: !q.read })}
                      >
                        {q.read ? <EyeOff size={12} /> : <Eye size={12} />}
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive h-7 w-7" onClick={() => { if (confirm('Remover pergunta?')) deleteQuestion.mutate(q.id); }}>
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-foreground mb-3">"{q.question}"</p>
                  {q.answer ? (
                    <div className="bg-muted rounded-lg p-3 ml-4 border-l-2 border-primary">
                      <p className="text-sm text-muted-foreground">{q.answer}</p>
                    </div>
                  ) : (
                    <div className="ml-4">
                      <Textarea
                        placeholder="Responder pergunta..."
                        value={answers[q.id] || ''}
                        onChange={e => setAnswers(p => ({ ...p, [q.id]: e.target.value }))}
                        rows={2}
                        className="mb-2"
                      />
                      <Button size="sm" disabled={!answers[q.id]?.trim()} onClick={() => answerQuestion.mutate({ id: q.id, answer: answers[q.id] })}>
                        <MessageCircle size={14} className="mr-1" /> Responder
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
