import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

async function ensureProfileExists(user: User | null) {
  if (!user) return;

  const fullName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email ??
    'Usuário';

  const profileData: { id: string; full_name?: string } = { id: user.id };
  if (fullName) {
    profileData.full_name = fullName;
  }

  const { error } = await supabase
    .from('profiles')
    .upsert(profileData, { onConflict: 'id' });

  if (error) {
    console.error('Erro ao criar ou atualizar o perfil do usuário:', error);
  }
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let shouldUnmount = false;

    const handleRedirectSession = async () => {
      try {
        const url = window.location.href;
        if (
          url.includes('access_token') ||
          url.includes('refresh_token') ||
          url.includes('type=recovery') ||
          url.includes('error=')
        ) {
          await supabase.auth.getSessionFromUrl({ storeSession: true });
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      } catch (error) {
        console.error('Erro ao processar o callback do Supabase:', error);
      }
    };

    const initAuth = async () => {
      await handleRedirectSession();

      const { data: { session } } = await supabase.auth.getSession();
      if (shouldUnmount) return;

      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await ensureProfileExists(session.user);
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();
        if (!shouldUnmount) setIsAdmin(!!data);
      } else {
        if (!shouldUnmount) setIsAdmin(false);
      }
      if (!shouldUnmount) setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (shouldUnmount) return;
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await ensureProfileExists(session.user);
          const { data } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .eq('role', 'admin')
            .maybeSingle();
          setIsAdmin(!!data);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    initAuth();

    return () => {
      shouldUnmount = true;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
