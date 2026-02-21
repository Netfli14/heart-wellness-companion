import { useState, useEffect } from 'react';
import { Upload, Loader2, ExternalLink, Lock, Pill } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const pharmacies = [
  { name: 'АльфаМед', url: 'https://2giskz.app/astana/geo/70000001040855633' },
  { name: 'Аптека низких цен', url: 'https://2giskz.app/astana/geo/70000001064365417' },
  { name: 'Аптека низких цен (2)', url: 'https://2giskz.app/astana/geo/70000001097256920' },
  { name: 'БИОСФЕРА', url: 'https://2giskz.app/astana/geo/70000001092980841' },
  { name: 'Darymen', url: 'https://2giskz.app/astana/geo/70000001046428080' },
  { name: 'Имран', url: 'https://2giskz.app/astana/geo/70000001041113701' },
  { name: 'DoctorKz', url: 'https://2giskz.app/astana/geo/70000001081808722' },
  { name: 'Europharma', url: 'https://2giskz.app/astana/geo/70000001046166740' },
];

const Medicine = () => {
  const { t, lang } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [prescriptionText, setPrescriptionText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('cardiocheck_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">{t('medicine.needAuth')}</h2>
          <Link to="/auth" className="inline-flex hero-gradient px-6 py-3 rounded-xl font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
            {t('chart.register')}
          </Link>
        </div>
      </div>
    );
  }

  const handleAnalyze = async () => {
    if (!prescriptionText.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze', {
        body: { type: 'prescription', lang, data: { prescriptionText } },
      });
      if (error) throw error;
      setResult(data);
    } catch (err) {
      console.error('Prescription analysis error:', err);
      setResult({
        medications: [{ name: prescriptionText, dosage: '—', purpose: lang === 'ru' ? 'Не удалось определить' : 'Could not determine' }],
        advice: lang === 'ru' ? 'Обратитесь к фармацевту для уточнения.' : 'Consult a pharmacist for clarification.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <h1 className="text-3xl font-bold text-foreground text-center">{t('medicine.title')}</h1>

        {/* Upload / Input */}
        <div className="bg-card rounded-2xl p-6 border border-border card-medical space-y-4">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors">
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-sm font-medium text-primary">{t('medicine.upload.btn')}</span>
            <span className="text-xs text-muted-foreground mt-1">{t('medicine.upload.hint')}</span>
            <input type="file" accept="image/*" className="hidden" onChange={e => {
              const file = e.target.files?.[0];
              if (file) setUploadedFile(file.name);
            }} />
          </label>
          {uploadedFile && <p className="text-sm text-primary">📎 {uploadedFile}</p>}

          <div>
            <label className="block text-sm text-muted-foreground mb-1">{t('medicine.textInput')}</label>
            <textarea value={prescriptionText} onChange={e => setPrescriptionText(e.target.value)}
              className="w-full px-3 py-3 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px] resize-y"
              placeholder={t('medicine.textInput.placeholder')} />
          </div>

          <button onClick={handleAnalyze} disabled={loading || !prescriptionText.trim()}
            className="w-full flex items-center justify-center gap-2 hero-gradient text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('medicine.loading')}</> : <><Pill className="w-4 h-4" /> {t('medicine.analyze')}</>}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-card rounded-2xl p-6 border border-border card-medical">
            <h2 className="text-lg font-bold text-foreground mb-4">{t('medicine.results')}</h2>
            <div className="space-y-3 mb-4">
              {result.medications?.map((med: any, i: number) => (
                <div key={i} className="bg-muted/50 rounded-xl p-4 border border-border">
                  <p className="font-semibold text-foreground">{med.name}</p>
                  <p className="text-sm text-muted-foreground">{med.dosage}</p>
                  <p className="text-sm text-primary">{med.purpose}</p>
                </div>
              ))}
            </div>
            {result.advice && <p className="text-sm text-muted-foreground italic">{result.advice}</p>}
          </div>
        )}

        {/* Pharmacies */}
        <div className="bg-card rounded-2xl p-6 border border-border card-medical">
          <h2 className="text-lg font-bold text-foreground mb-4">{t('medicine.pharmacies')}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {pharmacies.map((p, i) => (
              <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between bg-muted/50 rounded-xl p-4 border border-border hover:border-primary transition-colors">
                <span className="font-medium text-foreground text-sm">{p.name}</span>
                <span className="flex items-center gap-1 text-xs text-primary font-medium">
                  {t('medicine.route')} <ExternalLink className="w-3 h-3" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Medicine;
