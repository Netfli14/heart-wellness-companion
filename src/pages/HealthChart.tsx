import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, AlertTriangle, ArrowRight, Hospital, Plus, BookOpen, Info, Stethoscope, Brain, Pill } from 'lucide-react';

const HealthChart = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [dashboardType, setDashboardType] = useState<'health' | 'mental' | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('cvx_heart_analyses');
    if (stored) setAnalyses(JSON.parse(stored));
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">{t('chart.needAuth')}</h2>
          <Link to="/auth" className="inline-flex hero-gradient px-6 py-3 rounded-xl font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
            {t('chart.register')}
          </Link>
        </div>
      </div>
    );
  }

  if (!dashboardType) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full">
          <h1 className="text-3xl font-bold text-center text-foreground mb-2">{t('chart.chooseType')}</h1>
          <p className="text-center text-muted-foreground mb-8">{t('chart.chooseType.desc')}</p>
          <div className="grid md:grid-cols-2 gap-6">
            <button onClick={() => setDashboardType('health')}
              className="bg-card rounded-2xl p-8 border border-border card-medical text-left hover:border-primary transition-colors group">
              <Stethoscope className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-xl font-bold text-foreground mb-2">{t('chart.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('chart.healthDesc')}</p>
            </button>
            <button onClick={() => setDashboardType('mental')}
              className="bg-card rounded-2xl p-8 border border-border card-medical text-left hover:border-accent transition-colors group">
              <Brain className="w-12 h-12 text-accent mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-xl font-bold text-foreground mb-2">{t('mental.dashboard')}</h2>
              <p className="text-sm text-muted-foreground">{t('chart.mentalDesc')}</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (dashboardType === 'mental') {
    navigate('/mental-chart');
    return null;
  }

  const latest = analyses.length > 0 ? analyses[analyses.length - 1] : null;

  const symptomsData = analyses.map((a, i) => ({
    name: `${t('chart.analysis')} ${i + 1}`,
    normal: a.normalHealthScore ?? 85,
    user: a.symptomsChartScore ?? 50,
  }));

  const bloodData = analyses.filter(a => a.bloodChartScore != null).map((a, i) => ({
    name: `${t('chart.analysis')} ${i + 1}`,
    normal: a.normalHealthScore ?? 85,
    user: a.bloodChartScore ?? 50,
  }));

  const riskColor = !latest ? 'text-muted-foreground' :
    latest.riskScore <= 30 ? 'text-green-600' :
    latest.riskScore <= 60 ? 'text-yellow-600' : 'text-destructive';

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setDashboardType(null)} className="text-muted-foreground hover:text-foreground">←</button>
            <Stethoscope className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">{t('chart.title')}</h1>
          </div>
          <Link to="/analysis" className="flex items-center gap-2 hero-gradient px-4 py-2 rounded-xl text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Plus className="w-4 h-4" /> {t('results.newAnalysis')}
          </Link>
        </div>

        {analyses.length === 0 ? (
          <div className="bg-card rounded-2xl p-12 border border-border card-medical text-center">
            <p className="text-muted-foreground mb-4">{t('chart.noData')}</p>
            <Link to="/analysis" className="inline-flex hero-gradient px-6 py-3 rounded-xl font-semibold text-primary-foreground">
              {t('results.newAnalysis')}
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-card rounded-2xl p-6 border border-border card-medical">
              <h2 className="text-lg font-bold text-foreground mb-2">{t('chart.symptoms')}</h2>
              <p className="text-xs text-muted-foreground mb-4">{t('chart.xAxis')} · {t('chart.yAxis')}</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={symptomsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="normal" name={t('chart.normal')} stroke="hsl(220, 70%, 50%)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  <Line type="monotone" dataKey="user" name={t('chart.yours')} stroke="hsl(0, 78%, 55%)" strokeWidth={2} dot={{ r: 5, fill: 'hsl(0, 78%, 55%)' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
              {latest?.normalScoreJustification && (
                <div className="mt-3 flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                  <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{t('chart.normal')}: {latest.normalHealthScore}</span> — {latest.normalScoreJustification}
                  </p>
                </div>
              )}
            </div>

            {bloodData.length > 0 && (
              <div className="bg-card rounded-2xl p-6 border border-border card-medical">
                <h2 className="text-lg font-bold text-foreground mb-2">{t('chart.blood')}</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={bloodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="normal" name={t('chart.normal')} stroke="hsl(220, 70%, 50%)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="user" name={t('chart.yours')} stroke="hsl(210, 78%, 55%)" strokeWidth={2} dot={{ r: 5, fill: 'hsl(210, 78%, 55%)' }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {latest && (
              <>
                <div className="bg-card rounded-2xl p-6 border border-border card-medical">
                  <h2 className="text-lg font-bold text-foreground mb-3">{t('results.verdict')}</h2>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{latest.verdict}</p>
                </div>

                <div className="bg-card rounded-2xl p-6 border border-border card-medical">
                  <h2 className="text-lg font-bold text-foreground mb-4">{t('results.riskScore')}</h2>
                  <div className="flex items-center gap-4">
                    <div className={`text-5xl font-black ${riskColor}`}>{latest.riskScore}</div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('results.riskOf100')}</p>
                      <div className="w-48 h-3 bg-muted rounded-full mt-2 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${latest.riskScore <= 30 ? 'bg-green-500' : latest.riskScore <= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${latest.riskScore}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {latest.diseases?.length > 0 && (
                  <div className="bg-card rounded-2xl p-6 border border-border card-medical">
                    <h2 className="text-lg font-bold text-foreground mb-4">{t('results.diseases')}</h2>
                    <div className="space-y-3">
                      {latest.diseases.map((d: any, i: number) => (
                        <div key={i} className="bg-muted/30 rounded-xl p-3 border border-border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-foreground">{d.name}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${d.risk <= 30 ? 'bg-green-500' : d.risk <= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${d.risk}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground w-8 text-right">{d.risk}%</span>
                            </div>
                          </div>
                          {d.reasoning && <p className="text-xs text-muted-foreground mt-1">{d.reasoning}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Measures - split into with/without meds */}
                <div className="bg-card rounded-2xl p-6 border border-border card-medical">
                  <h2 className="text-lg font-bold text-foreground mb-4">{t('results.measures')}</h2>
                  
                  {/* Short-term */}
                  <h3 className="font-semibold text-foreground mb-3">{t('results.shortTerm')}</h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-muted/30 rounded-xl p-4 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Pill className="w-4 h-4 text-primary" />
                        <h4 className="font-semibold text-sm text-primary">{t('results.withMeds')}</h4>
                      </div>
                      <ul className="space-y-1.5">
                        {(latest.shortTermWithMeds || latest.shortTermMeasures || []).map((m: string, i: number) => (
                          <li key={i} className="text-sm text-foreground flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</span>{m}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-4 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Stethoscope className="w-4 h-4 text-accent" />
                        <h4 className="font-semibold text-sm text-accent">{t('results.withoutMeds')}</h4>
                      </div>
                      <ul className="space-y-1.5">
                        {(latest.shortTermWithoutMeds || []).map((m: string, i: number) => (
                          <li key={i} className="text-sm text-foreground flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</span>{m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Long-term */}
                  <h3 className="font-semibold text-foreground mb-3">{t('results.longTerm')}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-muted/30 rounded-xl p-4 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Pill className="w-4 h-4 text-primary" />
                        <h4 className="font-semibold text-sm text-primary">{t('results.withMeds')}</h4>
                      </div>
                      <ul className="space-y-1.5">
                        {(latest.longTermWithMeds || latest.longTermMeasures || []).map((m: string, i: number) => (
                          <li key={i} className="text-sm text-foreground flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</span>{m}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-4 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Stethoscope className="w-4 h-4 text-accent" />
                        <h4 className="font-semibold text-sm text-accent">{t('results.withoutMeds')}</h4>
                      </div>
                      <ul className="space-y-1.5">
                        {(latest.longTermWithoutMeds || []).map((m: string, i: number) => (
                          <li key={i} className="text-sm text-foreground flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</span>{m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {latest.references?.length > 0 && (
                  <div className="bg-card rounded-2xl p-6 border border-border card-medical">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-bold text-foreground">{t('results.references')}</h2>
                    </div>
                    <div className="space-y-2">
                      {latest.references.map((ref: any, i: number) => (
                        <div key={i} className="bg-muted/50 rounded-xl p-3 border border-border">
                          <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline">{ref.title}</a>
                          {ref.relevance && <p className="text-xs text-muted-foreground mt-1">{ref.relevance}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {latest.needsHospital && (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-destructive font-bold mb-1">{t('results.hospitalWarning')}</p>
                        {latest.hospitalMessage && <p className="text-sm text-foreground">{latest.hospitalMessage}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HealthChart;
