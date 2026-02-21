import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    email: '', password: '', fullName: '', age: '', gender: '',
    city: '', chronicDiseases: '', allergies: '', badHabits: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      // Login: check stored user
      const stored = localStorage.getItem('cardiocheck_user');
      if (stored) {
        const user = JSON.parse(stored);
        if (user.email === form.email) {
          navigate('/chart');
          return;
        }
      }
      // Simple mock - just log in
      localStorage.setItem('cardiocheck_user', JSON.stringify({ email: form.email, fullName: 'User' }));
      navigate('/chart');
    } else {
      localStorage.setItem('cardiocheck_user', JSON.stringify({
        email: form.email, fullName: form.fullName, age: form.age,
        gender: form.gender, city: form.city,
        chronicDiseases: form.chronicDiseases, allergies: form.allergies, badHabits: form.badHabits,
      }));
      navigate('/analysis');
    }
  };

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const inputClass = "w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <div className="w-full max-w-lg mx-auto px-4">
        <div className="bg-card rounded-2xl p-8 border border-border card-medical">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <span className="text-xl font-bold text-foreground">CardioCheck</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground text-center mb-6">
            {isLogin ? t('auth.login') : t('auth.register')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">{t('auth.fullName')}</label>
                    <input type="text" required value={form.fullName} onChange={e => update('fullName', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">{t('auth.age')}</label>
                    <input type="number" required min="1" max="120" value={form.age} onChange={e => update('age', e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">{t('auth.gender')}</label>
                    <select required value={form.gender} onChange={e => update('gender', e.target.value)} className={inputClass}>
                      <option value="">—</option>
                      <option value="male">{t('auth.gender.male')}</option>
                      <option value="female">{t('auth.gender.female')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">{t('auth.city')}</label>
                    <input type="text" required value={form.city} onChange={e => update('city', e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">{t('auth.chronicDiseases')}</label>
                  <input type="text" value={form.chronicDiseases} onChange={e => update('chronicDiseases', e.target.value)} className={inputClass} placeholder={t('auth.chronicDiseases.placeholder')} />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">{t('auth.allergies')}</label>
                  <input type="text" value={form.allergies} onChange={e => update('allergies', e.target.value)} className={inputClass} placeholder={t('auth.allergies.placeholder')} />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">{t('auth.badHabits')}</label>
                  <input type="text" value={form.badHabits} onChange={e => update('badHabits', e.target.value)} className={inputClass} placeholder={t('auth.badHabits.placeholder')} />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm text-muted-foreground mb-1">{t('auth.email')}</label>
              <input type="email" required value={form.email} onChange={e => update('email', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">{t('auth.password')}</label>
              <input type="password" required value={form.password} onChange={e => update('password', e.target.value)} className={inputClass} />
            </div>
            <button type="submit" className="w-full hero-gradient text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity mt-2">
              {isLogin ? t('auth.submit.login') : t('auth.submit.register')}
            </button>
          </form>

          <button onClick={() => setIsLogin(!isLogin)} className="w-full text-center text-sm text-primary mt-4 hover:underline">
            {isLogin ? t('auth.switch.register') : t('auth.switch.login')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
