import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Plus, Flame, RotateCcw, BookOpen, PenLine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { FireSphere } from '@/components/ui/fire-sphere';

const guidedQuestions = [
  'diary.q1', 'diary.q2', 'diary.q3', 'diary.q4', 'diary.q5',
];

const Diary = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [content, setContent] = useState('');
  const [guidedAnswers, setGuidedAnswers] = useState<Record<string, string>>({});
  const [burning, setBurning] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchEntries();
  }, [user]);

  const fetchEntries = async () => {
    const { data } = await supabase.from('diary_entries')
      .select('*').eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    if (data) setEntries(data);
  };

  const saveEntry = async () => {
    if (!content.trim() && Object.keys(guidedAnswers).length === 0) return;
    await supabase.from('diary_entries').insert({
      user_id: user!.id,
      content: content.trim(),
      guided_answers: guidedAnswers,
    });
    setContent('');
    setGuidedAnswers({});
    setShowNew(false);
    fetchEntries();
    toast.success(t('diary.saved'));
  };

  const burnEntry = async (id: string) => {
    setBurning(id);
    // Let the fire animation play for 3 seconds
    setTimeout(async () => {
      await supabase.from('diary_entries').update({ is_burned: true }).eq('id', id);
      fetchEntries();
      setBurning(null);
      toast.success(t('diary.burned'));
    }, 3000);
  };

  const restoreEntry = async (id: string) => {
    await supabase.from('diary_entries').update({ is_burned: false }).eq('id', id);
    fetchEntries();
    toast.success(t('diary.restored'));
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">{t('diary.needAuth')}</h2>
          <Link to="/auth" className="inline-flex hero-gradient px-6 py-3 rounded-xl font-semibold text-primary-foreground">
            {t('chart.register')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold text-foreground">{t('diary.title')}</h1>
          </div>
          <button onClick={() => setShowNew(!showNew)}
            className="flex items-center gap-2 mental-gradient px-4 py-2 rounded-xl text-sm font-semibold text-accent-foreground hover:opacity-90">
            <PenLine className="w-4 h-4" /> {t('diary.new')}
          </button>
        </div>

        {/* New entry form */}
        <AnimatePresence>
          {showNew && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-card rounded-2xl p-6 border border-border card-medical space-y-4 overflow-hidden">
              <h2 className="text-lg font-bold text-foreground">{t('diary.newEntry')}</h2>

              {guidedQuestions.map(q => (
                <div key={q}>
                  <label className="block text-sm text-muted-foreground mb-1">{t(q)}</label>
                  <input value={guidedAnswers[q] || ''} onChange={e => setGuidedAnswers(prev => ({ ...prev, [q]: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              ))}

              <div>
                <label className="block text-sm text-muted-foreground mb-1">{t('diary.freeWrite')}</label>
                <textarea value={content} onChange={e => setContent(e.target.value)}
                  className="w-full px-3 py-3 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[150px] resize-y"
                  placeholder={t('diary.freeWrite.placeholder')} />
              </div>

              <button onClick={saveEntry} className="mental-gradient text-accent-foreground px-6 py-2.5 rounded-xl font-semibold hover:opacity-90">
                {t('diary.save')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entries list */}
        <div className="space-y-4">
          {entries.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">{t('diary.empty')}</p>
          ) : (
            entries.map(entry => (
              <div key={entry.id} className={`relative ${entry.is_burned ? 'opacity-40' : ''}`}>
                {/* Fire sphere overlay when burning */}
                <AnimatePresence>
                  {burning === entry.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.3 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl overflow-hidden"
                      style={{ background: 'rgba(0,0,0,0.85)' }}
                    >
                      <div className="w-48 h-48">
                        <FireSphere
                          bloomStrength={2.5}
                          bloomRadius={1.0}
                          color0={[255, 60, 0]}
                          color1={[255, 140, 20]}
                          animate
                        />
                      </div>
                      <p className="absolute bottom-4 text-orange-400 font-bold text-sm animate-pulse">
                        🔥 {t('diary.burn')}...
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={`bg-card rounded-2xl p-5 border border-border card-medical relative transition-all duration-300 ${
                  burning === entry.id ? 'scale-95' : ''
                }`}>
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleDateString()}</p>
                    <div className="flex gap-2">
                      {entry.is_burned ? (
                        <button onClick={() => restoreEntry(entry.id)} className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground" title={t('diary.restore')}>
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => burnEntry(entry.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20" title={t('diary.burn')}
                          disabled={burning !== null}>
                          <Flame className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  {!entry.is_burned && (
                    <>
                      {entry.content && <p className="text-sm text-foreground whitespace-pre-line">{entry.content}</p>}
                      {entry.guided_answers && Object.keys(entry.guided_answers).length > 0 && (
                        <div className="mt-3 space-y-1">
                          {Object.entries(entry.guided_answers).map(([q, a]: any) => (
                            a && <p key={q} className="text-xs text-muted-foreground"><span className="font-medium">{t(q)}:</span> {a}</p>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  {entry.is_burned && <p className="text-sm text-muted-foreground italic text-center">{t('diary.burnedText')}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Diary;
