import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Brain, Plus, BookOpen, Info, Pill, Heart, Phone, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const }
};

const EmergencyCallDialog = ({ open, onClose, t }: { open: boolean; onClose: () => void; t: (k: string) => string }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-card rounded-2xl p-8 border border-border max-w-sm mx-4 text-center" onClick={e => e.stopPropagation()}>
        <Phone className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h3 className="text-xl font-bold text-foreground mb-2">{t('emergency.confirm')}</h3>
        <p className="text-muted-foreground mb-6">{t('emergency.confirmDesc')}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-muted text-foreground font-semibold">{t('emergency.cancel')}</button>
          <a href="tel:103" className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground font-bold flex items-center justify-center gap-2">
            <Phone className="w-5 h-5" /> 103
          </a>
        </div>
      </motion.div>
    </div>
  );
};

const VerdictSection = ({ section, index }: { section: { title: string; content: string }; index: number }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div {...fadeInUp} transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] as const, delay: index * 0.1 }}
      className="bg-muted/30 rounded-xl border border-border overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors">
        <span className="font-semibold text-foreground text-sm">{section.title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}>
            <div className="px-4 pb-4">
              <p className="text-sm text-foreground leading-relaxed">{section.content}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const MeasuresList = ({ items, icon: Icon, color, label }: { items: string[]; icon: any; color: string; label: string }) => (
  <div className="bg-muted/30 rounded-xl p-4 border border-border">
    <div className="flex items-center gap-2 mb-3">
      <Icon className={`w-4 h-4 text-${color}`} />
      <h4 className={`font-semibold text-sm text-${color}`}>{label}</h4>
    </div>
    <ul className="space-y-2">
      {items.map((m: string, i: number) => (
        <li key={i} className="text-sm text-foreground flex items-start gap-2">
          <span className={`w-5 h-5 rounded-full bg-${color}/10 text-${color} flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5`}>{i+1}</span>
          <span>{m}</span>
        </li>
      ))}
    </ul>
  </div>
);

const MentalChart = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [showEmergency, setShowEmergency] = useState(false);

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
  const isHighRisk = latest && latest.mentalScore < 30;

  const chartData = analyses.map((a, i) => ({
    name: `${t('chart.analysis')} ${i + 1}`,
    normal: 85,
    user: a.mentalScore ?? 50,
  }));

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        <EmergencyCallDialog open={showEmergency} onClose={() => setShowEmergency(false)} t={t} />

        <motion.div {...fadeInUp} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold text-foreground">{t('mental.dashboard')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowEmergency(true)} className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-xl text-sm font-semibold hover:bg-destructive/20 transition-colors">
              <Phone className="w-4 h-4" /> 103
            </button>
            <Link to="/analysis" className="flex items-center gap-2 mental-gradient px-4 py-2 rounded-xl text-sm font-semibold text-accent-foreground hover:opacity-90">
              <Plus className="w-4 h-4" /> {t('results.newAnalysis')}
            </Link>
          </div>
        </motion.div>

        {analyses.length === 0 ? (
          <div className="bg-card rounded-2xl p-12 border border-border card-medical text-center">
            <p className="text-muted-foreground mb-4">{t('chart.noData')}</p>
            <Link to="/analysis" className="inline-flex mental-gradient px-6 py-3 rounded-xl font-semibold text-accent-foreground">
              {t('results.newAnalysis')}
            </Link>
          </div>
        ) : (
          <>
            {isHighRisk && (
              <motion.div {...fadeInUp} className="bg-destructive/10 border-2 border-destructive rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <ShieldAlert className="w-10 h-10 text-destructive flex-shrink-0" />
                  <div>
                    <h2 className="text-2xl font-black text-destructive mb-2">{t('emergency.highRiskMental')}</h2>
                    <p className="text-foreground font-medium mb-4">{t('emergency.highRiskMentalDesc')}</p>
                    <div className="flex gap-3">
                      <button onClick={() => setShowEmergency(true)} className="flex items-center gap-2 bg-destructive text-destructive-foreground px-6 py-3 rounded-xl font-bold hover:opacity-90">
                        <Phone className="w-5 h-5" /> {t('emergency.call103')}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div {...fadeInUp} className="bg-card rounded-2xl p-6 border border-border card-medical">
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
            </motion.div>

            {latest && (
              <>
                {/* Verdict */}
                <motion.div {...fadeInUp} className="bg-card rounded-2xl p-6 border border-border card-medical">
                  <h2 className="text-lg font-bold text-foreground mb-3">{t('results.verdict')}</h2>
                  <p className="text-sm text-foreground leading-relaxed mb-3">{latest.verdictSummary || latest.verdict}</p>
                  <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-xl p-4 mb-4">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">⚠️ {lang === 'ru' ? 'Настоятельно рекомендуем сначала проконсультироваться с врачом. Не принимайте таблетки без разбора!' : lang === 'kz' ? 'Алдымен дәрігермен кеңесуді қатаң ұсынамыз. Дәрілерді бас-басына қабылдамаңыз!' : 'We strongly recommend consulting a doctor first. Do not take medications indiscriminately!'}</p>
                  </div>
                  {latest.verdictSections?.length > 0 && (
                    <div className="space-y-2">
                      {latest.verdictSections.map((section: any, i: number) => (
                        <VerdictSection key={i} section={section} index={i} />
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Score */}
                <motion.div {...fadeInUp} className="bg-card rounded-2xl p-6 border border-border card-medical">
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
                </motion.div>

                {/* Areas */}
                {latest.areas?.length > 0 && (
                  <motion.div {...fadeInUp} className="bg-card rounded-2xl p-6 border border-border card-medical">
                    <h2 className="text-lg font-bold text-foreground mb-4">{t('mental.areas')}</h2>
                    <div className="space-y-3">
                      {latest.areas.map((area: any, i: number) => (
                        <div key={i} className="bg-muted/30 rounded-xl p-3 border border-border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-foreground">{area.name}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${area.score >= 70 ? 'bg-green-500' : area.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${area.score}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground w-8 text-right">{area.score}</span>
                            </div>
                          </div>
                          {area.description && <p className="text-xs text-muted-foreground mt-1">{area.description}</p>}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Measures - WITHOUT meds first */}
                <motion.div {...fadeInUp} className="bg-card rounded-2xl p-6 border border-border card-medical">
                  <h2 className="text-lg font-bold text-foreground mb-4">{t('results.measures')}</h2>

                  <h3 className="font-semibold text-foreground mb-3">{t('results.shortTerm')}</h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <MeasuresList items={latest.shortTermWithoutMeds || []} icon={Heart} color="accent" label={t('results.withoutMeds')} />
                    <MeasuresList items={latest.shortTermWithMeds || latest.shortTermMeasures || []} icon={Pill} color="primary" label={t('results.withMeds')} />
                  </div>

                  <h3 className="font-semibold text-foreground mb-3">{t('results.longTerm')}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <MeasuresList items={latest.longTermWithoutMeds || []} icon={Heart} color="accent" label={t('results.withoutMeds')} />
                    <MeasuresList items={latest.longTermWithMeds || latest.longTermMeasures || []} icon={Pill} color="primary" label={t('results.withMeds')} />
                  </div>
                </motion.div>

                {/* References */}
                {latest.references?.length > 0 && (
                  <motion.div {...fadeInUp} className="bg-card rounded-2xl p-6 border border-border card-medical">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-5 h-5 text-accent" />
                      <h2 className="text-lg font-bold text-foreground">{t('results.references')}</h2>
                    </div>
                    <div className="space-y-2">
                      {latest.references.map((ref: any, i: number) => (
                        <div key={i} className="bg-muted/50 rounded-xl p-3 border border-border">
                          <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent hover:underline">{ref.title}</a>
                          {ref.relevance && <p className="text-xs text-muted-foreground mt-1">{ref.relevance}</p>}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MentalChart;
