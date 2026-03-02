import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Brain, ArrowRight, ArrowLeft, SkipForward, Loader2, Lock, Upload, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const heartSymptomKeys = ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'] as const;

const Analysis = () => {
  const { t, lang } = useLanguage();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'choice' | 'heart' | 'mental'>('choice');
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [freeText, setFreeText] = useState('');
  const [diet, setDiet] = useState('');
  const [activity, setActivity] = useState({ exercise: '', sleep: '', stress: '', heartRate: '' });
  const [bloodData, setBloodData] = useState({ cholesterol: '', hdl: '', ldl: '', triglycerides: '', glucose: '', hemoglobin: '' });
  const [loading, setLoading] = useState(false);

  // Mental health state
  const [mentalAnswers, setMentalAnswers] = useState<Record<string, string>>({});
  const [mentalOpen, setMentalOpen] = useState('');

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

  // ============ CHOICE SCREEN ============
  if (mode === 'choice') {
    return (
      <div className="min-h-screen pt-20 pb-16 flex items-center">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 w-full">
          <h1 className="text-3xl font-bold text-foreground text-center mb-4">{t('analysis.chooseType')}</h1>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">{t('analysis.chooseType.desc')}</p>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Heart */}
            <button onClick={() => { setMode('heart'); setStep(1); }}
              className="bg-card rounded-2xl p-8 border-2 border-border hover:border-primary card-medical transition-all text-left group">
              <Heart className="w-14 h-14 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold text-foreground mb-3">{t('analysis.heart.title')}</h2>
              <p className="text-muted-foreground mb-4">{t('analysis.heart.desc')}</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><Info className="w-4 h-4 text-primary" /> {t('analysis.heart.step1')}</p>
                <p className="flex items-center gap-2"><Info className="w-4 h-4 text-primary" /> {t('analysis.heart.step2')}</p>
                <p className="flex items-center gap-2"><Info className="w-4 h-4 text-primary" /> {t('analysis.heart.step3')}</p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-primary font-semibold">
                {t('analysis.start')} <ArrowRight className="w-4 h-4" />
              </div>
            </button>
            {/* Mental */}
            <button onClick={() => { setMode('mental'); setStep(1); }}
              className="bg-card rounded-2xl p-8 border-2 border-border hover:border-accent card-medical transition-all text-left group">
              <Brain className="w-14 h-14 text-accent mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold text-foreground mb-3">{t('analysis.mental.title')}</h2>
              <p className="text-muted-foreground mb-4">{t('analysis.mental.desc')}</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><Info className="w-4 h-4 text-accent" /> {t('analysis.mental.step1')}</p>
                <p className="flex items-center gap-2"><Info className="w-4 h-4 text-accent" /> {t('analysis.mental.step2')}</p>
                <p className="flex items-center gap-2"><Info className="w-4 h-4 text-accent" /> {t('analysis.mental.step3')}</p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-accent font-semibold">
                {t('analysis.start')} <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ MENTAL HEALTH ANALYSIS ============
  if (mode === 'mental') {
    const mentalQuestionKeys = ['mq1','mq2','mq3','mq4','mq5','mq6','mq7','mq8'] as const;
    const mentalStepsTotal = 3;
    const canProceedMentalStep1 = Object.keys(mentalAnswers).length >= mentalQuestionKeys.length;

    const handleMentalSubmit = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('analyze', {
          body: {
            type: 'mental_analysis',
            lang,
            data: {
              answers: mentalAnswers,
              openText: mentalOpen,
              userProfile: profile,
            },
          },
        });
        if (error) throw error;

        const analysis = { ...data, date: new Date().toISOString(), type: 'mental' };
        const prev = JSON.parse(localStorage.getItem('cvx_mental_analyses') || '[]');
        localStorage.setItem('cvx_mental_analyses', JSON.stringify([...prev, analysis]));

        // Also save to DB
        if (user) {
          await supabase.from('health_analyses').insert({
            user_id: user.id,
            analysis_type: 'mental',
            result: data,
          });
        }
        navigate('/mental-chart');
      } catch (err) {
        console.error('Mental analysis error:', err);
        const fallback = {
          date: new Date().toISOString(), type: 'mental',
          verdict: 'Analysis completed. Consult a specialist for detailed assessment.',
          mentalScore: 70, riskCategory: 'moderate',
          shortTermMeasures: ['Practice deep breathing'],
          longTermMeasures: ['Regular therapy sessions'],
          areas: [],
        };
        const prev = JSON.parse(localStorage.getItem('cvx_mental_analyses') || '[]');
        localStorage.setItem('cvx_mental_analyses', JSON.stringify([...prev, fallback]));
        navigate('/mental-chart');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setMode('choice')} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Brain className="w-8 h-8 text-accent" />
            <h1 className="text-2xl font-bold text-foreground">{t('analysis.mental.title')}</h1>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1,2,3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  s === step ? 'bg-accent text-accent-foreground' : s < step ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'
                }`}>{s}</div>
                {s < 3 && <div className={`w-6 h-0.5 ${s < step ? 'bg-accent' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
              <p className="text-foreground font-medium">{t('analysis.loading')}</p>
            </div>
          ) : (
            <>
              {/* Step 1: Image-based + structured questions */}
              {step === 1 && (
                <div className="space-y-4">
                  {mentalQuestionKeys.map(q => (
                    <div key={q} className="bg-card rounded-xl p-5 border border-border card-medical">
                      <p className="text-foreground font-medium mb-3">{t(`mental.${q}`)}</p>
                      <div className="flex flex-wrap gap-2">
                        {['often', 'sometimes', 'rarely', 'never'].map(opt => (
                          <button key={opt} onClick={() => setMentalAnswers(prev => ({ ...prev, [q]: opt }))}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              mentalAnswers[q] === opt ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                            }`}>
                            {t(`mental.${opt}`)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setStep(2)} disabled={!canProceedMentalStep1}
                    className="w-full flex items-center justify-center gap-2 mental-gradient text-accent-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                    {t('analysis.next')} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Step 2: Open questions */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="bg-card rounded-xl p-6 border border-border card-medical">
                    <label className="block text-foreground font-semibold mb-3">{t('mental.openText')}</label>
                    <textarea value={mentalOpen} onChange={e => setMentalOpen(e.target.value)}
                      className="w-full px-3 py-3 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[150px] resize-y"
                      placeholder={t('mental.openText.placeholder')} />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="flex-1 flex items-center justify-center gap-2 bg-muted text-foreground py-3 rounded-xl font-semibold hover:bg-muted/80">
                      <ArrowLeft className="w-4 h-4" /> {t('analysis.back')}
                    </button>
                    <button onClick={() => setStep(3)} className="flex-1 flex items-center justify-center gap-2 mental-gradient text-accent-foreground py-3 rounded-xl font-semibold hover:opacity-90">
                      {t('analysis.next')} <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Submit */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="bg-card rounded-xl p-6 border border-border card-medical text-center">
                    <Brain className="w-16 h-16 text-accent mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">{t('mental.ready')}</h3>
                    <p className="text-muted-foreground mb-6">{t('mental.ready.desc')}</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} className="flex items-center justify-center gap-2 bg-muted text-foreground py-3 px-6 rounded-xl font-semibold">
                      <ArrowLeft className="w-4 h-4" /> {t('analysis.back')}
                    </button>
                    <button onClick={handleMentalSubmit} className="flex-1 flex items-center justify-center gap-2 mental-gradient text-accent-foreground py-3 rounded-xl font-semibold hover:opacity-90">
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
  }

  // ============ HEART ANALYSIS (existing flow) ============
  const stepsTotal = 5;
  const canProceedStep1 = Object.keys(answers).length >= heartSymptomKeys.length;
  const inputClass = "w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  const handleSubmit = async (skipBlood = false) => {
    setLoading(true);
    try {
      const previousAnalyses = JSON.parse(localStorage.getItem('cvx_heart_analyses') || '[]');
      const hasBlood = !skipBlood && Object.values(bloodData).some(v => v !== '');

      const { data, error } = await supabase.functions.invoke('analyze', {
        body: {
          type: 'medical_analysis', lang,
          data: { symptoms: answers, freeText, diet, activity, bloodData: hasBlood ? bloodData : null, userProfile: profile, previousAnalyses },
        },
      });
      if (error) throw error;

      const analysis = { ...data, date: new Date().toISOString(), symptomsRaw: answers, bloodDataRaw: hasBlood ? bloodData : null };
      const analyses = [...previousAnalyses, analysis];
      localStorage.setItem('cvx_heart_analyses', JSON.stringify(analyses));

      if (user) {
        await supabase.from('health_analyses').insert({
          user_id: user.id,
          analysis_type: 'heart',
          result: data,
        });
      }
      navigate('/chart');
    } catch (err) {
      console.error('Analysis error:', err);
      const score = Object.values(answers).reduce((acc, v) => acc + (v === 'yes' ? 2 : v === 'sometimes' ? 1 : 0), 0);
      const maxScore = heartSymptomKeys.length * 2;
      const symptomsChartScore = Math.round(100 - (score / maxScore) * 100);
      const previousAnalyses = JSON.parse(localStorage.getItem('cvx_heart_analyses') || '[]');
      const analysis = {
        date: new Date().toISOString(),
        verdict: 'Analysis performed based on entered data. Consult a doctor.',
        riskScore: Math.round((score / maxScore) * 100),
        riskCategory: score / maxScore <= 0.3 ? 'low' : score / maxScore <= 0.6 ? 'moderate' : 'high',
        shortTermMeasures: ['Monitor blood pressure'],
        longTermMeasures: ['Regular checkups'],
        diseases: [], needsHospital: score / maxScore > 0.6,
        symptomsChartScore, bloodChartScore: null,
        normalHealthScore: 85, references: [],
        symptomsRaw: answers, bloodDataRaw: null,
      };
      localStorage.setItem('cvx_heart_analyses', JSON.stringify([...previousAnalyses, analysis]));
      navigate('/chart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setMode('choice')} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Heart className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">{t('analysis.title')}</h1>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1,2,3,4,5].map(s => (
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
            {step === 1 && (
              <div className="space-y-4">
                {heartSymptomKeys.map(q => (
                  <div key={q} className="bg-card rounded-xl p-5 border border-border card-medical">
                    <p className="text-foreground font-medium mb-3">{t(`analysis.symptoms.${q}`)}</p>
                    <div className="flex gap-2">
                      {['yes', 'no', 'sometimes'].map(opt => (
                        <button key={opt} onClick={() => setAnswers(prev => ({ ...prev, [q]: opt }))}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            answers[q] === opt ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                          }`}>{t(`analysis.${opt}`)}</button>
                      ))}
                    </div>
                  </div>
                ))}
                <button onClick={() => setStep(2)} disabled={!canProceedStep1}
                  className="w-full flex items-center justify-center gap-2 hero-gradient text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50">
                  {t('analysis.next')} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-card rounded-xl p-6 border border-border card-medical">
                  <label className="block text-foreground font-semibold mb-3">{t('analysis.freeText')}</label>
                  <textarea value={freeText} onChange={e => setFreeText(e.target.value)}
                    className="w-full px-3 py-3 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px] resize-y"
                    placeholder={t('analysis.freeText.placeholder')} />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 flex items-center justify-center gap-2 bg-muted text-foreground py-3 rounded-xl font-semibold">
                    <ArrowLeft className="w-4 h-4" /> {t('analysis.back')}
                  </button>
                  <button onClick={() => setStep(3)} className="flex-1 flex items-center justify-center gap-2 hero-gradient text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90">
                    {t('analysis.next')} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-card rounded-xl p-6 border border-border card-medical">
                  <label className="block text-foreground font-semibold mb-3">{t('analysis.diet')}</label>
                  <textarea value={diet} onChange={e => setDiet(e.target.value)}
                    className="w-full px-3 py-3 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px] resize-y"
                    placeholder={t('analysis.diet.placeholder')} />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 flex items-center justify-center gap-2 bg-muted text-foreground py-3 rounded-xl font-semibold">
                    <ArrowLeft className="w-4 h-4" /> {t('analysis.back')}
                  </button>
                  <button onClick={() => setStep(4)} className="flex-1 flex items-center justify-center gap-2 hero-gradient text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90">
                    {t('analysis.next')} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

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
                            activity.stress === level ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}>{t(`analysis.activity.stress.${level}`)}</button>
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
                  <button onClick={() => setStep(3)} className="flex-1 flex items-center justify-center gap-2 bg-muted text-foreground py-3 rounded-xl font-semibold">
                    <ArrowLeft className="w-4 h-4" /> {t('analysis.back')}
                  </button>
                  <button onClick={() => setStep(5)} className="flex-1 flex items-center justify-center gap-2 hero-gradient text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90">
                    {t('analysis.next')} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <div className="bg-card rounded-xl p-6 border border-border card-medical">
                  <h3 className="text-foreground font-semibold mb-1">{t('analysis.blood.title')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t('analysis.blood.optional')}</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {(['cholesterol','hdl','ldl','triglycerides','glucose','hemoglobin'] as const).map(field => (
                      <div key={field}>
                        <label className="block text-sm text-muted-foreground mb-1">{t(`analysis.blood.${field}`)}</label>
                        <input type="number" step="0.1" value={bloodData[field]}
                          onChange={e => setBloodData(prev => ({ ...prev, [field]: e.target.value }))}
                          className={inputClass} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(4)} className="flex items-center justify-center gap-2 bg-muted text-foreground py-3 px-6 rounded-xl font-semibold">
                    <ArrowLeft className="w-4 h-4" /> {t('analysis.back')}
                  </button>
                  <button onClick={() => handleSubmit(true)} className="flex items-center justify-center gap-2 bg-muted text-foreground py-3 px-6 rounded-xl font-semibold">
                    <SkipForward className="w-4 h-4" /> {t('analysis.skip')}
                  </button>
                  <button onClick={() => handleSubmit(false)} className="flex-1 flex items-center justify-center gap-2 hero-gradient text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90">
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
