import { Link } from 'react-router-dom';
import { Heart, Activity, FileText, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import heroImage from '@/assets/hero-heart.jpg';
import { useState, useEffect } from 'react';

const Index = () => {
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('cardiocheck_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const features = [
    { icon: Heart, title: t('features.symptoms.title'), desc: t('features.symptoms.desc'), color: 'text-accent' },
    { icon: Activity, title: t('features.blood.title'), desc: t('features.blood.desc'), color: 'text-primary' },
    { icon: FileText, title: t('features.chart.title'), desc: t('features.chart.desc'), color: 'text-primary' },
    { icon: MapPin, title: t('features.hospitals.title'), desc: t('features.hospitals.desc'), color: 'text-accent' },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Heart Health" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-32">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6 animate-fade-in-up">
              <Heart className="w-8 h-8 text-primary fill-primary pulse-dot" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">CardioCheck</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-in-up-delay-1">
              {t('hero.title')}
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg animate-fade-in-up-delay-2">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in-up-delay-3">
              <Link
                to={user ? '/analysis' : '/auth'}
                className="hero-gradient px-6 py-3 rounded-xl font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-lg"
              >
                {user ? t('nav.analysis') : t('hero.cta')}
              </Link>
              <a href="#features" className="px-6 py-3 rounded-xl font-semibold border border-border text-foreground hover:bg-muted transition-colors">
                {t('hero.cta2')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">{t('features.title')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 card-medical border border-border">
                <f.icon className={`w-10 h-10 mb-4 ${f.color}`} />
                <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
