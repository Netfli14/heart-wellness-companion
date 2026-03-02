import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Brain, ArrowRight, Plus, BookOpen, Info } from 'lucide-react';

const MentalChart = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('cvx_mental_analyses');
    if (stored) setAnalyses(JSON.parse(stored));
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">{t('chart.needAuth')}</h2>
          <Link to="/auth" className="inline-flex hero-gradient px-6 py-3 rounded-xl font-semibold text-primary-foreground">
            {t('chart.register')}
          </Link>
        </div>
      </div>
    );
  }

  const latest = analyses.length > 0 ? analyses[analyses.length - 1] : null;

  const chartData = analyses.map((a, i) => ({
    name: `${t('chart.analysis')} ${i + 1}`,
    normal: 85,
    user: a.mentalScore ?? 50,
  }));

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold text-foreground">{t('mental.dashboard')}</h1>
          </div>
          <Link to="/analysis" className="flex items-center gap-2 mental-gradient px-4 py-2 rounded-xl text-sm font-semibold text-accent-foreground hover:opacity-90">
            <Plus className="w-4 h-4" /> {t('results.newAnalysis')}
          </Link>
        </div>

        {analyses.length === 0 ? (
          <div className="bg-card rounded-2xl p-12 border border-border card-medical text-center">
            <p className="text-muted-foreground mb-4">{t('chart.noData')}</p>
            <Link to="/analysis" className="inline-flex mental-gradient px-6 py-3 rounded-xl font-semibold text-accent-foreground">
              {t('results.newAnalysis')}
            </Link>
          </div>
        ) : (
          <>
            {/* Mental Health Chart */}
            <div className="bg-card rounded-2xl p-6 border border-border card-medical">
              <h2 className="text-lg font-bold text-foreground mb-2">{t('mental.chart.title')}</h2>
              <p className="text-xs text-muted-foreground mb-4">{t('chart.xAxis')} · {t('chart.yAxis')}</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="normal" name={t('chart.normal')} stroke="hsl(280, 60%, 55%)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  <Line type="monotone" dataKey="user" name={t('chart.yours')} stroke="hsl(320, 50%, 50%)" strokeWidth={2} dot={{ r: 5, fill: 'hsl(320, 50%, 50%)' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Verdict */}
            {latest && (
              <>
                <div className="bg-card rounded-2xl p-6 border border-border card-medical">
                  <h2 className="text-lg font-bold text-foreground mb-3">{t('results.verdict')}</h2>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{latest.verdict}</p>
                </div>

                {/* Score */}
                <div className="bg-card rounded-2xl p-6 border border-border card-medical">
                  <h2 className="text-lg font-bold text-foreground mb-4">{t('mental.score')}</h2>
                  <div className="flex items-center gap-4">
                    <div className={`text-5xl font-black ${latest.mentalScore >= 70 ? 'text-green-600' : latest.mentalScore >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {latest.mentalScore}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('results.riskOf100')}</p>
                      <div className="w-48 h-3 bg-muted rounded-full mt-2 overflow-hidden">
                        <div className={`h-full rounded-full ${latest.mentalScore >= 70 ? 'bg-green-500' : latest.mentalScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${latest.mentalScore}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Measures */}
                <div className="bg-card rounded-2xl p-6 border border-border card-medical">
                  <h2 className="text-lg font-bold text-foreground mb-4">{t('results.measures')}</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-sm mb-2 text-accent">{t('results.shortTerm')}</h3>
                      <ul className="space-y-1.5">
                        {(latest.shortTermMeasures || []).map((m: string, i: number) => (
                          <li key={i} className="text-sm text-foreground flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-2 text-primary">{t('results.longTerm')}</h3>
                      <ul className="space-y-1.5">
                        {(latest.longTermMeasures || []).map((m: string, i: number) => (
                          <li key={i} className="text-sm text-foreground flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
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

export default MentalChart;
