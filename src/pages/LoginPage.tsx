import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Mail, Chrome } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Login realizado com sucesso!');
      navigate('/');
    }
    setLoading(false);
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast.error('Digite seu e-mail para redefinir a senha.');
      return;
    }

    if (emailCooldown > 0) {
      toast.error('Aguarde um momento antes de tentar novamente.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    if (error) {
      toast.error(
        error.message.includes('rate limit')
          ? 'Muitas solicitações. Aguarde alguns minutos e tente novamente.'
          : error.message
      );
      setEmailCooldown(60);
    } else {
      toast.success('E-mail de redefinição enviado! Verifique sua caixa de entrada.');
      setEmailCooldown(60);
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (emailCooldown > 0) {
      toast.error('Aguarde um momento antes de tentar novamente.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      toast.error(
        error.message.includes('rate limit')
          ? 'Muitas solicitações. Aguarde alguns minutos e tente novamente.'
          : error.message
      );
      setEmailCooldown(60);
    } else {
      toast.success('Conta criada! Verifique seu e-mail para confirmar.');
      setEmailCooldown(60);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error(error.message);
  };

  useEffect(() => {
    if (!emailCooldown) return;

    const timer = window.setInterval(() => {
      setEmailCooldown(prev => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [emailCooldown]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">Bem-vindo ao Guia Local</h1>
          <p className="text-sm text-muted-foreground mt-1">Entre ou crie sua conta para interagir</p>
        </div>

        <Button
          variant="outline"
          className="w-full gap-2 mb-6 h-11"
          onClick={handleGoogleLogin}
        >
          <Chrome size={18} />
          Entrar com Google
        </Button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">ou com e-mail</span>
          </div>
        </div>

        <Tabs defaultValue="login">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="login" className="flex-1">Entrar</TabsTrigger>
            <TabsTrigger value="signup" className="flex-1">Criar Conta</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email">E-mail</Label>
                <Input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="login-password">Senha</Label>
                <Input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                <Mail size={16} />
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
              <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="ghost"
                className="text-sm text-muted-foreground hover:text-foreground justify-start"
                disabled={loading || emailCooldown > 0}
                onClick={handlePasswordReset}
              >
                Esqueci minha senha
              </Button>
              {emailCooldown > 0 && (
                <p className="text-xs text-muted-foreground">Aguarde {emailCooldown}s antes de tentar novamente.</p>
              )}
            </div>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="signup-name">Nome completo</Label>
                <Input id="signup-name" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="signup-email">E-mail</Label>
                <Input id="signup-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="signup-password">Senha</Label>
                <Input id="signup-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading || emailCooldown > 0}>
                <Mail size={16} />
                {loading ? 'Criando...' : 'Criar Conta'}
              </Button>
              {emailCooldown > 0 && (
                <p className="text-xs text-muted-foreground">Aguarde {emailCooldown}s antes de tentar novamente.</p>
              )}
            </form>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default LoginPage;
