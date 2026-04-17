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
import { Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCategories } from '@/hooks/useCategories';
import { SpecialHoursManager } from '@/components/SpecialHoursManager';
import type { SpecialHours } from '@/lib/supabase-helpers';

const defaultHours = {
  monday: { open: '08:00', close: '18:00', closed: false },
  tuesday: { open: '08:00', close: '18:00', closed: false },
  wednesday: { open: '08:00', close: '18:00', closed: false },
  thursday: { open: '08:00', close: '18:00', closed: false },
  friday: { open: '08:00', close: '18:00', closed: false },
  saturday: { open: '08:00', close: '13:00', closed: false },
  sunday: { open: '00:00', close: '00:00', closed: true },
};

const dayLabels: Record<string, string> = {
  monday: 'Seg', tuesday: 'Ter', wednesday: 'Qua',
  thursday: 'Qui', friday: 'Sex', saturday: 'Sáb', sunday: 'Dom',
};

export default function AdminBusinesses() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const { data: categories } = useCategories();

  const [form, setForm] = useState({
    name: '', trade_name: '', cnpj: '', description: '',
    category_id: '', subcategory_id: '', phone: '', whatsapp: '',
    email: '', website: '', instagram: '', address: '', city: '',
    state: '', zip_code: '', cover_photo: '', hours: defaultHours as any,
    special_hours: {} as SpecialHours,
  });

  const { data: businesses, isLoading } = useQuery({
    queryKey: ['admin-businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*, categories(name), subcategories(name)')
        .order('trade_name');
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editing) {
        const { error } = await supabase.from('businesses').update(data).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('businesses').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
      toast.success(editing ? 'Empresa atualizada!' : 'Empresa cadastrada!');
      setOpen(false);
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('businesses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
      toast.success('Empresa removida!');
    },
  });

  const resetForm = () => {
    setForm({
      name: '', trade_name: '', cnpj: '', description: '',
      category_id: '', subcategory_id: '', phone: '', whatsapp: '',
      email: '', website: '', instagram: '', address: '', city: '',
      state: '', zip_code: '', cover_photo: '', hours: defaultHours,
      special_hours: {},
    });
    setEditing(null);
  };

  const openEdit = (biz: any) => {
    setEditing(biz);
    setForm({
      name: biz.name || '', trade_name: biz.trade_name || '', cnpj: biz.cnpj || '',
      description: biz.description || '', category_id: biz.category_id || '',
      subcategory_id: biz.subcategory_id || '', phone: biz.phone || '',
      whatsapp: biz.whatsapp || '', email: biz.email || '', website: biz.website || '',
      instagram: biz.instagram || '', address: biz.address || '', city: biz.city || '',
      state: biz.state || '', zip_code: biz.zip_code || '', cover_photo: biz.cover_photo || '', 
      hours: biz.hours || defaultHours,
      special_hours: biz.special_hours || {},
    });
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...form,
      subcategory_id: form.subcategory_id || null,
      cover_photo: form.cover_photo || null,
      verified: true,
    });
  };

  const updateHour = (day: string, field: string, value: string | boolean) => {
    setForm(prev => ({
      ...prev,
      hours: { ...prev.hours, [day]: { ...prev.hours[day], [field]: value } },
    }));
  };

  const selectedCategory = categories?.find((c: any) => c.id === form.category_id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Empresas</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-1.5"><Plus size={16} /> Nova Empresa</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Razão Social *</Label>
                  <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div>
                  <Label>Nome Fantasia *</Label>
                  <Input value={form.trade_name} onChange={e => setForm(p => ({ ...p, trade_name: e.target.value }))} required />
                </div>
                <div>
                  <Label>CNPJ</Label>
                  <Input value={form.cnpj} onChange={e => setForm(p => ({ ...p, cnpj: e.target.value }))} />
                </div>
                <div>
                  <Label>Categoria *</Label>
                  <Select value={form.category_id} onValueChange={v => setForm(p => ({ ...p, category_id: v, subcategory_id: '' }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {categories?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {selectedCategory?.subcategories?.length > 0 && (
                  <div>
                    <Label>Subcategoria</Label>
                    <Select value={form.subcategory_id} onValueChange={v => setForm(p => ({ ...p, subcategory_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {selectedCategory.subcategories.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label>Telefone</Label>
                  <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <Label>WhatsApp</Label>
                  <Input value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} />
                </div>
                <div>
                  <Label>E-mail</Label>
                  <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} />
                </div>
                <div>
                  <Label>Instagram</Label>
                  <Input value={form.instagram} onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))} />
                </div>
              </div>

              <div>
                <Label>Foto de Perfil / Logo (URL da imagem)</Label>
                <Input placeholder="https://exemplo.com/logo.png" value={form.cover_photo} onChange={e => setForm(p => ({ ...p, cover_photo: e.target.value }))} />
                {form.cover_photo && (
                  <div className="mt-2 w-20 h-20 rounded-lg border border-border overflow-hidden">
                    <img src={form.cover_photo} alt="Preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label>Endereço</Label>
                  <Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
                </div>
                <div>
                  <Label>CEP</Label>
                  <Input value={form.zip_code} onChange={e => setForm(p => ({ ...p, zip_code: e.target.value }))} />
                </div>
                <div>
                  <Label>Cidade</Label>
                  <Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Input value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} maxLength={2} />
                </div>
              </div>

              {/* Hours */}
              <div>
                <Label className="mb-2 block">Horário de Funcionamento</Label>
                <div className="space-y-2">
                  {Object.entries(form.hours).map(([day, h]: [string, any]) => (
                    <div key={day} className="flex items-center gap-3">
                      <span className="w-10 text-sm font-medium text-foreground">{dayLabels[day]}</span>
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <input type="checkbox" checked={h.closed} onChange={e => updateHour(day, 'closed', e.target.checked)} />
                        Fechado
                      </label>
                      {!h.closed && (
                        <>
                          <Input className="w-24 h-8 text-xs" type="time" value={h.open} onChange={e => updateHour(day, 'open', e.target.value)} />
                          <span className="text-xs text-muted-foreground">às</span>
                          <Input className="w-24 h-8 text-xs" type="time" value={h.close} onChange={e => updateHour(day, 'close', e.target.value)} />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Hours */}
              <SpecialHoursManager 
                specialHours={form.special_hours} 
                onChange={(specialHours) => setForm(p => ({ ...p, special_hours: specialHours }))}
              />

              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Salvando...' : editing ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Verificado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : businesses?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhuma empresa cadastrada
                </TableCell>
              </TableRow>
            ) : (
              businesses?.map((biz: any) => (
                <TableRow key={biz.id}>
                  <TableCell className="font-medium">{biz.trade_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{biz.categories?.name}</TableCell>
                  <TableCell className="text-sm">{biz.phone}</TableCell>
                  <TableCell className="text-sm">{biz.city}</TableCell>
                  <TableCell>
                    {biz.verified && <CheckCircle2 size={16} className="text-accent" />}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(biz)}>
                      <Pencil size={14} />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(biz.id)}>
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
