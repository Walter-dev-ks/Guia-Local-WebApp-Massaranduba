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
    // O Supabase envia erros e tokens no fragmento (#) da URL
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const searchParams = new URLSearchParams(location.search);
    
    // Tenta pegar o erro tanto do fragmento (#) quanto da query string (?)
    const error = hashParams.get('error') || searchParams.get('error');
    const description = hashParams.get('error_description') || searchParams.get('error_description');

    if (error) {
      toast.error(description ?? 'Link inválido ou expirado.');
      setIsLoading(false);
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    // ... restante do código (checkToken, etc)


    const checkToken = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Se não houver sessão, significa que o token expirou ou é inválido
        if (!session) {
          toast.error('Link expirado ou inválido. Solicite um novo e-mail.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao verificar token:', error);
        toast.error('Erro ao verificar o link.');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    checkToken();
  }, [navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        toast.error(error.message || 'Erro ao redefinir senha.');
        setLoading(false);
        return;
      }

      toast.success('Senha redefinida com sucesso!');
      
      // Fazer logout e redirecionar para login
      await supabase.auth.signOut();
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      console.error('Erro ao redefinir senha:', err);
      toast.error('Erro ao redefinir senha. Tente novamente.');
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Verificando link...</p>
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
          <p className="text-sm text-muted-foreground mt-1">Digite sua nova senha</p>
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

        <div className="mt-6 text-center">
          <Button
            type="button"
            variant="ghost"
            className="text-sm text-muted-foreground"
            onClick={() => navigate('/login')}
            disabled={loading}
          >
            Voltar para o Login
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ResetPasswordPage;
