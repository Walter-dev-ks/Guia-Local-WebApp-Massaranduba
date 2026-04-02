import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {   Plus,Store, MoreHorizontal, Trash2, FolderOpen, ShoppingBag, UtensilsCrossed, Heart, Wrench, GraduationCap, Sparkles, 
  Stethoscope, Car, Home, Briefcase, Music, Camera, Scissors, Dumbbell, Plane, Coffee, BookOpen, 
  Shirt, Dog, Baby, Landmark, Flower2, Palette, Scale, Wifi, Pizza, Pill, Building2,
  Hammer, Bike, Bus, Zap, Smartphone, Monitor, Gamepad2, Mic, Map, Gift, PartyPopper, 
  Wine, Beer, IceCream, Apple, Fish, Beef, Cake, Croissant, Martini, ChefHat, 
  Trophy, Target, Footprints, Trees, Mountain, Waves, Sun, Moon, Cloud,
  DollarSign, Wallet, CreditCard, Shield, Lock, Key, Phone, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useCategories } from '@/hooks/useCategories';
import type { LucideIcon } from 'lucide-react';  // MapPin 

const iconMap: Record<string, { icon: LucideIcon; label: string }> = {
  Store: { icon: Store, label: 'Comércio Local' },
  MoreHorizontal: { icon: MoreHorizontal, label: 'Outros' },
  ShoppingBag: { icon: ShoppingBag, label: 'Compras' },
  UtensilsCrossed: { icon: UtensilsCrossed, label: 'Restaurante' },
  Heart: { icon: Heart, label: 'Saúde' },
  Wrench: { icon: Wrench, label: 'Serviços' },
  GraduationCap: { icon: GraduationCap, label: 'Educação' },
  Sparkles: { icon: Sparkles, label: 'Beleza' },
  Stethoscope: { icon: Stethoscope, label: 'Médico' },
  Car: { icon: Car, label: 'Automotivo' },
  Home: { icon: Home, label: 'Casa' },
  Briefcase: { icon: Briefcase, label: 'Negócios' },
  Music: { icon: Music, label: 'Música' },
  Camera: { icon: Camera, label: 'Fotografia' },
  Scissors: { icon: Scissors, label: 'Barbearia' },
  Dumbbell: { icon: Dumbbell, label: 'Academia' },
  Plane: { icon: Plane, label: 'Viagem' },
  Coffee: { icon: Coffee, label: 'Cafeteria' },
  BookOpen: { icon: BookOpen, label: 'Livraria' },
  Shirt: { icon: Shirt, label: 'Vestuário' },
  Dog: { icon: Dog, label: 'Pet Shop' },
  Baby: { icon: Baby, label: 'Infantil' },
  Landmark: { icon: Landmark, label: 'Governo' },
  Flower2: { icon: Flower2, label: 'Floricultura' },
  Palette: { icon: Palette, label: 'Arte' },
  Scale: { icon: Scale, label: 'Jurídico' },
  Wifi: { icon: Wifi, label: 'Tecnologia' },
  Pizza: { icon: Pizza, label: 'Pizzaria' },
  Pill: { icon: Pill, label: 'Farmácia' },
  Building2: { icon: Building2, label: 'Imobiliária' },
  Hammer: { icon: Hammer, label: 'Construção/Reparos' },
  Bike: { icon: Bike, label: 'Ciclismo/Esporte' },
  Bus: { icon: Bus, label: 'Transporte' },
  Zap: { icon: Zap, label: 'Elétrica/Energia' },
  Smartphone: { icon: Smartphone, label: 'Celulares' },
  Monitor: { icon: Monitor, label: 'Informática' },
  Gamepad2: { icon: Gamepad2, label: 'Games/Lazer' },
  Mic: { icon: Mic, label: 'Eventos/Voz' },
  Map: { icon: Map, label: 'Turismo' },
  Gift: { icon: Gift, label: 'Presentes' },
  PartyPopper: { icon: PartyPopper, label: 'Festas' },
  Wine: { icon: Wine, label: 'Adega' },
  Beer: { icon: Beer, label: 'Cervejaria/Bar' },
  IceCream: { icon: IceCream, label: 'Sorveteria' },
  Apple: { icon: Apple, label: 'Hortifruti' },
  Fish: { icon: Fish, label: 'Peixaria' },
  Beef: { icon: Beef, label: 'Açougue' },
  Cake: { icon: Cake, label: 'Confeitaria' },
  Croissant: { icon: Croissant, label: 'Padaria' },
  Martini: { icon: Martini, label: 'Drinks' },
  ChefHat: { icon: ChefHat, label: 'Gastronomia' },
  Trophy: { icon: Trophy, label: 'Esportes/Prêmios' },
  Target: { icon: Target, label: 'Estratégia/Jogos' },
  Footprints: { icon: Footprints, label: 'Calçados' },
  Trees: { icon: Trees, label: 'Parques/Natureza' },
  Mountain: { icon: Mountain, label: 'Aventura' },
  Waves: { icon: Waves, label: 'Praia/Piscina' },
  Sun: { icon: Sun, label: 'Verão/Luz' },
  Moon: { icon: Moon, label: 'Noite' },
  Cloud: { icon: Cloud, label: 'Clima' },
  DollarSign: { icon: DollarSign, label: 'Financeiro' },
  Wallet: { icon: Wallet, label: 'Carteira' },
  CreditCard: { icon: CreditCard, label: 'Pagamentos' },
  Shield: { icon: Shield, label: 'Segurança' },
  Lock: { icon: Lock, label: 'Cadeados/Chaveiro' },
  Key: { icon: Key, label: 'Imóveis/Acesso' },
  Phone: { icon: Phone, label: 'Telefonia' },
  MessageSquare: { icon: MessageSquare, label: 'Comunicação' },
};

const iconOptions = Object.keys(iconMap);

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const { data: categories, isLoading } = useCategories();
  const [catOpen, setCatOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', slug: '', icon: 'ShoppingBag', sort_order: 0 });
  const [subForm, setSubForm] = useState({ name: '', slug: '', category_id: '', sort_order: 0 });

  const createCategory = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('categories').insert(catForm);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria criada!');
      setCatOpen(false);
      setCatForm({ name: '', slug: '', icon: 'ShoppingBag', sort_order: 0 });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const createSubcategory = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('subcategories').insert(subForm);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Subcategoria criada!');
      setSubOpen(false);
      setSubForm({ name: '', slug: '', category_id: '', sort_order: 0 });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria removida!');
    },
  });

  const deleteSubcategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subcategories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Subcategoria removida!');
    },
  });

  const renderIcon = (iconName: string, size = 16) => {
    const entry = iconMap[iconName];
    if (!entry) return null;
    const IconComp = entry.icon;
    return <IconComp size={size} />;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Categorias</h1>
        <div className="flex gap-2">
          <Dialog open={subOpen} onOpenChange={setSubOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-1.5"><FolderOpen size={16} /> Nova Subcategoria</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova Subcategoria</DialogTitle></DialogHeader>
              <form onSubmit={e => { e.preventDefault(); createSubcategory.mutate(); }} className="space-y-4">
                <div>
                  <Label>Categoria pai *</Label>
                  <Select value={subForm.category_id} onValueChange={v => setSubForm(p => ({ ...p, category_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {categories?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nome *</Label>
                  <Input value={subForm.name} onChange={e => setSubForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div>
                  <Label>Slug *</Label>
                  <Input value={subForm.slug} onChange={e => setSubForm(p => ({ ...p, slug: e.target.value }))} required placeholder="ex: mercados" />
                </div>
                <Button type="submit" className="w-full" disabled={createSubcategory.isPending}>Criar</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={catOpen} onOpenChange={setCatOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5"><Plus size={16} /> Nova Categoria</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova Categoria</DialogTitle></DialogHeader>
              <form onSubmit={e => { e.preventDefault(); createCategory.mutate(); }} className="space-y-4">
                <div>
                  <Label>Nome *</Label>
                  <Input value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div>
                  <Label>Slug *</Label>
                  <Input value={catForm.slug} onChange={e => setCatForm(p => ({ ...p, slug: e.target.value }))} required placeholder="ex: uteis" />
                </div>
                <div>
                  <Label>Ícone</Label>
                  <Select value={catForm.icon} onValueChange={v => setCatForm(p => ({ ...p, icon: v }))}>
                    <SelectTrigger>
                      <SelectValue>
                        <span className="flex items-center gap-2">
                          {renderIcon(catForm.icon, 16)}
                          {iconMap[catForm.icon]?.label || catForm.icon}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {iconOptions.map(key => {
                        const entry = iconMap[key];
                        const IconComp = entry.icon;
                        return (
                          <SelectItem key={key} value={key}>
                            <span className="flex items-center gap-2">
                              <IconComp size={16} />
                              {entry.label}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={createCategory.isPending}>Criar</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Subcategorias</TableHead>
              <TableHead className="w-16">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : !categories?.length ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Nenhuma categoria.</TableCell></TableRow>
            ) : (
              categories.map((cat: any) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium text-foreground">
                    <span className="flex items-center gap-2">
                      {renderIcon(cat.icon, 16)}
                      {cat.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{cat.slug}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {cat.subcategories?.map((sub: any) => (
                        <span key={sub.id} className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                          {sub.name}
                          <button onClick={() => { if (confirm('Remover?')) deleteSubcategory.mutate(sub.id); }} className="text-destructive hover:text-destructive/80">
                            <Trash2 size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { if (confirm('Remover categoria e subcategorias?')) deleteCategory.mutate(cat.id); }}>
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
