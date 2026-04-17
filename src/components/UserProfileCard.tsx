import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { User, Star, Award, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AvatarPicker } from '@/components/AvatarPicker';
import { getRandomAvatar } from '@/lib/avatars';
import { useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// 1. Definição das cores dos selos (Adicionado o Desenvolvedor com cor Ciano)
const badgeColors: Record<string, string> = {
  'Iniciante': 'bg-muted text-muted-foreground',
  'Explorador': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  'Avaliador': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  'Expert': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  'Mestre': 'bg-destructive/10 text-destructive',
  'Crítico Renomado': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  'Desenvolvedor': 'bg-cyan-500 text-white shadow-sm border-cyan-400 font-bold',
};

// 2. Lista de níveis para a explicação do Popover
const badgeLevels = [
  { name: 'Iniciante', range: 'Até 10 avaliações', desc: 'Seus primeiros passos!' },
  { name: 'Explorador', range: '11-25 avaliações', desc: 'Descobrindo o app.' },
  { name: 'Avaliador', range: '26-50 avaliações', desc: 'Contribuidor ativo.' },
  { name: 'Expert', range: '51-100 avaliações', desc: 'Referência em opiniões.' },
  { name: 'Mestre', range: '101-250 avaliações', desc: 'Mestre das avaliações.' },
  { name: 'Crítico Renomado', range: '251+ avaliações', desc: 'Elite da comunidade!' },
  { name: 'Desenvolvedor', range: 'Especial', desc: 'Criador e mantenedor do sistema.' },
];

export function UserProfileCard() {
  const { user, isAdmin } = useAuth(); // Pegamos o status de Admin aqui

  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, reviewer_badge, review_count')
        .eq('id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile && !profile.avatar_url && user) {
      const randomAvatar = getRandomAvatar();
      supabase.from('profiles').update({ avatar_url: randomAvatar }).eq('id', user.id).then();
    }
  }, [profile, user]);

  if (!user) {
    return (
      <div className="bg-card rounded-2xl border border-border/50 p-5 mb-6">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
            <User size={24} className="text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Entre para avaliar e interagir</p>
          <Button size="sm" asChild>
            <Link to="/login">Entrar</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  // 3. LÓGICA DO SELO: Se o usuário for Admin, ele ganha o selo de Desenvolvedor automaticamente
  const badge = isAdmin ? 'Desenvolvedor' : (profile.reviewer_badge || 'Iniciante');
  const reviewCount = profile.review_count || 0;
  const badgeClass = badgeColors[badge] || badgeColors['Iniciante'];

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-5 mb-6">
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14 shrink-0">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="font-display font-bold text-primary text-xl">
                {profile.full_name?.charAt(0) || '?'}
              </span>
            )}
          </div>
          <AvatarPicker currentUrl={profile.avatar_url} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-foreground truncate">
            {profile.full_name || 'Usuário'}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star size={14} className="text-amber-400" />
              {reviewCount} {reviewCount === 1 ? 'avaliação' : 'avaliações'}
            </span>
            <Popover>
              <PopoverTrigger asChild>
                <button className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full cursor-pointer hover:opacity-80 transition-opacity ${badgeClass}`}>
                  {/* Ícone de código para Desenvolvedor, medalha para os outros */}
                  {badge === 'Desenvolvedor' ? <Code2 size={12} /> : <Award size={12} />}
                  {badge}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start">
                <h4 className="font-display font-semibold text-foreground text-sm mb-3">
                  Como funcionam os selos:
                </h4>
                <ul className="space-y-2">
                  {badgeLevels.map((level) => (
                    <li key={level.name} className="flex items-start gap-2">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${badgeColors[level.name]}`}>
                        {level.name === 'Desenvolvedor' ? <Code2 size={10} /> : <Award size={10} />}
                        {level.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {level.range} - {level.desc}
                      </span>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
}
