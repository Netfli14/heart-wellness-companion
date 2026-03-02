import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Auth = () => {
  const { t } = useLanguage();
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', fullName: '', age: '', gender: '',
    city: '', chronicDiseases: '', allergies: '', badHabits: '', bodyFeatures: '',
    workHours: '', stressResilience: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(form.email, form.password);
        if (error) { toast.error(error.message); return; }
        navigate('/analysis');
      } else {
        const { error } = await signUp(form.email, form.password, form);
        if (error) { toast.error(error.message); return; }
        toast.success(t('auth.checkEmail'));
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  const inputClass = "w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <div className="w-full max-w-lg mx-auto px-4">
        <div className="bg-card rounded-2xl p-8 border border-border card-medical">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">CVX</span>
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">{t('auth.workHours')}</label>
                    <input type="number" min="0" max="168" value={form.workHours} onChange={e => update('workHours', e.target.value)} className={inputClass} placeholder="40" />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">{t('auth.stressResilience')}</label>
                    <select value={form.stressResilience} onChange={e => update('stressResilience', e.target.value)} className={inputClass}>
                      <option value="">—</option>
                      <option value="low">{t('auth.stressResilience.low')}</option>
                      <option value="medium">{t('auth.stressResilience.medium')}</option>
                      <option value="high">{t('auth.stressResilience.high')}</option>
                    </select>
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
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">{t('auth.bodyFeatures')}</label>
                  <textarea value={form.bodyFeatures} onChange={e => update('bodyFeatures', e.target.value)}
                    className={`${inputClass} min-h-[60px] resize-y`} placeholder={t('auth.bodyFeatures.placeholder')} />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm text-muted-foreground mb-1">{t('auth.email')}</label>
              <input type="email" required value={form.email} onChange={e => update('email', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">{t('auth.password')}</label>
              <input type="password" required minLength={6} value={form.password} onChange={e => update('password', e.target.value)} className={inputClass} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full hero-gradient text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity mt-2 disabled:opacity-50">
              {loading ? '...' : isLogin ? t('auth.submit.login') : t('auth.submit.register')}
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
