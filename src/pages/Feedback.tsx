import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Lock, ThumbsUp, Send, MessageSquare, Star } from 'lucide-react';

const Feedback = () => {
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cardiocheck_user');
    if (stored) setUser(JSON.parse(stored));
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    if (user?.email) fetchUserLikes();
  }, [user]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('feedback')
      .select('*')
      .order('likes_count', { ascending: false });
    if (data) setFeedbacks(data);
    setLoading(false);
  };

  const fetchUserLikes = async () => {
    if (!user?.email) return;
    const { data } = await supabase
      .from('feedback_likes')
      .select('feedback_id')
      .eq('user_email', user.email);
    if (data) setUserLikes(new Set(data.map((l: any) => l.feedback_id)));
  };

  const handleSubmit = async () => {
    if (!message.trim() || !user) return;
    setSubmitting(true);
    await supabase.from('feedback').insert({
      user_name: user.fullName || user.email,
      user_email: user.email,
      message: message.trim(),
    });
    setMessage('');
    await fetchFeedbacks();
    setSubmitting(false);
  };

  const handleLike = async (feedbackId: string) => {
    if (!user) return;
    const liked = userLikes.has(feedbackId);
    if (liked) {
      await supabase
        .from('feedback_likes')
        .delete()
        .eq('feedback_id', feedbackId)
        .eq('user_email', user.email);
      setUserLikes(prev => { const n = new Set(prev); n.delete(feedbackId); return n; });
    } else {
      await supabase.from('feedback_likes').insert({
        feedback_id: feedbackId,
        user_email: user.email,
      });
      setUserLikes(prev => new Set(prev).add(feedbackId));
    }
    await fetchFeedbacks();
  };

  const avgScore = feedbacks.length > 0
    ? Math.round(feedbacks.reduce((s, f) => s + f.likes_count, 0) / feedbacks.length * 10) / 10
    : 0;

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">{t('feedback.needAuth')}</h2>
          <Link to="/auth" className="inline-flex hero-gradient px-6 py-3 rounded-xl font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
            {t('chart.register')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('feedback.title')}</h1>
          <p className="text-muted-foreground">{t('feedback.subtitle')}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-3">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span className="text-foreground font-bold">{feedbacks.length}</span>
            <span className="text-muted-foreground text-sm">{t('feedback.total')}</span>
          </div>
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-3">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-foreground font-bold">{avgScore}</span>
            <span className="text-muted-foreground text-sm">{t('feedback.avgLikes')}</span>
          </div>
        </div>

        {/* Submit form */}
        <div className="bg-card rounded-2xl p-6 border border-border card-medical">
          <h2 className="text-lg font-bold text-foreground mb-3">{t('feedback.add')}</h2>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full px-3 py-3 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px] resize-y mb-3"
            placeholder={t('feedback.placeholder')}
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !message.trim()}
            className="flex items-center gap-2 hero-gradient px-6 py-2.5 rounded-xl font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> {t('feedback.submit')}
          </button>
        </div>

        {/* Feedbacks list */}
        <div className="space-y-3">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">{t('feedback.loading')}</p>
          ) : feedbacks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t('feedback.empty')}</p>
          ) : (
            feedbacks.map(fb => (
              <div key={fb.id} className="bg-card rounded-xl p-5 border border-border card-medical">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground mb-1">{fb.user_name}</p>
                    <p className="text-sm text-foreground leading-relaxed">{fb.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(fb.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleLike(fb.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      userLikes.has(fb.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {fb.likes_count}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
