import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
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
      <h1 className="text-2xl font-semibold mb-1">Cartas para o Futuro</h1>
      <p className="text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 mb-6">
        Escreva para a pessoa que você será. Sua carta ficará guardada até a data escolhida.
      </p>

      <form onSubmit={handleSubmit} className="bg-white/70 dark:bg-white/10 rounded-xl2 shadow-soft p-6 mb-8 space-y-4">
        <input
          type="text"
          placeholder="Título da carta (opcional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-reflexo-beigeRose/40 bg-white/60 dark:bg-white/10 px-4 py-2 outline-none"
        />
        <textarea
          rows={6}
          placeholder="Querido eu do futuro..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-xl border border-reflexo-beigeRose/40 bg-white/60 dark:bg-white/10 px-4 py-2 outline-none resize-none font-handwritten text-lg leading-7"
        />

        <div>
          <label className="block text-sm font-medium mb-2">Quando abrir esta carta?</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESETS.map((p) => (
              <button
                type="button"
                key={p.label}
                onClick={() => applyPreset(p.months)}
                className="px-3 py-1.5 rounded-full text-sm border border-reflexo-beigeRose bg-white/60 dark:bg-white/10 hover:border-reflexo-rose"
              >
                {p.label}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={deliverAt}
            onChange={(e) => setDeliverAt(e.target.value)}
            className="rounded-xl border border-reflexo-beigeRose/40 bg-white/60 dark:bg-white/10 px-4 py-2 outline-none"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={notifyEmail}
            onChange={(e) => setNotifyEmail(e.target.checked)}
            className="accent-reflexo-rose"
          />
          Avisar por e-mail quando a carta estiver disponível
        </label>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-full bg-reflexo-rose text-white font-medium hover:opacity-90 transition disabled:opacity-60"
        >
          {saving ? 'Guardando carta...' : 'Guardar carta'}
        </button>
      </form>

      {/* Lista de cartas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {letters.map((letter) => (
          <motion.button
            key={letter.id}
            onClick={() => handleOpen(letter)}
            whileHover={{ scale: letter.is_available ? 1.02 : 1 }}
            className={`text-left rounded-xl2 p-5 shadow-softer border ${
              letter.is_opened
                ? 'bg-reflexo-beigeRose/20 border-reflexo-beigeRose/40'
                : letter.is_available
                ? 'bg-reflexo-rose/10 border-reflexo-rose cursor-pointer'
                : 'bg-white/50 dark:bg-white/5 border-reflexo-beigeRose/30 opacity-70 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {letter.is_available || letter.is_opened ? (
                <Mail className="h-5 w-5 text-reflexo-rose" />
              ) : (
                <Lock className="h-5 w-5 text-reflexo-brown/50" />
              )}
              <h3 className="font-medium">{letter.title || 'Carta para o futuro'}</h3>
            </div>
            <p className="text-xs text-reflexo-brown/60 dark:text-reflexo-beigeLight/60">
              {letter.is_opened
                ? 'Já aberta'
                : letter.is_available
                ? 'Disponível para abrir — toque para ler'
                : `Disponível em ${new Date(letter.deliver_at).toLocaleDateString('pt-BR')}`}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Modal de abertura da carta */}
      <AnimatePresence>
        {openedLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
            onClick={() => setOpenedLetter(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="paper-texture rounded-xl2 shadow-soft p-8 max-w-lg w-full"
            >
              <h2 className="font-handwritten text-3xl mb-4">{openedLetter.title || 'Carta para o futuro'}</h2>
              <p className="whitespace-pre-wrap leading-8 font-handwritten text-xl">{openedLetter.content}</p>
              <button
                onClick={() => setOpenedLetter(null)}
                className="mt-6 px-5 py-2 rounded-full bg-reflexo-rose text-white text-sm hover:opacity-90"
              >
                Fechar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
