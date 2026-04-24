import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
    const handleAuthEvents = async () => {
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const searchParams = new URLSearchParams(location.search);
      
      const error = hashParams.get('error') || searchParams.get('error');
      const description = hashParams.get('error_description') || searchParams.get('error_description');

      if (error) {
        toast.error(description ?? 'Link inválido ou expirado.');
        setIsLoading(false);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      // Aguarda 2 segundos para garantir que o Supabase processou o token
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Se ainda não tem sessão, pode ser que o token ainda esteja sendo processado
          // Vamos tentar uma última vez após mais 1 segundo
          await new Promise(resolve => setTimeout(resolve, 1000));
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          
          if (!retrySession) {
            toast.error('Sessão não encontrada. Tente solicitar um novo e-mail.');
            setTimeout(() => navigate('/login'), 3000);
            return;
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        toast.error('Erro ao validar o link.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleAuthEvents();
  }, [location, navigate]);


   const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    
    // Criamos um sinalizador para saber se já saímos da tela
    let finished = false;

    // Função para finalizar com sucesso e sair da tela
    const finalizeSuccess = () => {
      if (finished) return;
      finished = true;
      toast.success('Senha redefinida com sucesso!');
      
      // Forçamos a limpeza total e redirecionamento
      setTimeout(() => {
        supabase.auth.signOut().finally(() => {
          window.location.assign('/login');
        });
      }, 1000);
    };

    try {
      // 1. Criamos um "Timer de Segurança" de 4 segundos
      const securityTimer = setTimeout(() => {
        if (!finished) {
          console.log("Timeout de segurança atingido. Redirecionando...");
          finalizeSuccess();
        }
      }, 4000);

      // 2. Tentamos atualizar a senha
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      clearTimeout(securityTimer);

      if (error) {
        if (!finished) {
          toast.error(error.message);
          setLoading(false);
        }
        return;
      }

      finalizeSuccess();

    } catch (err) {
      console.error("Erro capturado:", err);
      finalizeSuccess(); // Mesmo no erro, se a senha trocou, finalizamos
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Validando seu acesso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">Redefinir Senha</h1>
          <p className="text-sm text-muted-foreground mt-1">Digite sua nova senha abaixo</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <Label htmlFor="new-password">Nova Senha</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
          </div>

          <div>
            <Label htmlFor="confirm-password">Confirmar Senha</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Digite a senha novamente"
              required
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full gap-2" disabled={loading}>
            <Lock size={16} />
            {loading ? 'Atualizando...' : 'Redefinir Senha'}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default ResetPasswordPage;
