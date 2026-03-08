import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, AlertTriangle, Plus, BookOpen, Info, Stethoscope, Brain, Pill, Phone, ChevronDown, ChevronUp, Heart, ShieldAlert } from 'lucide-react';
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
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
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
    <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: index * 0.1 }}
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

const HealthChart = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [dashboardType, setDashboardType] = useState<'health' | 'mental' | null>(null);
  const [showEmergency, setShowEmergency] = useState(false);

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
          <Link to="/auth" className="inline-flex hero-gradient px-6 py-3 rounded-xl font-semibold text-primary-foreground">
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

  const isHighRisk = latest && latest.riskScore > 70;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        <EmergencyCallDialog open={showEmergency} onClose={() => setShowEmergency(false)} t={t} />

        <motion.div {...fadeInUp} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setDashboardType(null)} className="text-muted-foreground hover:text-foreground">←</button>
            <Stethoscope className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">{t('chart.title')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowEmergency(true)} className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-xl text-sm font-semibold hover:bg-destructive/20 transition-colors">
              <Phone className="w-4 h-4" /> 103
            </button>
            <Link to="/analysis" className="flex items-center gap-2 hero-gradient px-4 py-2 rounded-xl text-sm font-semibold text-primary-foreground hover:opacity-90">
              <Plus className="w-4 h-4" /> {t('results.newAnalysis')}
            </Link>
          </div>
        </motion.div>

        {analyses.length === 0 ? (
          <div className="bg-card rounded-2xl p-12 border border-border card-medical text-center">
            <p className="text-muted-foreground mb-4">{t('chart.noData')}</p>
            <Link to="/analysis" className="inline-flex hero-gradient px-6 py-3 rounded-xl font-semibold text-primary-foreground">
              {t('results.newAnalysis')}
            </Link>
          </div>
        ) : (
          <>
            {/* High risk warning */}
            {isHighRisk && (
              <motion.div {...fadeInUp} className="bg-destructive/10 border-2 border-destructive rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <ShieldAlert className="w-10 h-10 text-destructive flex-shrink-0" />
                  <div>
                    <h2 className="text-2xl font-black text-destructive mb-2">{t('emergency.highRisk')}</h2>
                    <p className="text-foreground font-medium mb-4">{t('emergency.highRiskDesc')}</p>
                    <div className="flex gap-3">
                      <button onClick={() => setShowEmergency(true)} className="flex items-center gap-2 bg-destructive text-destructive-foreground px-6 py-3 rounded-xl font-bold hover:opacity-90">
                        <Phone className="w-5 h-5" /> {t('emergency.call103')}
                      </button>
                      <Link to="/hospitals" className="flex items-center gap-2 bg-card text-foreground px-6 py-3 rounded-xl font-semibold border border-border">
                        {t('results.viewHospitals')}
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Chart */}
            <motion.div {...fadeInUp} className="bg-card rounded-2xl p-6 border border-border card-medical">
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
            </motion.div>

            {bloodData.length > 0 && (
              <motion.div {...fadeInUp} className="bg-card rounded-2xl p-6 border border-border card-medical">
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
              </motion.div>
            )}

            {latest && (
              <>
                {/* Verdict with sections */}
                <motion.div {...fadeInUp} className="bg-card rounded-2xl p-6 border border-border card-medical">
                  <h2 className="text-lg font-bold text-foreground mb-3">{t('results.verdict')}</h2>
                  <p className="text-sm text-foreground leading-relaxed mb-4">{latest.verdictSummary || latest.verdict}</p>
                  {latest.verdictSections?.length > 0 && (
                    <div className="space-y-2">
                      {latest.verdictSections.map((section: any, i: number) => (
                        <VerdictSection key={i} section={section} index={i} />
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Risk Score */}
                <motion.div {...fadeInUp} className="bg-card rounded-2xl p-6 border border-border card-medical">
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
                </motion.div>

                {/* Diseases */}
                {latest.diseases?.length > 0 && (
                  <motion.div {...fadeInUp} className="bg-card rounded-2xl p-6 border border-border card-medical">
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
                  </motion.div>
                )}

                {/* Measures - WITHOUT meds first, then WITH meds */}
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
                  </motion.div>
                )}

                {latest.needsHospital && !isHighRisk && (
                  <motion.div {...fadeInUp} className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-destructive font-bold mb-1">{t('results.hospitalWarning')}</p>
                        {latest.hospitalMessage && <p className="text-sm text-foreground">{latest.hospitalMessage}</p>}
                      </div>
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

export default HealthChart;
