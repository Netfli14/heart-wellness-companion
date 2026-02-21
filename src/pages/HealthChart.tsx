import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { Lock, AlertTriangle, ArrowRight, Hospital, Plus, BookOpen } from 'lucide-react';

const HealthChart = () => {
  const { t, lang } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [analyses, setAnalyses] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('cardiocheck_user');
    if (stored) setUser(JSON.parse(stored));
    const storedAnalyses = localStorage.getItem('cardiocheck_analyses');
    if (storedAnalyses) setAnalyses(JSON.parse(storedAnalyses));
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

  const latest = analyses.length > 0 ? analyses[analyses.length - 1] : null;

  const symptomsData = analyses.map((a, i) => ({
    name: `${t('chart.analysis')} ${i + 1}`,
    normal: 85,
    user: a.symptomsChartScore ?? 50,
  }));

  const bloodData = analyses.filter(a => a.bloodChartScore != null).map((a, i) => ({
    name: `${t('chart.analysis')} ${i + 1}`,
    normal: 85,
    user: a.bloodChartScore ?? 50,
  }));

  const CustomTooltipSymptoms = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    const normalPoint = payload.find((p: any) => p.dataKey === 'normal');
    const userPoint = payload.find((p: any) => p.dataKey === 'user');
    const idx = symptomsData.findIndex(d => d.name === label);
    const analysis = analyses[idx];
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg max-w-xs">
        <p className="font-semibold text-foreground text-sm mb-1">{label}</p>
        {normalPoint && <p className="text-sm text-primary">{t('chart.normal')}: {normalPoint.value}</p>}
        {userPoint && <p className="text-sm text-accent">{t('chart.yours')}: {userPoint.value}</p>}
        {analysis?.normalSymptomsInfo && <p className="text-xs text-muted-foreground mt-1">{analysis.normalSymptomsInfo}</p>}
      </div>
    );
  };

  const CustomTooltipBlood = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    const normalPoint = payload.find((p: any) => p.dataKey === 'normal');
    const userPoint = payload.find((p: any) => p.dataKey === 'user');
    const bloodAnalyses = analyses.filter(a => a.bloodChartScore != null);
    const idx = bloodData.findIndex(d => d.name === label);
    const analysis = bloodAnalyses[idx];
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg max-w-xs">
        <p className="font-semibold text-foreground text-sm mb-1">{label}</p>
        {normalPoint && <p className="text-sm text-primary">{t('chart.normal')}: {normalPoint.value}</p>}
        {userPoint && <p className="text-sm text-accent">{t('chart.yours')}: {userPoint.value}</p>}
        {analysis?.normalBloodInfo && <p className="text-xs text-muted-foreground mt-1">{analysis.normalBloodInfo}</p>}
      </div>
    );
  };

  const riskColor = !latest ? 'text-muted-foreground' :
    latest.riskScore <= 30 ? 'text-green-600' :
    latest.riskScore <= 60 ? 'text-yellow-600' : 'text-accent';

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">{t('chart.title')}</h1>
          <Link to="/analysis" className="flex items-center gap-2 hero-gradient px-4 py-2 rounded-xl text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> {t('results.newAnalysis')}
          </Link>
        </div>

        {analyses.length === 0 ? (
          <div className="bg-card rounded-2xl p-12 border border-border card-medical text-center">
            <p className="text-muted-foreground mb-4">{t('chart.noData')}</p>
            <Link to="/analysis" className="inline-flex hero-gradient px-6 py-3 rounded-xl font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              {t('results.newAnalysis')}
            </Link>
          </div>
        ) : (
          <>
            {/* Symptoms Chart */}
            <div className="bg-card rounded-2xl p-6 border border-border card-medical">
              <h2 className="text-lg font-bold text-foreground mb-2">{t('chart.symptoms')}</h2>
              <p className="text-xs text-muted-foreground mb-4">{t('chart.xAxis')} · {t('chart.yAxis')}</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={symptomsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltipSymptoms />} />
                  <Legend />
                  <Line type="monotone" dataKey="normal" name={t('chart.normal')} stroke="hsl(174, 62%, 38%)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  <Line type="monotone" dataKey="user" name={t('chart.yours')} stroke="hsl(0, 78%, 55%)" strokeWidth={2} dot={{ r: 5, fill: 'hsl(0, 78%, 55%)', cursor: 'pointer' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Blood Chart */}
            {bloodData.length > 0 && (
              <div className="bg-card rounded-2xl p-6 border border-border card-medical">
                <h2 className="text-lg font-bold text-foreground mb-2">{t('chart.blood')}</h2>
                <p className="text-xs text-muted-foreground mb-4">{t('chart.xAxis')} · {t('chart.yAxis')}</p>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={bloodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltipBlood />} />
                    <Legend />
                    <Line type="monotone" dataKey="normal" name={t('chart.normal')} stroke="hsl(174, 62%, 38%)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="user" name={t('chart.yours')} stroke="hsl(210, 78%, 55%)" strokeWidth={2} dot={{ r: 5, fill: 'hsl(210, 78%, 55%)', cursor: 'pointer' }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* AI Verdict */}
            {latest && (
              <>
                <div className="bg-card rounded-2xl p-6 border border-border card-medical">
                  <h2 className="text-lg font-bold text-foreground mb-3">{t('results.verdict')}</h2>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{latest.verdict}</p>
                </div>

                {/* Risk Score */}
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

                {/* Diseases */}
                {latest.diseases?.length > 0 && (
                  <div className="bg-card rounded-2xl p-6 border border-border card-medical">
                    <h2 className="text-lg font-bold text-foreground mb-4">{t('results.diseases')}</h2>
                    <div className="space-y-2">
                      {latest.diseases.map((d: any, i: number) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm text-foreground">{d.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${d.risk <= 30 ? 'bg-green-500' : d.risk <= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${d.risk}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground w-8 text-right">{d.risk}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Measures Table */}
                <div className="bg-card rounded-2xl p-6 border border-border card-medical">
                  <h2 className="text-lg font-bold text-foreground mb-4">{t('results.measures')}</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground text-sm mb-2 text-primary">{t('results.shortTerm')}</h3>
                      <ul className="space-y-1.5">
                        {(latest.shortTermMeasures || []).map((m: string, i: number) => (
                          <li key={i} className="text-sm text-foreground flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm mb-2 text-accent">{t('results.longTerm')}</h3>
                      <ul className="space-y-1.5">
                        {(latest.longTermMeasures || []).map((m: string, i: number) => (
                          <li key={i} className="text-sm text-foreground flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Medical References */}
                {latest.references?.length > 0 && (
                  <div className="bg-card rounded-2xl p-6 border border-border card-medical">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-bold text-foreground">{t('results.references')}</h2>
                    </div>
                    <div className="space-y-2">
                      {latest.references.map((ref: any, i: number) => (
                        <div key={i} className="bg-muted/50 rounded-xl p-3 border border-border">
                          <a href={ref.url} target="_blank" rel="noopener noreferrer"
                            className="text-sm font-medium text-primary hover:underline">
                            {ref.title}
                          </a>
                          {ref.relevance && <p className="text-xs text-muted-foreground mt-1">{ref.relevance}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hospital Warning */}
                {latest.needsHospital && (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-accent font-bold mb-1">{t('results.hospitalWarning')}</p>
                        {latest.hospitalMessage && <p className="text-sm text-foreground">{latest.hospitalMessage}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Next Analysis */}
                <div className="bg-muted/50 rounded-2xl p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-3">{latest.nextAnalysisMessage || t('results.nextAnalysis')}</p>
                  <div className="flex justify-center gap-3">
                    <Link to="/analysis" className="flex items-center gap-2 hero-gradient px-5 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                      <ArrowRight className="w-4 h-4" /> {t('results.newAnalysis')}
                    </Link>
                    <Link to="/hospitals" className="flex items-center gap-2 bg-card border border-border px-5 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                      <Hospital className="w-4 h-4 text-primary" /> {t('results.viewHospitals')}
                    </Link>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HealthChart;
