import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Pencil, Search } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import EmotionTagPicker, { EMOTIONS } from '../components/EmotionTagPicker';
import api from '../services/api';

const emptyForm = {
  title: '',
  content: '',
  emotion_tags: [],
  intensity: 5,
  what_happened: '',
  what_to_remember: '',
};

export default function Diary() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [search, setSearch] = useState('');
  const [emotionFilter, setEmotionFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadEntries() {
    setLoading(true);
    try {
      const params = {};
      if (search) params.q = search;
      if (emotionFilter) params.emotion = emotionFilter;

      const res = await api.get('/diary', { params });
      setEntries(res.data.entries);
    } catch (err) {
      console.error('Erro ao carregar diário:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, emotionFilter]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.content.trim()) return;

    setSaving(true);
    setSuggestion(null);

    try {
      if (editingId) {
        await api.put(`/diary/${editingId}`, form);
      } else {
        const res = await api.post('/diary', form);
        setSuggestion(res.data.suggestion);
      }

      setForm(emptyForm);
      setEditingId(null);
      loadEntries();
    } catch (err) {
      console.error('Erro ao salvar entrada:', err);
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(entry) {
    setEditingId(entry.id);
    setForm({
      title: entry.title || '',
      content: entry.content || '',
      emotion_tags: entry.emotion_tags || [],
      intensity: entry.intensity || 5,
      what_happened: entry.what_happened || '',
      what_to_remember: entry.what_to_remember || '',
    });
    setSuggestion(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja excluir esta entrada? Essa ação não pode ser desfeita.')) return;
    try {
      await api.delete(`/diary/${id}`);
      loadEntries();
    } catch (err) {
      console.error('Erro ao excluir entrada:', err);
    }
  }

  function handleExportPdf() {
    // Abre uma versão para impressão; o usuário pode salvar como PDF pelo navegador.
    window.print();
  }

  return (
    <PageTransition>
      <h1 className="text-2xl font-semibold mb-1">Diário Pessoal</h1>
      <p className="text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 mb-6">
        Este espaço é totalmente privado. Escreva sem pressa, sem julgamentos.
      </p>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="paper-texture rounded-xl2 shadow-soft p-6 mb-8">
        <input
          type="text"
          placeholder="Título (opcional)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full bg-transparent font-handwritten text-2xl outline-none border-b border-reflexo-beigeRose/50 mb-3 pb-1"
        />

        <textarea
          placeholder="O que você está sentindo hoje?"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={6}
          className="w-full bg-transparent outline-none resize-none leading-7"
        />

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Como você está se sentindo?</label>
          <EmotionTagPicker
            value={form.emotion_tags}
            onChange={(tags) => setForm({ ...form, emotion_tags: tags })}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">
            Intensidade emocional: {form.intensity}/10
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={form.intensity}
            onChange={(e) => setForm({ ...form, intensity: Number(e.target.value) })}
            className="w-full accent-reflexo-rose"
          />
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">O que aconteceu hoje? (opcional)</label>
            <textarea
              rows={3}
              value={form.what_happened}
              onChange={(e) => setForm({ ...form, what_happened: e.target.value })}
              className="w-full bg-white/60 dark:bg-white/10 rounded-xl border border-reflexo-beigeRose/40 p-2 outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">O que eu gostaria de lembrar sobre isso? (opcional)</label>
            <textarea
              rows={3}
              value={form.what_to_remember}
              onChange={(e) => setForm({ ...form, what_to_remember: e.target.value })}
              className="w-full bg-white/60 dark:bg-white/10 rounded-xl border border-reflexo-beigeRose/40 p-2 outline-none resize-none"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-full bg-reflexo-rose text-white font-medium hover:opacity-90 transition disabled:opacity-60"
          >
            {saving ? 'Salvando...' : editingId ? 'Atualizar entrada' : 'Salvar entrada'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 hover:underline"
            >
              Cancelar edição
            </button>
          )}
        </div>

        <AnimatePresence>
          {suggestion && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 bg-reflexo-beigeRose/30 rounded-xl2 p-4 text-sm font-handwritten text-lg"
            >
              💬 {suggestion}
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-reflexo-brown/50" />
          <input
            type="text"
            placeholder="Pesquisar no diário..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-full border border-reflexo-beigeRose/50 bg-white/70 dark:bg-white/10 outline-none focus:ring-2 focus:ring-reflexo-rose"
          />
        </div>
        <select
          value={emotionFilter}
          onChange={(e) => setEmotionFilter(e.target.value)}
          className="px-3 py-2 rounded-full border border-reflexo-beigeRose/50 bg-white/70 dark:bg-white/10 outline-none"
        >
          <option value="">Todas as emoções</option>
          {EMOTIONS.map((e) => (
            <option key={e.slug} value={e.slug}>
              {e.emoji} {e.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleExportPdf}
          className="px-4 py-2 rounded-full bg-white/70 dark:bg-white/10 border border-reflexo-beigeRose/50 hover:bg-white transition text-sm"
        >
          Exportar em PDF
        </button>
      </div>

      {/* Lista de entradas */}
      {loading ? (
        <p className="text-sm text-reflexo-brown/70">Carregando entradas...</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70">
          Nenhuma entrada encontrada. Escreva a primeira acima.
        </p>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="paper-texture rounded-xl2 shadow-softer p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-handwritten text-xl">{entry.title || 'Sem título'}</h3>
                  <p className="text-xs text-reflexo-brown/60 dark:text-reflexo-beigeLight/60">
                    {new Date(entry.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(entry)} aria-label="Editar">
                    <Pencil className="h-4 w-4 text-reflexo-brown/60 hover:text-reflexo-rose" />
                  </button>
                  <button onClick={() => handleDelete(entry.id)} aria-label="Excluir">
                    <Trash2 className="h-4 w-4 text-reflexo-brown/60 hover:text-reflexo-rose" />
                  </button>
                </div>
              </div>
              <p className="mt-2 leading-7 whitespace-pre-wrap">{entry.content}</p>
              {entry.emotion_tags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {entry.emotion_tags.map((tag) => {
                    const emotion = EMOTIONS.find((e) => e.slug === tag);
                    return (
                      <span key={tag} className="text-xs bg-reflexo-beigeRose/40 rounded-full px-2 py-0.5">
                        {emotion?.emoji} {emotion?.label || tag}
                      </span>
                    );
                  })}
                  <span className="text-xs bg-reflexo-rose/20 rounded-full px-2 py-0.5">
                    Intensidade: {entry.intensity}/10
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
