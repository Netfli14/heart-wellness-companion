import { Phone, MapPin, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const hospitals = [
  {
    name: 'UMC (University Medical Center)',
    address: { ru: 'Астана, пр. Туран, 36', kz: 'Астана, Тұран даңғылы, 36', en: 'Astana, Turan Ave, 36' },
    phones: [
      { label: 'adult', number: '+7-701-104-18-83' },
      { label: 'child', number: '+7-775-321-80-78' },
    ],
    mapUrl: 'https://maps.google.com/?q=UMC+Astana+Kazakhstan',
    recommended: true,
  },
  {
    name: 'National Scientific Cardiac Surgery Center',
    address: { ru: 'Астана, ул. Туркестан, 10', kz: 'Астана, Түркістан көш., 10', en: 'Astana, Turkestan St, 10' },
    phones: [{ label: 'adult', number: '+7-7172-70-80-70' }],
    mapUrl: 'https://maps.google.com/?q=National+Scientific+Cardiac+Surgery+Center+Astana',
    recommended: true,
  },
  {
    name: 'Medical Center Hospital of the President',
    address: { ru: 'Астана, пр. Мәңгілік Ел, 6', kz: 'Астана, Мәңгілік Ел даңғылы, 6', en: 'Astana, Mangilik El Ave, 6' },
    phones: [{ label: 'adult', number: '+7-7172-70-71-00' }],
    mapUrl: 'https://maps.google.com/?q=Medical+Center+Hospital+of+President+Astana',
    recommended: false,
  },
];

const Hospitals = () => {
  const { t, lang } = useLanguage();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-foreground mb-8 text-center">{t('hospitals.title')}</h1>

        <div className="space-y-4">
          {hospitals.map((h, i) => (
            <div key={i} className="bg-card rounded-2xl p-6 border border-border card-medical">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{h.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {h.address[lang]}
                  </p>
                </div>
                {h.recommended && (
                  <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                    {t('hospitals.recommended')}
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-4">
                {h.phones.map((p, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{t(`hospitals.${p.label}`)}:</span>
                    <a href={`tel:${p.number.replace(/-/g, '')}`} className="text-sm font-medium text-primary hover:underline">
                      {p.number}
                    </a>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <a
                  href={h.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 hero-gradient text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t('hospitals.route')}
                </a>
                <a
                  href={`tel:${h.phones[0].number.replace(/-/g, '')}`}
                  className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {t('hospitals.call')}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hospitals;
