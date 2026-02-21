import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', username: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock auth — in real app, connect to backend
    localStorage.setItem('cardiocheck_user', JSON.stringify({ email: form.email, username: form.username || 'User' }));
    navigate('/chart');
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-4">
        <div className="bg-card rounded-2xl p-8 border border-border card-medical">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <span className="text-xl font-bold text-foreground">CardioCheck</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground text-center mb-6">
            {isLogin ? t('auth.login') : t('auth.register')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm text-muted-foreground mb-1">{t('auth.username')}</label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={e => setForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}
            <div>
              <label className="block text-sm text-muted-foreground mb-1">{t('auth.email')}</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">{t('auth.password')}</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              type="submit"
              className="w-full hero-gradient text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              {isLogin ? t('auth.submit.login') : t('auth.submit.register')}
            </button>
          </form>

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-center text-sm text-primary mt-4 hover:underline"
          >
            {isLogin ? t('auth.switch.register') : t('auth.switch.login')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
