import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Rss, ClipboardCheck, Shield, Tags, Users, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/empresas', label: 'Empresas', icon: Building2 },
  { to: '/admin/categorias', label: 'Categorias', icon: Tags },
  { to: '/admin/feed', label: 'Feed', icon: Rss },
  { to: '/admin/crm', label: 'CRM', icon: ClipboardCheck },
  { to: '/admin/moderacao', label: 'Moderação', icon: Shield },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users },
];

export function AdminLayout() {
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-card border-r border-border shrink-0 hidden md:flex flex-col">
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-sm">GL</span>
            </div>
            <span className="font-display font-bold text-foreground">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted w-full transition-colors"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-50 bg-card border-b border-border p-3">
          <div className="flex items-center justify-between">
            <Link to="/admin" className="font-display font-bold text-foreground">GL Admin</Link>
            <div className="flex gap-1 overflow-x-auto">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'p-2 rounded-lg',
                      isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                    )}
                  >
                    <Icon size={18} />
                  </Link>
                );
              })}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
