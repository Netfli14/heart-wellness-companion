import { useLanguage } from '@/contexts/LanguageContext';
import { Users, Building, Shield, Award, Sparkles } from 'lucide-react';

const team = [
  { name: 'Ержанулы Ерасыл', emoji: '💻' },
  { name: 'Сакпусунова Аружан', emoji: '🔬' },
  { name: 'Билял Амина', emoji: '🎨' },
  { name: 'Джамбыл Лейла', emoji: '📊' },
  { name: 'Мухаметрахим Дана', emoji: '📋' },
];

const About = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">{t('about.title')}</h1>
        </div>

        {/* Mission */}
        <div className="bg-card rounded-2xl p-6 border border-border card-medical">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">{t('about.mission')}</h2>
          </div>
          <p className="text-foreground leading-relaxed">{t('about.missionText')}</p>
        </div>

        {/* Credibility */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-2xl p-5 border border-border card-medical text-center">
            <Award className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="font-semibold text-foreground text-sm">ESC Guidelines</p>
            <p className="text-xs text-muted-foreground">European Society of Cardiology</p>
          </div>
          <div className="bg-card rounded-2xl p-5 border border-border card-medical text-center">
            <Award className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="font-semibold text-foreground text-sm">AHA/ACC</p>
            <p className="text-xs text-muted-foreground">American Heart Association</p>
          </div>
          <div className="bg-card rounded-2xl p-5 border border-border card-medical text-center">
            <Award className="w-8 h-8 text-accent mx-auto mb-2" />
            <p className="font-semibold text-foreground text-sm">WHO Mental Health</p>
            <p className="text-xs text-muted-foreground">World Health Organization</p>
          </div>
        </div>

        {/* Team */}
        <div className="bg-card rounded-2xl p-6 border border-border card-medical">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">{t('about.team')}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.map((m, i) => (
              <div key={i} className="bg-muted/50 rounded-xl p-4 border border-border flex items-center gap-3">
                <span className="text-2xl">{m.emoji}</span>
                <p className="font-semibold text-foreground">{m.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Organization */}
        <div className="bg-card rounded-2xl p-6 border border-border card-medical">
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">{t('about.org')}</h2>
          </div>
          <p className="text-foreground font-medium text-lg mb-3">{t('about.orgName')}</p>
          <p className="text-muted-foreground leading-relaxed">{t('about.orgDesc')}</p>
        </div>
      </div>
    </div>
  );
};

export default About;
