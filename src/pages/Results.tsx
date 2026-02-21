import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, ArrowRight, Hospital, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const getVerdictData = (type: string, score: number, total: number, lang: string) => {
  const ratio = score / total;
  if (type === 'blood') {
    return {
      level: 'moderate' as const,
      verdict: lang === 'ru'
        ? 'На основании введённых данных анализа крови, ваши показатели находятся в допустимых пределах, но рекомендуется наблюдение у кардиолога для уточнения диагноза.'
        : lang === 'kz'
        ? 'Қан анализі деректері бойынша сіздің көрсеткіштеріңіз қалыпты деңгейде, бірақ нақтылау үшін кардиологқа бару ұсынылады.'
        : 'Based on your blood test data, your indicators are within acceptable limits, but cardiologist monitoring is recommended.',
      measures: lang === 'ru'
        ? ['Ограничить потребление жирной пищи', 'Увеличить физическую активность до 30 минут в день', 'Контролировать артериальное давление', 'Повторить анализ через 1 месяц', 'Включить в рацион Omega-3 жирные кислоты']
        : lang === 'kz'
        ? ['Майлы тағамды шектеу', 'Физикалық белсенділікті күніне 30 минутқа дейін арттыру', 'Артериялық қысымды бақылау', '1 айдан кейін анализді қайталау', 'Omega-3 май қышқылдарын рационға қосу']
        : ['Limit fatty food intake', 'Increase physical activity to 30 min/day', 'Monitor blood pressure', 'Repeat blood test in 1 month', 'Include Omega-3 fatty acids in diet'],
    };
  }
  if (ratio <= 0.3) {
    return {
      level: 'good' as const,
      verdict: lang === 'ru' ? 'Ваше сердце в хорошем состоянии. Продолжайте здоровый образ жизни!' : lang === 'kz' ? 'Жүрегіңіз жақсы жағдайда. Салауатты өмір салтын жалғастырыңыз!' : 'Your heart is in good condition. Keep up a healthy lifestyle!',
      measures: lang === 'ru'
        ? ['Поддерживать регулярные физические нагрузки', 'Сбалансированное питание', 'Регулярный сон 7-8 часов']
        : lang === 'kz'
        ? ['Тұрақты физикалық жүктемені сақтау', 'Теңдестірілген тамақтану', '7-8 сағат ұйқы']
        : ['Maintain regular exercise', 'Balanced diet', 'Regular 7-8 hours sleep'],
    };
  }
  if (ratio <= 0.6) {
    return {
      level: 'moderate' as const,
      verdict: lang === 'ru' ? 'Есть некоторые риски. Рекомендуем обратиться к кардиологу для профилактического обследования.' : lang === 'kz' ? 'Кейбір қауіптер бар. Профилактикалық тексеру үшін кардиологқа хабарласуды ұсынамыз.' : 'There are some risks. We recommend visiting a cardiologist for a preventive examination.',
      measures: lang === 'ru'
        ? ['Записаться на приём к кардиологу', 'Измерять давление 2 раза в день', 'Снизить потребление соли', 'Начать лёгкие кардио-упражнения', 'Избегать стрессовых ситуаций']
        : lang === 'kz'
        ? ['Кардиологға жазылу', 'Қысымды күніне 2 рет өлшеу', 'Тұз тұтынуды азайту', 'Жеңіл кардио жаттығуларды бастау', 'Стресстен аулақ болу']
        : ['Schedule cardiologist appointment', 'Measure BP twice daily', 'Reduce salt intake', 'Start light cardio', 'Avoid stress'],
    };
  }
  return {
    level: 'high' as const,
    verdict: lang === 'ru' ? 'Выявлены значительные факторы риска. Настоятельно рекомендуем срочно обратиться к врачу!' : lang === 'kz' ? 'Маңызды қауіп факторлары анықталды. Дәрігерге шұғыл хабарласуды ұсынамыз!' : 'Significant risk factors detected. We strongly recommend an urgent doctor visit!',
    measures: lang === 'ru'
      ? ['Немедленно обратиться к кардиологу', 'Вызвать скорую при острых симптомах', 'Полный покой до осмотра врача', 'Принять аспирин (если нет противопоказаний)', 'Избегать любых физических нагрузок']
      : lang === 'kz'
      ? ['Кардиологқа дереу хабарласу', 'Өткір симптомдарда жедел жәрдем шақыру', 'Дәрігер тексергенше толық демалу', 'Аспирин қабылдау (қарсы көрсетілімдер болмаса)', 'Кез келген физикалық жүктемеден аулақ болу']
      : ['See a cardiologist immediately', 'Call emergency for acute symptoms', 'Complete rest until doctor visit', 'Take aspirin (if no contraindications)', 'Avoid physical activity'],
  };
};

const levelColors = {
  good: 'text-green-600 bg-green-50 dark:bg-green-950/30',
  moderate: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30',
  high: 'text-accent bg-red-50 dark:bg-red-950/30',
};

const Results = () => {
  const { t, lang } = useLanguage();
  const location = useLocation();
  const state = location.state as { type: string; score?: number; total?: number } | null;

  const { level, verdict, measures } = getVerdictData(
    state?.type || 'symptoms',
    state?.score || 6,
    state?.total || 12,
    lang
  );

  const Icon = level === 'good' ? ShieldCheck : AlertTriangle;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-foreground mb-8 text-center">{t('results.title')}</h1>

        {/* Verdict */}
        <div className={`rounded-2xl p-6 mb-6 ${levelColors[level]} border border-border`}>
          <div className="flex items-start gap-4">
            <Icon className="w-8 h-8 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-bold mb-2">{t('results.verdict')}</h2>
              <p className="text-sm leading-relaxed">{verdict}</p>
            </div>
          </div>
        </div>

        {/* Measures */}
        <div className="bg-card rounded-2xl p-6 mb-6 border border-border card-medical">
          <h2 className="text-lg font-bold text-foreground mb-4">{t('results.measures')}</h2>
          <ul className="space-y-3">
            {measures.map((m, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {m}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="grid sm:grid-cols-3 gap-3">
          <Link
            to="/hospitals"
            className="flex items-center justify-center gap-2 bg-card border border-border rounded-xl py-3 px-4 text-sm font-medium text-foreground hover:bg-muted transition-colors card-medical"
          >
            <Hospital className="w-4 h-4 text-primary" />
            {t('results.viewHospitals')}
          </Link>
          <Link
            to="/chart"
            className="flex items-center justify-center gap-2 hero-gradient rounded-xl py-3 px-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <BarChart3 className="w-4 h-4" />
            {t('results.makeChart')}
          </Link>
          <Link
            to="/analysis"
            className="flex items-center justify-center gap-2 bg-card border border-border rounded-xl py-3 px-4 text-sm font-medium text-foreground hover:bg-muted transition-colors card-medical"
          >
            <ArrowRight className="w-4 h-4 text-primary" />
            {t('results.back')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Results;
