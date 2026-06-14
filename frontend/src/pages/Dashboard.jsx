import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import PageTransition from '../components/PageTransition';
import MentalHealthNotice from '../components/MentalHealthNotice';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const DAILY_PHRASES = [
  'Hoje é um bom dia para se ouvir com gentileza.',
  'Cada pequeno passo de autoconhecimento importa.',
  'Você não precisa ter todas as respostas agora.',
  'Sentir é parte de estar viva(o). Seja gentil com você.',
  'Olhar para dentro também é um ato de coragem.',
];

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [entries, setEntries] = useState([]);
  const [letters, setLetters] = useState([]);
  const [moodData, setMoodData] = useState([]);
  const [loading, setLoading] = useState(true);

  const phrase = DAILY_PHRASES[new Date().getDate() % DAILY_PHRASES.length];

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, diaryRes, lettersRes, moodRes] = await Promise.all([
          api.get('/profile/me'),
          api.get('/diary'),
          api.get('/letters'),
          api.get('/mood?days=7'),
        ]);

        setProfile(profileRes.data.profile);
        setEntries(diaryRes.data.entries.slice(0, 3));
        setLetters(lettersRes.data.letters.filter((l) => !l.is_opened).slice(0, 3));

        const chartData = moodRes.data.logs.map((log) => ({
          date: new Date(log.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          intensidade: log.intensity,
        }));
        setMoodData(chartData);
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const nickname = profile?.nickname || user?.email?.split('@')[0];

  return (
    <PageTransition>
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl md:text-3xl font-semibold mb-1"
      >
        Olá, {nickname} 🌿
      </motion.h1>
      <p className="text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 mb-6 font-handwritten text-xl">
        {phrase}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Resumo emocional */}
        <motion.div whileHover={{ y: -4 }} className="md:col-span-2 bg-white/70 dark:bg-white/10 rounded-xl2 shadow-soft p-6">
          <h2 className="font-semibold mb-3">Seu humor na última semana</h2>
          {moodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={moodData}>
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
                <YAxis domain={[0, 10]} stroke="#94A3B8" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="intensidade" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70">
              Ainda não há registros esta semana. Que tal escrever no seu diário hoje?
            </p>
          )}
          <Link to="/mapa-emocional" className="text-sm text-reflexo-rose hover:underline mt-3 inline-block">
            Ver mapa emocional completo →
          </Link>
        </motion.div>

        {/* Cartas para o futuro */}
        <motion.div whileHover={{ y: -4 }} className="bg-white/70 dark:bg-white/10 rounded-xl2 shadow-soft p-6">
          <h2 className="font-semibold mb-3">Cartas disponíveis</h2>
          {letters.length === 0 ? (
            <p className="text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70">
              Nenhuma carta pronta para abrir agora.
            </p>
          ) : (
            <ul className="space-y-2">
              {letters.map((letter) => (
                <li key={letter.id} className="text-sm">
                  <Link to="/cartas" className="hover:underline">
                    💌 {letter.title || 'Carta para o futuro'}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link to="/cartas" className="text-sm text-reflexo-rose hover:underline mt-3 inline-block">
            Ver todas as cartas →
          </Link>
        </motion.div>
      </div>

      {/* Últimas entradas do diário */}
      <div className="mt-6 bg-white/70 dark:bg-white/10 rounded-xl2 shadow-soft p-6">
        <h2 className="font-semibold mb-3">Últimas entradas do diário</h2>
        {entries.length === 0 ? (
          <p className="text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70">
            Você ainda não escreveu nada. Comece agora mesmo no seu diário.
          </p>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => (
              <li key={entry.id} className="border-b border-reflexo-beigeRose/40 pb-2 last:border-none">
                <p className="font-medium">{entry.title || 'Sem título'}</p>
                <p className="text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 line-clamp-2">
                  {entry.content}
                </p>
              </li>
            ))}
          </ul>
        )}
        <Link to="/diario" className="text-sm text-reflexo-rose hover:underline mt-3 inline-block">
          Ir para o diário →
        </Link>
      </div>

      <MentalHealthNotice className="mt-6" />
    </PageTransition>
  );
}
