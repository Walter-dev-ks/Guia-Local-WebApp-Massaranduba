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
import { Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminCRM() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedBiz, setSelectedBiz] = useState<any>(null);
  const [form, setForm] = useState({ notes: '', contact_method: 'phone', data_confirmed: true, changes_made: '' });

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

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Última Verificação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Ação</TableHead>
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
                      <Button size="sm" variant="outline" onClick={() => openVerify(biz)}>
                        Verificar
                      </Button>
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
