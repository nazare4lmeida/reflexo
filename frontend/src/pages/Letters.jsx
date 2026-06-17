import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Calendar, MailOpen, Bell, ArrowRight, Sparkles } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import api from '../services/api';

const PRESETS = [
  { label: '1 mês', months: 1 },
  { label: '3 meses', months: 3 },
  { label: '6 meses', months: 6 },
  { label: '1 ano', months: 12 },
];

export default function Letters() {
  const [letters, setLetters] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [deliverAt, setDeliverAt] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [openedLetter, setOpenedLetter] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const res = await api.get('/letters');
      setLetters(res.data.letters);
    } catch (err) {
      console.error('Erro ao carregar cartas:', err);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function applyPreset(months) {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    setDeliverAt(date.toISOString().slice(0, 10));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim() || !deliverAt) return;

    setSaving(true);
    try {
      await api.post('/letters', {
        title,
        content,
        deliver_at: new Date(deliverAt).toISOString(),
        notify_email: notifyEmail,
      });
      setTitle('');
      setContent('');
      setDeliverAt('');
      setNotifyEmail(false);
      load();
    } catch (err) {
      console.error('Erro ao criar carta:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleOpen(letter) {
    if (!letter.is_available) return;
    try {
      const res = await api.patch(`/letters/${letter.id}/open`);
      setOpenedLetter(res.data.letter);
      load();
    } catch (err) {
      console.error('Erro ao abrir carta:', err);
    }
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        
        {/* CABEÇALHO IMERSIVO EM ESTILO EDITORIAL VINTAGE */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-full rounded-[2rem] overflow-hidden h-40 md:h-48 shadow-soft group"
        >
          <img 
            src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1200" 
            alt="Cartas antigas e escrivaninha" 
            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.35] dark:brightness-[0.45] saturate-[0.85]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/50 to-transparent z-10" />
          
          <div className="relative z-20 w-full h-full flex flex-col justify-center items-start px-8 md:px-12 text-white">
            <h1 className="font-sans text-2xl md:text-3xl font-light tracking-wide mb-1 flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 text-reflexo-rose stroke-[1.5]" />
              Cartas para o <span className="font-semibold">Futuro</span>
            </h1>
            <p className="text-stone-200/90 font-sans text-xs md:text-sm font-light tracking-wide max-w-md">
              Escreva hoje para a pessoa que você se tornará amanhã. Suas palavras ficarão lacradas no tempo.
            </p>
          </div>
        </motion.div>

        {/* ÁREA DO FORMULÁRIO (CÁPSULA DE CRIAÇÃO) */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* BLOCO DA ESCRITA (CADERNO LINHADO) */}
          <div className="lg:col-span-2 paper-texture rounded-2xl shadow-soft p-6 md:p-8 border border-stone-200/40 dark:border-stone-800/40 space-y-4">
            <input
              type="text"
              placeholder="Título da carta (opcional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent font-sans text-base font-medium outline-none border-b border-stone-200/40 dark:border-stone-800/40 text-reflexo-brown dark:text-reflexo-beigeLight pb-2 placeholder:opacity-30"
            />
            
            <textarea
              rows={7}
              placeholder="Querido eu do futuro, hoje escrevo para deixar guardado que..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-transparent outline-none resize-none font-handwritten text-xl md:text-2xl leading-relaxed text-reflexo-brown/90 dark:text-reflexo-beigeLight/90 placeholder:opacity-30 font-light"
            />
          </div>

          {/* PAINEL LATERAL DE CONFIGURAÇÃO DE TEMPO */}
          <div className="bg-white/40 dark:bg-stone-900/30 backdrop-blur-md rounded-2xl border border-stone-200/40 dark:border-stone-800/40 p-6 space-y-5">
            <div>
              <label className="text-[11px] uppercase tracking-widest font-semibold text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 mb-3 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-reflexo-rose/70" /> Quando selar esta carta?
              </label>
              
              {/* PRESETS COMO CHIPS MINIMALISTAS */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {PRESETS.map((p) => (
                  <button
                    type="button"
                    key={p.label}
                    onClick={() => applyPreset(p.months)}
                    className="px-3 py-1 rounded-full text-[11px] font-medium border border-stone-200/60 dark:border-stone-800/60 bg-white/50 dark:bg-stone-800/30 hover:border-reflexo-rose hover:text-reflexo-rose transition-all duration-300 shadow-sm"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <input
                type="date"
                value={deliverAt}
                onChange={(e) => setDeliverAt(e.target.value)}
                className="w-full text-xs rounded-xl border border-stone-200/40 dark:border-stone-800/40 bg-white/60 dark:bg-stone-800/20 p-3 outline-none text-reflexo-brown dark:text-reflexo-beigeLight cursor-pointer focus:border-reflexo-rose/40"
              />
            </div>

            {/* NOTIFICAÇÃO ESTILIZADA */}
            <div className="pt-2">
              <label className="flex items-start gap-3 text-xs text-reflexo-brown/80 dark:text-reflexo-beigeLight/80 cursor-pointer select-none leading-relaxed font-light">
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="mt-0.5 accent-reflexo-rose rounded cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  <Bell className="h-3.5 w-3.5 text-reflexo-brown/40 inline" /> Avisar por e-mail quando o portal do tempo se abrir.
                </span>
              </label>
            </div>

            {/* BOTÃO DE ARQUIVAMENTO */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-full bg-reflexo-rose text-white text-xs uppercase tracking-widest font-medium shadow-sm hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {saving ? 'Selando no tempo...' : 'Enviar para o amanhã'} <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </form>

        {/* SEÇÃO HISTÓRICA / ARQUIVO DE ENVELOPES POROSOS */}
        <div className="space-y-4 pt-4 border-t border-stone-200/20 dark:border-stone-800/20">
          <h2 className="font-sans text-xs uppercase tracking-[0.25em] text-reflexo-brown/40 dark:text-reflexo-beigeLight/40 font-semibold">
            Seu cofre de memórias temporais
          </h2>

          {letters.length === 0 ? (
            <p className="text-sm text-center py-12 text-reflexo-brown/60 dark:text-reflexo-beigeLight/60 font-light border border-dashed border-stone-300/60 dark:border-stone-700/60 rounded-2xl">
              Nenhuma carta flutuando no espaço-tempo ainda. Redija sua primeira logo acima.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {letters.map((letter) => (
                <motion.button
                  key={letter.id}
                  onClick={() => handleOpen(letter)}
                  whileHover={letter.is_available ? { y: -3 } : {}}
                  className={`text-left rounded-2xl p-5 border shadow-soft flex flex-col justify-between min-h-[120px] transition-all duration-300 ${
                    letter.is_opened
                      ? 'bg-stone-100/40 dark:bg-stone-800/10 border-stone-200/40 dark:border-stone-800/40 opacity-80'
                      : letter.is_available
                      ? 'bg-reflexo-rose/5 border-reflexo-rose/40 cursor-pointer hover:shadow-md'
                      : 'bg-white/40 dark:bg-stone-900/10 border-stone-200/20 dark:border-stone-800/20 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-2">
                      {letter.is_opened ? (
                        <MailOpen className="h-4 w-4 text-reflexo-brown/50 dark:text-reflexo-beigeLight/50" />
                      ) : letter.is_available ? (
                        <Mail className="h-4 w-4 text-reflexo-rose animate-pulse" />
                      ) : (
                        <Lock className="h-4 w-4 text-stone-400" />
                      )}
                      <h3 className="font-medium text-sm text-reflexo-brown dark:text-reflexo-beigeLight truncate max-w-[85%]">
                        {letter.title || 'Carta para o futuro'}
                      </h3>
                    </div>
                  </div>

                  <div className="w-full pt-2 border-t border-stone-200/20 dark:border-stone-800/20">
                    <p className="text-[10px] uppercase tracking-wider font-medium text-reflexo-brown/50 dark:text-reflexo-beigeLight/50">
                      {letter.is_opened
                        ? 'Cápsula aberta e lida'
                        : letter.is_available
                        ? 'Disponível — Toque para ler seu passado'
                        : `Ligar portal em: ${new Date(letter.deliver_at).toLocaleDateString('pt-BR')}`}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* MODAL EDITORIAL COM TEXTURA DE ENVELOPE ANTIGO */}
        <AnimatePresence>
          {openedLetter && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-950/40 dark:bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setOpenedLetter(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ type: 'spring', duration: 0.5 }}
                onClick={(e) => e.stopPropagation()}
                className="paper-texture rounded-3xl shadow-deep p-6 md:p-8 max-w-lg w-full border border-stone-200/40 dark:border-stone-800/40 relative"
              >
                <div className="border-b border-stone-200/30 pb-3 mb-4">
                  <h2 className="font-sans text-base font-semibold text-reflexo-brown dark:text-reflexo-beigeLight">
                    {openedLetter.title || 'Carta para o futuro'}
                  </h2>
                  <p className="text-[10px] uppercase tracking-wider text-reflexo-brown/40 dark:text-reflexo-beigeLight/40 font-medium mt-0.5">
                    Resgatada do passado
                  </p>
                </div>

                <div className="max-h-[60vh] overflow-y-auto pr-1">
                  <p className="whitespace-pre-wrap font-handwritten text-xl md:text-2xl leading-relaxed text-reflexo-brown/90 dark:text-reflexo-beigeLight/90 font-light">
                    {openedLetter.content}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-200/30 flex justify-end">
                  <button
                    onClick={() => setOpenedLetter(null)}
                    className="px-5 py-2 rounded-full bg-reflexo-rose text-white text-xs uppercase tracking-widest font-medium hover:opacity-90 transition shadow-sm"
                  >
                    Fechar envelope
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PageTransition>
  );
}