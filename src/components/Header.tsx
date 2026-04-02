import { useState } from 'react';
import { Search, X, User, LogOut, ChevronLeft } from 'lucide-react'; // Adicionei ChevronLeft
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Adicionei useLocation
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationBell } from '@/components/NotificationBell';

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation(); // Hook para saber em qual página estamos
  const { user, isAdmin, signOut } = useAuth();

  // Verifica se NÃO estamos na página inicial
  const isNotHome = location.pathname !== '/';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container max-w-3xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        
        <div className="flex items-center gap-2">
          {/* BOTÃO DE VOLTAR: Aparece apenas se não estiver na Home */}
          {isNotHome && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)} // Volta para a página anterior no histórico
              className="h-9 w-9 rounded-full hover:bg-muted"
            >
              <ChevronLeft size={24} />
            </Button>
          )}

          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-sm">GL</span>
            </div>
            <span className="font-display font-bold text-foreground text-lg hidden sm:block">
              Guia Local
            </span>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar estabelecimentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted border-0 focus-visible:ring-primary/30"
            />
          </div>
        </form>

        <div className="flex items-center gap-1">
          <NotificationBell />
          <ThemeToggle />
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="sm:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {searchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin">Admin</Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={signOut}>
                <LogOut size={16} />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <Link to="/login">
                <User size={16} />
                <span className="hidden sm:inline">Entrar</span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      {searchOpen && (
        <div className="sm:hidden border-t border-border p-3 bg-card">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar estabelecimentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted border-0"
                autoFocus
              />
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
