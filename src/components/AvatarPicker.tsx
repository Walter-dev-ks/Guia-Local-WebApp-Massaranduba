import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getAvatarOptions } from '@/lib/avatars';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';

export function AvatarPicker({ currentUrl }: { currentUrl?: string | null }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const options = getAvatarOptions();

  const handleSelect = async (url: string) => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: url })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      toast.error('Erro ao atualizar avatar.');
    } else {
      queryClient.invalidateQueries({ queryKey: ['user-profile', user.id] });
      toast.success('Avatar atualizado!');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform">
          <Pencil size={12} />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-display">Escolha seu avatar</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-6 gap-3 overflow-y-auto max-h-[50vh] py-2">
          {options.map(opt => (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.url)}
              disabled={saving}
              className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${
                currentUrl === opt.url ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/50'
              }`}
            >
              <img src={opt.url} alt={opt.label} className="w-full h-full" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
