import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { Lock } from 'lucide-react';

const generateChartData = (days: number) => {
  return Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    normal: 85 + Math.sin(i * 0.3) * 3,
    user: 65 + Math.random() * 20 + (i * 1.5),
  }));
};

const HealthChart = () => {
  const { t } = useLanguage();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [data] = useState(generateChartData(14));

  useEffect(() => {
    const stored = localStorage.getItem('cardiocheck_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">{t('chart.needAuth')}</h2>
          <Link
            to="/auth"
            className="inline-flex hero-gradient px-6 py-3 rounded-xl font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {t('chart.register')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-foreground mb-8 text-center">{t('chart.title')}</h1>

        <div className="bg-card rounded-2xl p-6 border border-border card-medical">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="day"
                label={{ value: t('chart.day'), position: 'insideBottom', offset: -5 }}
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis
                label={{ value: t('chart.score'), angle: -90, position: 'insideLeft' }}
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="normal"
                name={t('chart.normal')}
                stroke="hsl(174, 62%, 38%)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="user"
                name={t('chart.yours')}
                stroke="hsl(0, 78%, 55%)"
                strokeWidth={2}
                dot={{ r: 3, fill: 'hsl(0, 78%, 55%)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HealthChart;
