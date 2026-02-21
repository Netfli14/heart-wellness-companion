import { useLanguage } from '@/contexts/LanguageContext';
import { Users, Building, FileText } from 'lucide-react';

const team = [
  { name: 'Ержанулы Ерасыл', role: 'developer' },
  { name: 'Сакпусунова Аружан', role: 'researchAssistant' },
  { name: 'Нурлан Ерасыл', role: 'leadResearcher' },
  { name: 'Билял Амина', role: 'designer' },
];

const About = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <h1 className="text-3xl font-bold text-foreground text-center">{t('about.title')}</h1>

        {/* Team */}
        <div className="bg-card rounded-2xl p-6 border border-border card-medical">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">{t('about.team')}</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {team.map((m, i) => (
              <div key={i} className="bg-muted/50 rounded-xl p-4 border border-border">
                <p className="font-semibold text-foreground">{m.name}</p>
                <p className="text-sm text-primary">{t(`about.role.${m.role}`)}</p>
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
          <p className="text-foreground font-medium">{t('about.orgName')}</p>
        </div>

        {/* Recommendations */}
        <div className="bg-card rounded-2xl p-6 border border-border card-medical">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">{t('about.recommendations')}</h2>
          </div>
          <p className="text-muted-foreground italic">{t('about.recommendations.empty')}</p>
        </div>
      </div>
    </div>
  );
};

export default About;
