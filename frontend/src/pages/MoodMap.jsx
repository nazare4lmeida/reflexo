import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import PageTransition from '../components/PageTransition';
import { EMOTIONS } from '../components/EmotionTagPicker';
import api from '../services/api';

const COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#6366F1', '#0EA5E9'];

export default function MoodMap() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get('/mood', { params: { days } });
        setData(res.data);
      } catch (err) {
        console.error('Erro ao carregar mapa emocional:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [days]);

  const lineData =
    data?.logs.map((log) => ({
      date: new Date(log.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      intensidade: log.intensity,
    })) || [];

  const barData = data
    ? Object.entries(data.emotionFrequency).map(([slug, count]) => {
        const emotion = EMOTIONS.find((e) => e.slug === slug);
        return { name: emotion?.label || slug, total: count };
      })
    : [];

  return (
    <PageTransition>
      <h1 className="text-2xl font-semibold mb-1">Mapa Emocional</h1>
      <p className="text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 mb-6">
        Uma visão gentil sobre como você tem se sentido ao longo do tempo.
      </p>

      <div className="flex gap-2 mb-6">
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
              days === d
                ? 'bg-reflexo-rose text-white border-reflexo-rose'
                : 'bg-white/60 dark:bg-white/10 border-reflexo-beigeRose'
            }`}
          >
            {d === 7 ? 'Última semana' : d === 30 ? 'Último mês' : 'Últimos 3 meses'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-reflexo-brown/70">Carregando dados emocionais...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/70 dark:bg-white/10 rounded-xl2 shadow-soft p-6">
            <h2 className="font-semibold mb-3">Intensidade ao longo do tempo</h2>
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#93C5FD" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
                  <YAxis domain={[0, 10]} stroke="#94A3B8" fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="intensidade" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70">
                Nenhum registro neste período ainda.
              </p>
            )}
          </div>

          <div className="bg-white/70 dark:bg-white/10 rounded-xl2 shadow-soft p-6">
            <h2 className="font-semibold mb-3">Emoções mais frequentes</h2>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#93C5FD" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70">
                Nenhuma emoção registrada neste período ainda.
              </p>
            )}
          </div>

          <div className="lg:col-span-2 bg-reflexo-beigeRose/30 rounded-xl2 shadow-softer p-6">
            <h2 className="font-semibold mb-3">Insights</h2>
            <ul className="space-y-2 text-sm font-handwritten text-lg">
              {data?.insights.map((insight, i) => (
                <li key={i}>🌿 {insight}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
