import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Sun, Moon, Globe, Menu, X, LogOut } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { Lang } from '@/i18n/translations';

const langLabels: Record<Lang, string> = { ru: 'РУС', kz: 'ҚАЗ', en: 'ENG' };
const langOptions: Lang[] = ['ru', 'kz', 'en'];

const Navbar = () => {
  const { t, lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('cardiocheck_user');
    if (stored) setUser(JSON.parse(stored));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('cardiocheck_user');
    localStorage.removeItem('cardiocheck_analyses');
    setUser(null);
    navigate('/');
  };

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/analysis', label: t('nav.analysis') },
    { to: '/chart', label: t('nav.chart') },
    { to: '/hospitals', label: t('nav.hospitals') },
    { to: '/medicine', label: t('nav.medicine') },
    { to: '/about', label: t('nav.about') },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
            <Heart className="w-6 h-6 fill-primary" />
            <span className="font-display hidden sm:inline">CardioCheck</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {links.map(link => (
              <Link key={link.to} to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Globe className="w-4 h-4" /> {langLabels[lang]}
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[100px] z-50">
                  {langOptions.map(l => (
                    <button key={l} onClick={() => { setLang(l); setLangOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${lang === l ? 'text-primary font-semibold bg-muted' : 'text-foreground hover:bg-muted'}`}>
                      {langLabels[l]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={toggleTheme} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-foreground font-medium truncate max-w-[120px]">{user.fullName || user.email}</span>
                <button onClick={handleLogout} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title={t('nav.logout')}>
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/auth" className="hidden sm:inline-flex px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                {t('nav.login')}
              </Link>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-card">
          <div className="px-4 py-3 space-y-1">
            {links.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${isActive(link.to) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-accent hover:bg-muted">
                {t('nav.logout')}
              </button>
            ) : (
              <Link to="/auth" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground text-center mt-2">
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
