import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Area, AreaChart } from 'recharts';
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
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        
        {/* BANNER RECEPTIVO - ESTILO EDITORIAL VIVIDO */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-full rounded-[2rem] overflow-hidden h-48 md:h-56 shadow-soft group"
        >
          <img 
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200" 
            alt="Natureza suave" 
            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.65] dark:brightness-[0.45] saturate-[0.85] transition-transform duration-1000 group-hover:scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/40 to-transparent z-10" />
          
          <div className="relative z-20 w-full h-full flex flex-col justify-center items-start px-8 md:px-12 text-white">
            <h1 className="font-sans text-2xl md:text-4xl font-light tracking-wide mb-2">
              Olá, <span className="font-semibold">{nickname}</span> 🌿
            </h1>
            <p className="text-stone-200/90 font-handwritten text-xl md:text-2xl tracking-wide max-w-xl">
              "{phrase}"
            </p>
          </div>
        </motion.div>

        {/* GRADE PRINCIPAL DE CONTEÚDO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CARD DE RESUMO EMOCIONAL - GRÁFICO ESTILIZADO */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ y: -2 }}
            className="lg:col-span-2 bg-white/60 dark:bg-stone-900/40 backdrop-blur-md rounded-2xl border border-stone-200/40 dark:border-stone-800/40 shadow-soft p-6 flex flex-col justify-between"
          >
            <div>
              <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 font-semibold mb-6">
                Seu humor na última semana
              </h2>
              <div className="w-full pr-2">
                {moodData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={moodData}>
                      <defs>
                        <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="currentColor" opacity={0.3} fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 10]} stroke="currentColor" opacity={0.3} fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.85)', 
                          borderRadius: '12px', 
                          border: 'none',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                          color: '#1E2A3B'
                        }} 
                      />
                      <Area type="monotone" dataKey="intensidade" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMood)" dot={{ r: 4, strokeWidth: 1, fill: '#3B82F6' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center border border-dashed border-stone-300/60 dark:border-stone-700/60 rounded-xl px-4">
                    <p className="text-sm text-center text-reflexo-brown/60 dark:text-reflexo-beigeLight/60 font-light max-w-xs">
                      Ainda não há registros esta semana. Que tal escrever no seu diário hoje para mapear seu estado interno?
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-stone-200/30 dark:border-stone-800/30">
              <Link to="/mapa-emocional" className="text-xs uppercase tracking-widest text-reflexo-rose font-semibold hover:opacity-80 transition flex items-center gap-1">
                Ver mapa emocional completo <span className="text-sm">→</span>
              </Link>
            </div>
          </motion.div>

          {/* CARD DE CARTAS DISPONÍVEIS */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -2 }}
            className="bg-white/60 dark:bg-stone-900/40 backdrop-blur-md rounded-2xl border border-stone-200/40 dark:border-stone-800/40 shadow-soft p-6 flex flex-col justify-between"
          >
            <div>
              <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 font-semibold mb-6">
                Cartas disponíveis
              </h2>
              {letters.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-8 px-2 border border-dashed border-stone-300/60 dark:border-stone-700/60 rounded-xl min-h-[160px]">
                  <span className="text-2xl mb-2 opacity-50">✉️</span>
                  <p className="text-xs text-reflexo-brown/60 dark:text-reflexo-beigeLight/60 font-light">
                    Nenhuma carta pronta para abrir neste momento da jornada.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {letters.map((letter) => (
                    <li key={letter.id}>
                      <Link 
                        to="/cartas" 
                        className="flex items-center gap-3 p-3 rounded-xl bg-stone-100/40 dark:bg-stone-800/20 hover:bg-white dark:hover:bg-stone-800/50 transition border border-stone-200/20 shadow-sm group"
                      >
                        <span className="text-base group-hover:scale-110 transition-transform duration-300">💌</span>
                        <span className="text-sm font-medium truncate text-reflexo-brown dark:text-reflexo-beigeLight">
                          {letter.title || 'Carta para o futuro'}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-stone-200/30 dark:border-stone-800/30">
              <Link to="/cartas" className="text-xs uppercase tracking-widest text-reflexo-rose font-semibold hover:opacity-80 transition flex items-center gap-1">
                Ver todas as cartas <span className="text-sm">→</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ÚLTIMAS ENTRADAS DO DIÁRIO */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/60 dark:bg-stone-900/40 backdrop-blur-md rounded-2xl border border-stone-200/40 dark:border-stone-800/40 shadow-soft p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 font-semibold">
              Últimas entradas do diário
            </h2>
            <Link to="/diario" className="text-xs uppercase tracking-widest text-reflexo-rose font-semibold hover:opacity-80 transition flex items-center gap-1">
              Ir para o diário <span className="text-sm">→</span>
            </Link>
          </div>

          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-10 border border-dashed border-stone-300/60 dark:border-stone-700/60 rounded-xl">
              <span className="text-2xl mb-2 opacity-50">✍️</span>
              <p className="text-sm text-reflexo-brown/60 dark:text-reflexo-beigeLight/60 font-light max-w-xs">
                As páginas ainda estão em branco. Comece escrevendo os reflexos de sua mente agora mesmo.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {entries.map((entry) => (
                <div 
                  key={entry.id} 
                  className="p-5 rounded-xl bg-stone-50/50 dark:bg-stone-800/10 border border-stone-200/30 dark:border-stone-800/40 flex flex-col justify-between hover:shadow-soft transition-all duration-300 group hover:-translate-y-0.5"
                >
                  <div>
                    <p className="font-semibold text-base mb-2 group-hover:text-reflexo-rose transition-colors duration-300 truncate">
                      {entry.title || 'Sem título'}
                    </p>
                    <p className="text-xs md:text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 line-clamp-3 leading-relaxed font-light">
                      {entry.content}
                    </p>
                  </div>
                  <div className="mt-4 pt-2 text-[10px] text-reflexo-brown/40 dark:text-reflexo-beigeLight/40 tracking-wider uppercase font-medium">
                    Clique para reler
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* NOTA DE SAÚDE MENTAL DE RODAPÉ */}
        <div className="pt-2">
          <MentalHealthNotice className="rounded-2xl shadow-soft" />
        </div>
      </div>
    </PageTransition>
  );
}