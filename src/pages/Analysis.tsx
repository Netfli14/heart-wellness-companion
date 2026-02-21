import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, SkipForward, Loader2, Lock, Upload } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

const symptomKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'] as const;

const Analysis = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState(1); // 1=symptoms, 2=freetext, 3=diet, 4=activity, 5=blood
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [freeText, setFreeText] = useState('');
  const [diet, setDiet] = useState('');
  const [activity, setActivity] = useState({ exercise: '', sleep: '', stress: '', heartRate: '' });
  const [bloodData, setBloodData] = useState({ cholesterol: '', hdl: '', ldl: '', triglycerides: '', glucose: '', hemoglobin: '' });
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cardiocheck_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">{t('analysis.needAuth')}</h2>
          <Link to="/auth" className="inline-flex hero-gradient px-6 py-3 rounded-xl font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
            {t('chart.register')}
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (skipBlood = false) => {
    setLoading(true);
    try {
      const previousAnalyses = JSON.parse(localStorage.getItem('cardiocheck_analyses') || '[]');
      const hasBlood = !skipBlood && Object.values(bloodData).some(v => v !== '');

      const { data, error } = await supabase.functions.invoke('analyze', {
        body: {
          type: 'medical_analysis',
          lang,
          data: {
            symptoms: answers,
            freeText,
            diet,
            activity,
            bloodData: hasBlood ? bloodData : null,
            userProfile: user,
            previousAnalyses,
          },
        },
      });

      if (error) throw error;

      const analysis = {
        ...data,
        date: new Date().toISOString(),
        symptomsRaw: answers,
        bloodDataRaw: hasBlood ? bloodData : null,
      };

      const analyses = [...previousAnalyses, analysis];
      localStorage.setItem('cardiocheck_analyses', JSON.stringify(analyses));
      navigate('/chart');
    } catch (err) {
      console.error('Analysis error:', err);
      const previousAnalyses = JSON.parse(localStorage.getItem('cardiocheck_analyses') || '[]');
      const score = Object.values(answers).reduce((acc, v) => acc + (v === 'yes' ? 2 : v === 'sometimes' ? 1 : 0), 0);
      const maxScore = symptomKeys.length * 2;
      const symptomsChartScore = Math.round(100 - (score / maxScore) * 100);

      const analysis = {
        date: new Date().toISOString(),
        verdict: lang === 'ru' ? 'Анализ выполнен на основе введённых данных. Для более точной оценки обратитесь к врачу.' : lang === 'kz' ? 'Талдау енгізілген деректер негізінде жасалды. Нақтырақ бағалау үшін дәрігерге хабарласыңыз.' : 'Analysis performed based on entered data. Consult a doctor for a more accurate assessment.',
        riskScore: Math.round((score / maxScore) * 100),
        riskCategory: score / maxScore <= 0.3 ? 'low' : score / maxScore <= 0.6 ? 'moderate' : 'high',
        shortTermMeasures: [lang === 'ru' ? 'Контроль давления' : lang === 'kz' ? 'Қысымды бақылау' : 'Monitor blood pressure'],
        longTermMeasures: [lang === 'ru' ? 'Регулярные обследования' : lang === 'kz' ? 'Тұрақты тексерістер' : 'Regular checkups'],
        diseases: [],
        needsHospital: score / maxScore > 0.6,
        hospitalMessage: '',
        nextAnalysisMessage: '',
        symptomsChartScore,
        bloodChartScore: null,
        normalSymptomsInfo: '',
        normalBloodInfo: '',
        references: [],
        symptomsRaw: answers,
        bloodDataRaw: null,
      };

      const analyses = [...previousAnalyses, analysis];
      localStorage.setItem('cardiocheck_analyses', JSON.stringify(analyses));
      navigate('/chart');
    } finally {
      setLoading(false);
    }
  };

  const stepsTotal = 5;
  const canProceedStep1 = Object.keys(answers).length >= symptomKeys.length;

  const inputClass = "w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-foreground mb-4 text-center">{t('analysis.title')}</h1>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                s === step ? 'bg-primary text-primary-foreground' : s < step ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
              }`}>{s}</div>
              {s < 5 && <div className={`w-6 h-0.5 ${s < step ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mb-6">
          {t('analysis.step')} {step} {t('analysis.of')} {stepsTotal} — {t(`analysis.step${step}.title`)}
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-foreground font-medium">{t('analysis.loading')}</p>
          </div>
        ) : (
          <>
            {/* Step 1: Symptoms */}
            {step === 1 && (
              <div className="space-y-4">
                {symptomKeys.map(q => (
                  <div key={q} className="bg-card rounded-xl p-5 border border-border card-medical">
                    <p className="text-foreground font-medium mb-3">{t(`analysis.symptoms.${q}`)}</p>
                    <div className="flex gap-2">
                      {['yes', 'no', 'sometimes'].map(opt => (
                        <button key={opt} onClick={() => setAnswers(prev => ({ ...prev, [q]: opt }))}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            answers[q] === opt ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                          }`}>
                          {t(`analysis.${opt}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button onClick={() => setStep(2)} disabled={!canProceedStep1}
                  className="w-full flex items-center justify-center gap-2 hero-gradient text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                  {t('analysis.next')} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 2: Free text */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-card rounded-xl p-6 border border-border card-medical">
                  <label className="block text-foreground font-semibold mb-3">{t('analysis.freeText')}</label>
                  <textarea value={freeText} onChange={e => setFreeText(e.target.value)}
                    className="w-full px-3 py-3 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px] resize-y"
                    placeholder={t('analysis.freeText.placeholder')} />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 flex items-center justify-center gap-2 bg-muted text-foreground py-3 rounded-xl font-semibold hover:bg-muted/80 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> {t('analysis.back')}
                  </button>
                  <button onClick={() => setStep(3)} className="flex-1 flex items-center justify-center gap-2 hero-gradient text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                    {t('analysis.next')} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Diet */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-card rounded-xl p-6 border border-border card-medical">
                  <label className="block text-foreground font-semibold mb-3">{t('analysis.diet')}</label>
                  <textarea value={diet} onChange={e => setDiet(e.target.value)}
                    className="w-full px-3 py-3 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px] resize-y"
                    placeholder={t('analysis.diet.placeholder')} />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 flex items-center justify-center gap-2 bg-muted text-foreground py-3 rounded-xl font-semibold hover:bg-muted/80 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> {t('analysis.back')}
                  </button>
                  <button onClick={() => setStep(4)} className="flex-1 flex items-center justify-center gap-2 hero-gradient text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                    {t('analysis.next')} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Activity & Heart Rate */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="bg-card rounded-xl p-6 border border-border card-medical space-y-4">
                  <h3 className="text-foreground font-semibold">{t('analysis.activity.title')}</h3>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">{t('analysis.activity.exercise')}</label>
                    <textarea value={activity.exercise} onChange={e => setActivity(prev => ({ ...prev, exercise: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px] resize-y"
                      placeholder={t('analysis.activity.exercise.placeholder')} />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">{t('analysis.activity.sleep')}</label>
                    <input type="text" value={activity.sleep} onChange={e => setActivity(prev => ({ ...prev, sleep: e.target.value }))}
                      className={inputClass} placeholder={t('analysis.activity.sleep.placeholder')} />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">{t('analysis.activity.stress')}</label>
                    <div className="flex gap-2">
                      {['low', 'moderate', 'high'].map(level => (
                        <button key={level} onClick={() => setActivity(prev => ({ ...prev, stress: level }))}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activity.stress === level ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                          }`}>
                          {t(`analysis.activity.stress.${level}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">{t('analysis.activity.heartRate')}</label>
                    <input type="number" min="30" max="220" value={activity.heartRate}
                      onChange={e => setActivity(prev => ({ ...prev, heartRate: e.target.value }))}
                      className={inputClass} placeholder={t('analysis.activity.heartRate.placeholder')} />
                    <p className="text-xs text-muted-foreground mt-1">{t('analysis.activity.heartRate.hint')}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(3)} className="flex-1 flex items-center justify-center gap-2 bg-muted text-foreground py-3 rounded-xl font-semibold hover:bg-muted/80 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> {t('analysis.back')}
                  </button>
                  <button onClick={() => setStep(5)} className="flex-1 flex items-center justify-center gap-2 hero-gradient text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                    {t('analysis.next')} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Blood test */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="bg-card rounded-xl p-6 border border-border card-medical">
                  <h3 className="text-foreground font-semibold mb-1">{t('analysis.blood.title')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t('analysis.blood.optional')}</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {(['cholesterol', 'hdl', 'ldl', 'triglycerides', 'glucose', 'hemoglobin'] as const).map(field => (
                      <div key={field}>
                        <label className="block text-sm text-muted-foreground mb-1">{t(`analysis.blood.${field}`)}</label>
                        <input type="number" step="0.1" value={bloodData[field]}
                          onChange={e => setBloodData(prev => ({ ...prev, [field]: e.target.value }))}
                          className={inputClass} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border card-medical">
                  <p className="text-foreground font-semibold mb-3">{t('analysis.blood.upload')}</p>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium text-primary">{t('analysis.blood.upload.btn')}</span>
                    <span className="text-xs text-muted-foreground mt-1">{t('analysis.blood.upload.hint')}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) setUploadedFile(file.name);
                    }} />
                  </label>
                  {uploadedFile && <p className="text-sm text-primary mt-2">📎 {uploadedFile}</p>}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(4)} className="flex items-center justify-center gap-2 bg-muted text-foreground py-3 px-6 rounded-xl font-semibold hover:bg-muted/80 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> {t('analysis.back')}
                  </button>
                  <button onClick={() => handleSubmit(true)} className="flex items-center justify-center gap-2 bg-muted text-foreground py-3 px-6 rounded-xl font-semibold hover:bg-muted/80 transition-colors">
                    <SkipForward className="w-4 h-4" /> {t('analysis.skip')}
                  </button>
                  <button onClick={() => handleSubmit(false)} className="flex-1 flex items-center justify-center gap-2 hero-gradient text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                    {t('analysis.submit')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Analysis;
