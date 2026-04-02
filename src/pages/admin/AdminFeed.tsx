import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminFeed() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ 
    business_id: '', 
    title: '', 
    description: '', 
    type: 'promotion', 
    image_url: '', 
    images: [] as string[], // Novo campo para múltiplas imagens
    expires_in: '30', 
    sort_order: '0' 
  });

  const { data: businesses } = useQuery({
    queryKey: ['admin-businesses-list'],
    queryFn: async () => {
      const { data } = await supabase.from('businesses').select('id, trade_name').eq('active', true).order('trade_name');
      return data || [];
    },
  });

  const { data: posts, isLoading } = useQuery({
    queryKey: ['admin-feed-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feed_posts')
        .select('*, businesses(trade_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(form.expires_in || '30'));
      
      // Preparamos os dados para inserção
      const { expires_in, sort_order, images, ...rest } = form;
      
      const { error } = await supabase.from('feed_posts').insert({
        ...rest,
        images: images.length > 0 ? images : (form.image_url ? [form.image_url] : []),
        sort_order: parseInt(sort_order || '0'),
        created_by: user?.id,
        published_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feed-posts'] });
      toast.success('Post criado!');
      setOpen(false);
      setForm({ business_id: '', title: '', description: '', type: 'promotion', image_url: '', images: [], expires_in: '30', sort_order: '0' });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('feed_posts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feed-posts'] });
      toast.success('Post removido!');
    },
  });

  const addImageUrl = () => {
    if (form.image_url.trim()) {
      setForm(prev => ({
        ...prev,
        images: [...prev.images, prev.image_url.trim()],
        image_url: '' // Limpa o campo após adicionar
      }));
    }
  };

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const typeLabels: Record<string, string> = { promotion: 'Promoção', announcement: 'Aviso', sponsored: 'Patrocinado' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Gestão do Feed</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5"><Plus size={16} /> Novo Post</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Novo Post</DialogTitle></DialogHeader>
            <form onSubmit={e => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4">
              <div>
                <Label>Empresa *</Label>
                <Select value={form.business_id} onValueChange={v => setForm(p => ({ ...p, business_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione a empresa" /></SelectTrigger>
                  <SelectContent>
                    {businesses?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.trade_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="promotion">Promoção</SelectItem>
                    <SelectItem value="announcement">Aviso</SelectItem>
                    <SelectItem value="sponsored">Patrocinado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Título *</Label>
                <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} />
              </div>
              
              {/* Seção de Múltiplas Imagens */}
              <div className="space-y-2">
                <Label>Imagens do Carrossel</Label>
                <div className="flex gap-2">
                  <Input 
                    value={form.image_url} 
                    onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} 
                    placeholder="URL da imagem (https://...)" 
                  />
                  <Button type="button" size="icon" variant="outline" onClick={addImageUrl}>
                    <ImagePlus size={18} />
                  </Button>
                </div>
                
                {/* Lista de Imagens Adicionadas */}
                {form.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {form.images.map((url, i) => (
                      <div key={i} className="relative group aspect-square rounded-md overflow-hidden border border-border">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground">Adicione as URLs das imagens uma por uma para criar o carrossel.</p>
              </div>

              <div>
                <Label>Expiração</Label>
                <Select value={form.expires_in} onValueChange={v => setForm(p => ({ ...p, expires_in: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">1 semana</SelectItem>
                    <SelectItem value="14">2 semanas</SelectItem>
                    <SelectItem value="30">1 mês</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ordem (patrocinados)</Label>
                <Input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: e.target.value }))} placeholder="0 = primeiro" />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending || !form.business_id || !form.title}>
                {createMutation.isPending ? 'Publicando...' : 'Publicar'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Imagens</TableHead>
              <TableHead>Expira em</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-16">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : !posts?.length ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum post criado.</TableCell></TableRow>
            ) : (
              posts.map((post: any) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium text-foreground">{post.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{(post.businesses as any)?.trade_name}</TableCell>
                  <TableCell><Badge variant="secondary">{typeLabels[post.type] || post.type}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {post.images?.length || (post.image_url ? 1 : 0)} foto(s)
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {post.expires_at ? new Date(post.expires_at).toLocaleDateString('pt-BR') : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(post.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { if (confirm('Remover post?')) deleteMutation.mutate(post.id); }}>
                      <Trash2 size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}