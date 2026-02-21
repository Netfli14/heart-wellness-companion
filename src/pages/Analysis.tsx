import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Activity, Upload } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const symptomKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'] as const;

const Analysis = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'symptoms' | 'blood'>('symptoms');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [bloodData, setBloodData] = useState({ cholesterol: '', hdl: '', ldl: '', triglycerides: '', glucose: '', hemoglobin: '' });
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleSymptomSubmit = () => {
    const score = Object.values(answers).reduce((acc, v) => acc + (v === 'yes' ? 2 : v === 'sometimes' ? 1 : 0), 0);
    navigate('/results', { state: { type: 'symptoms', score, total: symptomKeys.length * 2 } });
  };

  const handleBloodSubmit = () => {
    navigate('/results', { state: { type: 'blood', data: bloodData } });
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-foreground mb-8 text-center">{t('analysis.title')}</h1>

        {/* Tabs */}
        <div className="flex bg-muted rounded-xl p-1 mb-8">
          <button
            onClick={() => setTab('symptoms')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === 'symptoms' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Heart className="w-4 h-4" /> {t('analysis.tab.symptoms')}
          </button>
          <button
            onClick={() => setTab('blood')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === 'blood' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Activity className="w-4 h-4" /> {t('analysis.tab.blood')}
          </button>
        </div>

        {tab === 'symptoms' ? (
          <div className="space-y-4">
            {symptomKeys.map(q => (
              <div key={q} className="bg-card rounded-xl p-5 border border-border card-medical">
                <p className="text-foreground font-medium mb-3">{t(`analysis.symptoms.${q}`)}</p>
                <div className="flex gap-2">
                  {['yes', 'no', 'sometimes'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setAnswers(prev => ({ ...prev, [q]: opt }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        answers[q] === opt
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t(`analysis.${opt}`)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={handleSymptomSubmit}
              disabled={Object.keys(answers).length < symptomKeys.length}
              className="w-full hero-gradient text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('analysis.submit')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-6 border border-border card-medical">
              <h3 className="text-foreground font-semibold mb-4">{t('analysis.blood.title')}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {(['cholesterol', 'hdl', 'ldl', 'triglycerides', 'glucose', 'hemoglobin'] as const).map(field => (
                  <div key={field}>
                    <label className="block text-sm text-muted-foreground mb-1">{t(`analysis.blood.${field}`)}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={bloodData[field]}
                      onChange={e => setBloodData(prev => ({ ...prev, [field]: e.target.value }))}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Photo upload */}
            <div className="bg-card rounded-xl p-6 border border-border card-medical">
              <p className="text-foreground font-semibold mb-3">{t('analysis.blood.upload')}</p>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm font-medium text-primary">{t('analysis.blood.upload.btn')}</span>
                <span className="text-xs text-muted-foreground mt-1">{t('analysis.blood.upload.hint')}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) setUploadedFile(file.name);
                  }}
                />
              </label>
              {uploadedFile && (
                <p className="text-sm text-primary mt-2">📎 {uploadedFile}</p>
              )}
            </div>

            <button
              onClick={handleBloodSubmit}
              className="w-full hero-gradient text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              {t('analysis.submit')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;
