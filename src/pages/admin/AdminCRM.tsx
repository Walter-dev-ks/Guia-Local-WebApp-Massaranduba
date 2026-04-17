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
import { Plus, AlertTriangle, CheckCircle2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { SpecialHoursManager } from '@/components/SpecialHoursManager';
import { useUpdateBusinessSpecialHours } from '@/hooks/useUpdateBusinessSpecialHours';
import type { SpecialHours } from '@/lib/supabase-helpers';

export default function AdminCRM() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);
  const [selectedBiz, setSelectedBiz] = useState<any>(null);
  const [editingHours, setEditingHours] = useState<SpecialHours>({});
  const [specialHoursSupported, setSpecialHoursSupported] = useState(true);
  const [form, setForm] = useState({ notes: '', contact_method: 'phone', data_confirmed: true, changes_made: '' });
  const updateSpecialHours = useUpdateBusinessSpecialHours();

  const { data: businesses, isLoading } = useQuery({
    queryKey: ['admin-crm-businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, trade_name, phone, last_verified_at, active')
        .order('last_verified_at', { ascending: true, nullsFirst: true });
      if (error) throw error;
      return data;
    },
  });

  const fetchSpecialHours = async (bizId: string) => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('special_hours')
        .eq('id', bizId)
        .maybeSingle();
      if (error) throw error;
      setSpecialHoursSupported(true);
      return data?.special_hours || {};
    } catch (error: any) {
      console.error('Erro ao carregar horários especiais:', error);
      setSpecialHoursSupported(false);
      toast.error('Não foi possível carregar horários especiais. Verifique se a coluna special_hours existe no banco.');
      return {} as SpecialHours;
    }
  };

  const verifyMutation = useMutation({
    mutationFn: async () => {
      if (!selectedBiz || !user) return;
      const { error: logError } = await supabase.from('verification_logs').insert({
        business_id: selectedBiz.id,
        verified_by: user.id,
        notes: form.notes,
        contact_method: form.contact_method,
        data_confirmed: form.data_confirmed,
        changes_made: form.changes_made,
      });
      if (logError) throw logError;

      const { error: updateError } = await supabase
        .from('businesses')
        .update({ last_verified_at: new Date().toISOString(), verified: true })
        .eq('id', selectedBiz.id);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-crm-businesses'] });
      toast.success('Verificação registrada!');
      setOpen(false);
      setSelectedBiz(null);
      setForm({ notes: '', contact_method: 'phone', data_confirmed: true, changes_made: '' });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const isOverdue = (date: string | null) => {
    if (!date) return true;
    const diff = Date.now() - new Date(date).getTime();
    return diff > 30 * 24 * 60 * 60 * 1000;
  };

  const openVerify = (biz: any) => {
    setSelectedBiz(biz);
    setOpen(true);
  };

  const openEditHours = async (biz: any) => {
    setSelectedBiz(biz);
    setHoursOpen(true);
    const hours = await fetchSpecialHours(biz.id);
    setEditingHours(hours);
  };

  const handleSaveHours = async () => {
    if (!selectedBiz) return;
    if (!specialHoursSupported) {
      toast.error('Horários especiais não estão disponíveis no banco de dados.');
      return;
    }

    try {
      await updateSpecialHours.mutateAsync({
        businessId: selectedBiz.id,
        specialHours: editingHours,
      });
      setHoursOpen(false);
      setSelectedBiz(null);
      setEditingHours({});
    } catch (e) {
      console.error('Erro ao salvar horários:', e);
      toast.error('Erro ao salvar horários especiais.');
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">CRM de Verificação</h1>

      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) setSelectedBiz(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Verificação - {selectedBiz?.trade_name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); verifyMutation.mutate(); }} className="space-y-4">
            <div>
              <Label>Método de Contato</Label>
              <Select value={form.contact_method} onValueChange={v => setForm(p => ({ ...p, contact_method: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Telefone</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="in_person">Presencial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.data_confirmed} onChange={e => setForm(p => ({ ...p, data_confirmed: e.target.checked }))} />
                Dados confirmados sem alterações
              </label>
            </div>
            {!form.data_confirmed && (
              <div>
                <Label>Alterações realizadas</Label>
                <Textarea value={form.changes_made} onChange={e => setForm(p => ({ ...p, changes_made: e.target.value }))} rows={2} />
              </div>
            )}
            <div>
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
            </div>
            <Button type="submit" className="w-full" disabled={verifyMutation.isPending}>
              {verifyMutation.isPending ? 'Registrando...' : 'Registrar Verificação'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={hoursOpen} onOpenChange={v => { setHoursOpen(v); if (!v) { setSelectedBiz(null); setEditingHours({}); setSpecialHoursSupported(true); } }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar size={20} /> Horários Especiais - {selectedBiz?.trade_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!specialHoursSupported ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                Horários especiais não estão disponíveis neste banco de dados. Verifique se a coluna <code>special_hours</code> existe na tabela <code>businesses</code>.
              </div>
            ) : (
              <SpecialHoursManager
                specialHours={editingHours}
                onChange={setEditingHours}
              />
            )}
            <Button onClick={handleSaveHours} className="w-full" disabled={updateSpecialHours.isPending || !specialHoursSupported}>
              {updateSpecialHours.isPending ? 'Salvando...' : 'Salvar Horários Especiais'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Última Verificação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-32">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : !businesses?.length ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhuma empresa cadastrada.</TableCell></TableRow>
            ) : (
              businesses.map((biz: any) => {
                const overdue = isOverdue(biz.last_verified_at);
                return (
                  <TableRow key={biz.id} className={overdue ? 'bg-destructive/5' : ''}>
                    <TableCell className="font-medium text-foreground">{biz.trade_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{biz.phone}</TableCell>
                    <TableCell className="text-sm">
                      {biz.last_verified_at
                        ? new Date(biz.last_verified_at).toLocaleDateString('pt-BR')
                        : <span className="text-destructive font-medium">Nunca verificado</span>
                      }
                    </TableCell>
                    <TableCell>
                      {overdue ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle size={12} /> Desatualizado
                        </Badge>
                      ) : (
                        <Badge variant="default" className="gap-1 bg-accent text-accent-foreground">
                          <CheckCircle2 size={12} /> Em dia
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openVerify(biz)}>
                          Verificar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openEditHours(biz)} className="gap-1">
                          <Calendar size={14} /> Horários
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
