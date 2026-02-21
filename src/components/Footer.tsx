import { Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-card border-t border-border py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <div className="flex items-center justify-center gap-2 text-primary mb-3">
          <Heart className="w-5 h-5 fill-primary" />
          <span className="font-bold text-lg">HeartAI</span>
        </div>
        <p className="text-xs text-muted-foreground mb-1">{t('footer.powered')}</p>
        <p className="text-sm text-muted-foreground mb-1">{t('footer.disclaimer')}</p>
        <p className="text-xs text-muted-foreground">{t('footer.rights')}</p>
      </div>
    </footer>
  );
};

export default Footer;
