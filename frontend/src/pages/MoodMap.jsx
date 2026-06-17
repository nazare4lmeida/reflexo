import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { Calendar, BarChart3, Sparkles, Activity } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { EMOTIONS } from '../components/EmotionTagPicker';
import api from '../services/api';

// Cores calmas e sofisticadas para o gráfico de barras
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
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        
        {/* CABEÇALHO EDITORIAL */}
        <div className="border-b border-stone-200/20 dark:border-stone-800/20 pb-4">
          <h1 className="text-2xl md:text-3xl font-light tracking-wide text-reflexo-brown dark:text-reflexo-beigeLight">
            Mapa <span className="font-semibold">Emocional</span>
          </h1>
          <p className="font-sans text-xs md:text-sm text-reflexo-brown/60 dark:text-reflexo-beigeLight/60 tracking-wide mt-1">
            Uma visão gentil e panorâmica sobre como você tem se sentido ao longo do tempo.
          </p>
        </div>

        {/* SELETOR DE PERÍODO (BOTÕES ESTILIZADOS COMO ABAS FLUTUANTES) */}
        <div className="flex gap-2.5 p-1 bg-stone-200/40 dark:bg-stone-800/30 w-max rounded-full backdrop-blur-sm border border-stone-200/10">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-5 py-2 rounded-full text-xs uppercase tracking-widest font-medium transition-all duration-300 ${
                days === d
                  ? 'bg-reflexo-rose text-white shadow-sm'
                  : 'text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 hover:text-reflexo-rose'
              }`}
            >
              {d === 7 ? 'Semana' : d === 30 ? 'Mês' : '3 Meses'}
            </button>
          ))}
        </div>

        {/* CONTEÚDO PRINCIPAL COM ANIMAÇÃO DE CARREGAMENTO SUAVE */}
        {loading ? (
          <p className="text-xs tracking-wider uppercase text-center opacity-40 py-12">Processando dados internos...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* GRÁFICO DE INTENSIDADE (MUDADO PARA AREA CHART PARA DAR FLUIDEZ) */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/50 dark:bg-stone-900/40 backdrop-blur-md rounded-2xl border border-stone-200/30 dark:border-stone-800/30 shadow-soft p-6"
            >
              <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 font-semibold mb-6 flex items-center gap-2">
                <Activity className="h-4 w-4 text-reflexo-rose/70" /> Intensidade ao longo do tempo
              </h2>
              {lineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="currentColor" opacity={0.3} fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 10]} stroke="currentColor" opacity={0.3} fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                        borderRadius: '12px', 
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        color: '#1E2A3B',
                        fontSize: '12px'
                      }} 
                    />
                    <Area type="monotone" dataKey="intensidade" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIntensity)" dot={{ r: 4, strokeWidth: 1, fill: '#3B82F6' }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[260px] flex items-center justify-center border border-dashed border-stone-300/60 dark:border-stone-700/60 rounded-xl">
                  <p className="text-xs text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 font-light">
                    Nenhum registro mapeado neste período.
                  </p>
                </div>
              )}
            </motion.div>

            {/* GRÁFICO DE FREQUÊNCIA DE EMOÇÕES */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/50 dark:bg-stone-900/40 backdrop-blur-md rounded-2xl border border-stone-200/30 dark:border-stone-800/30 shadow-soft p-6"
            >
              <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 font-semibold mb-6 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-reflexo-rose/70" /> Emoções mais frequentes
              </h2>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="currentColor" opacity={0.3} fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="currentColor" opacity={0.3} fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                        borderRadius: '12px', 
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        color: '#1E2A3B',
                        fontSize: '12px'
                      }} 
                    />
                    <Bar dataKey="total" radius={[8, 8, 0, 0]} maxBarSize={40}>
                      {barData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[260px] flex items-center justify-center border border-dashed border-stone-300/60 dark:border-stone-700/60 rounded-xl">
                  <p className="text-xs text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 font-light">
                    Nenhuma emoção registrada neste período.
                  </p>
                </div>
              )}
            </motion.div>

            {/* SEÇÃO DE INSIGHTS REESTRUTURADA (ESTILO NOTA DE FOLHA SOLTA) */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 bg-reflexo-beigeRose/15 dark:bg-reflexo-beigeRose/5 border border-reflexo-beigeRose/30 rounded-2xl shadow-soft p-6 md:p-8"
            >
              <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-reflexo-brown/60 dark:text-reflexo-beigeLight/60 font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-reflexo-rose" /> Insights da sua jornada
              </h2>
              
              {data?.insights && data.insights.length > 0 ? (
                <ul className="space-y-3 font-handwritten text-xl md:text-2xl text-reflexo-brown/90 dark:text-reflexo-beigeLight/90 tracking-wide leading-snug">
                  {data.insights.map((insight, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, x: -5 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-2.5"
                    >
                      <span className="text-reflexo-rose/70 select-none mt-0.5">🌿</span>
                      <span>{insight}</span>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="font-sans text-xs font-light text-reflexo-brown/60 dark:text-reflexo-beigeLight/60 italic">
                  Continue preenchendo seu diário regularmente para que os reflexos e padrões internos surjam aqui.
                </p>
              )}
            </motion.div>

          </div>
        )}
      </div>
    </PageTransition>
  );
}