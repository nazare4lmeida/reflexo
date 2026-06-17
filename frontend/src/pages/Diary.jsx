import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Pencil, Search, FileText, Sparkles, PenTool, BookOpen, Smile, Calendar, Sliders } from 'lucide-react';
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
    window.print();
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        
        {/* CABEÇALHO IMERSIVO COM IMAGEM DO UNSPLASH (ZOOM LENTO VINTAGE) */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-full rounded-[2rem] overflow-hidden h-40 md:h-48 shadow-soft group"
        >
<img 
  src="https://images.unsplash.com/photo-1596477490700-65353472297c?w=2400&auto=format&fit=crop&q=80"
  alt="Flores roxas ao lado de uma caneca"
  style={{ transform: 'scaleX(-1)' }}
  className="absolute inset-0 w-full h-full object-cover filter brightness-[0.3] dark:brightness-[0.45] saturate-[0.9] animate-slow-pan"
/>
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/50 to-transparent z-10" />
          
          <div className="relative z-20 w-full h-full flex flex-col justify-center items-start px-8 md:px-12 text-white">
            <h1 className="font-sans text-2xl md:text-3xl font-light tracking-wide mb-1 flex items-center gap-2">
              <BookOpen className="h-6 w-6 stroke-[1.5] text-reflexo-rose" /> 
              Diário <span className="font-semibold">Pessoal</span>
            </h1>
            <p className="text-stone-200/90 font-sans text-xs md:text-sm font-light tracking-wide max-w-md">
              Este espaço é totalmente privado e seguro. Escreva no seu tempo, sem julgamentos.
            </p>
          </div>
        </motion.div>

        {/* ÁREA DO FORMULÁRIO DE ESCRITA ANCONCHETADO */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* BLOCO CENTRAL DO CADERNO DE NOTAS */}
          <div className="lg:col-span-2 paper-texture rounded-2xl shadow-soft p-6 md:p-8 border border-stone-200/40 dark:border-stone-800/40 relative">
            <div className="flex items-center gap-2 mb-4 border-b border-stone-200/40 dark:border-stone-800/40 pb-2">
              <PenTool className="h-4 w-4 text-reflexo-rose/60" />
              <input
                type="text"
                placeholder="Título da reflexão (opcional)"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-transparent font-handwritten text-2xl md:text-3xl outline-none text-reflexo-brown dark:text-reflexo-beigeLight tracking-wide placeholder:opacity-40"
              />
            </div>

            <textarea
              placeholder="O que você está sentindo hoje? Deixe os pensamentos fluírem livres pelas linhas..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={8}
              className="w-full bg-transparent outline-none resize-none text-sm md:text-base leading-relaxed text-reflexo-brown/90 dark:text-reflexo-beigeLight/90 placeholder:opacity-40 font-light"
            />

            <div className="mt-6 pt-4 border-t border-stone-200/30 dark:border-stone-800/30 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-full bg-reflexo-rose text-white text-xs uppercase tracking-widest font-medium shadow-sm hover:opacity-95 transition disabled:opacity-50"
              >
                {saving ? 'Arquivando...' : editingId ? 'Atualizar reflexão' : 'Guardar reflexão'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  className="text-xs uppercase tracking-widest font-medium text-reflexo-brown/60 dark:text-reflexo-beigeLight/60 hover:text-reflexo-rose transition"
                >
                  Cancelar edição
                </button>
              )}
            </div>

            {/* SUGESTÕES INTELIGENTES FLUTUANTES (SUBSTITUÍDO ÍCONE) */}
            <AnimatePresence>
              {suggestion && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 bg-reflexo-beigeRose/15 dark:bg-stone-800/30 border border-reflexo-beigeRose/30 rounded-xl p-4 flex items-start gap-2.5 shadow-sm"
                >
                  <Sparkles className="h-4 w-4 text-reflexo-rose mt-0.5 shrink-0 animate-pulse" />
                  <p className="font-handwritten text-lg leading-snug text-reflexo-brown/90 dark:text-reflexo-beigeLight/90">
                    {suggestion}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* METADADOS E PERGUNTAS AUXILIARES LATERAIS */}
          <div className="bg-white/40 dark:bg-stone-900/30 backdrop-blur-md rounded-2xl border border-stone-200/40 dark:border-stone-800/40 p-6 space-y-5">
            <div>
              <label className="text-[11px] uppercase tracking-widest font-semibold text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 mb-3 flex items-center gap-1.5">
                <Smile className="h-3.5 w-3.5 text-reflexo-rose/70" /> Como você está se sentindo?
              </label>
              <EmotionTagPicker
                value={form.emotion_tags}
                onChange={(tags) => setForm({ ...form, emotion_tags: tags })}
              />
            </div>

            <div className="pt-2">
              <label className="text-[11px] uppercase tracking-widest font-semibold text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Sliders className="h-3.5 w-3.5 text-reflexo-rose/70" /> Intensidade emocional:</span>
                <span className="text-reflexo-rose font-bold text-xs bg-reflexo-rose/10 px-2 py-0.5 rounded-full">{form.intensity}/10</span>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={form.intensity}
                onChange={(e) => setForm({ ...form, intensity: Number(e.target.value) })}
                className="w-full accent-reflexo-rose bg-stone-200 dark:bg-stone-800 h-1 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-medium text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 mb-1">
                  O que aconteceu hoje?
                </label>
                <textarea
                  rows={2}
                  placeholder="Fatos, gatilhos ou eventos marcantes..."
                  value={form.what_happened}
                  onChange={(e) => setForm({ ...form, what_happened: e.target.value })}
                  className="w-full bg-white/50 dark:bg-stone-800/20 text-xs rounded-xl border border-stone-200/40 dark:border-stone-800/40 p-3 outline-none resize-none font-light leading-relaxed focus:border-reflexo-rose/40"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-medium text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 mb-1">
                  O que eu gostaria de lembrar?
                </label>
                <textarea
                  rows={2}
                  placeholder="Lembretes de carinho e acolhimento para o futuro..."
                  value={form.what_to_remember}
                  onChange={(e) => setForm({ ...form, what_to_remember: e.target.value })}
                  className="w-full bg-white/50 dark:bg-stone-800/20 text-xs rounded-xl border border-stone-200/40 dark:border-stone-800/40 p-3 outline-none resize-none font-light leading-relaxed focus:border-reflexo-rose/40"
                />
              </div>
            </div>
          </div>
        </form>

        {/* BARRA DE FILTROS E BUSCA INTEGRADA */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-stone-200/20 dark:border-stone-800/20">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 h-3.5 w-3.5 text-reflexo-brown/40" />
            <input
              type="text"
              placeholder="Pesquisar registros anteriores..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-full border border-stone-200/40 dark:border-stone-800/40 bg-white/60 dark:bg-stone-900/30 outline-none focus:ring-1 focus:ring-reflexo-rose"
            />
          </div>
          <select
            value={emotionFilter}
            onChange={(e) => setEmotionFilter(e.target.value)}
            className="px-4 py-2.5 text-xs rounded-full border border-stone-200/40 dark:border-stone-800/40 bg-white/60 dark:bg-stone-900/30 outline-none cursor-pointer text-reflexo-brown/80 dark:text-reflexo-beigeLight/80"
          >
            <option value="">Filtrar por emoção</option>
            {EMOTIONS.map((e) => (
              <option key={e.slug} value={e.slug}>
                {e.emoji} {e.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleExportPdf}
            className="px-5 py-2.5 rounded-full bg-white/60 dark:bg-stone-900/30 border border-stone-200/40 dark:border-stone-800/40 hover:bg-white dark:hover:bg-stone-800 text-xs font-medium tracking-wide transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <FileText className="h-3.5 w-3.5 opacity-60" /> Exportar Diário (PDF)
          </button>
        </div>

        {/* FEED / LISTAGEM HISTÓRICA DE ENTRADAS DO DIÁRIO */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-xs tracking-wider uppercase text-center opacity-40 py-6">Recuperando registros salvos...</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-center py-12 text-reflexo-brown/60 dark:text-reflexo-beigeLight/60 font-light border border-dashed border-stone-300/60 dark:border-stone-700/60 rounded-2xl">
              Nenhuma página preenchida encontrada neste filtro. Comece a redigir sua jornada acima.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="paper-texture rounded-2xl shadow-soft p-6 border border-stone-200/30 dark:border-stone-800/40 flex flex-col justify-between group hover:shadow-md transition-shadow duration-300"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="font-handwritten text-xl text-reflexo-brown dark:text-reflexo-beigeLight group-hover:text-reflexo-rose transition-colors duration-300">
                          {entry.title || 'Sem título'}
                        </h3>
                        <p className="text-[10px] uppercase tracking-wider text-reflexo-brown/40 dark:text-reflexo-beigeLight/40 font-medium mt-0.5 flex items-center gap-1">
                          <Calendar className="h-3 w-3 opacity-60" />
                          {new Date(entry.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      </div>
                      <div className="flex gap-2.5 opacity-30 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(entry)} 
                          aria-label="Editar registro"
                          className="hover:text-reflexo-rose transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5 stroke-[1.8]" />
                        </button>
                        <button 
                          onClick={() => handleDelete(entry.id)} 
                          aria-label="Excluir registro"
                          className="hover:text-reflexo-rose transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5 stroke-[1.8]" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-xs md:text-sm leading-relaxed text-reflexo-brown/80 dark:text-reflexo-beigeLight/80 font-light whitespace-pre-wrap line-clamp-4">
                      {entry.content}
                    </p>
                  </div>

                  {/* EXIBIÇÃO DAS MARCAS EMOCIONAIS NO RODAPÉ */}
                  {((entry.emotion_tags && entry.emotion_tags.length > 0) || entry.intensity) && (
                    <div className="mt-4 pt-3 border-t border-stone-200/20 dark:border-stone-800/20 flex flex-wrap items-center gap-1.5">
                      {entry.emotion_tags?.map((tag) => {
                        const emotion = EMOTIONS.find((e) => e.slug === tag);
                        return (
                          <span key={tag} className="text-[10px] font-medium tracking-wide bg-stone-100/80 dark:bg-stone-800/40 text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 border border-stone-200/10 rounded-full px-2 py-0.5 shadow-sm">
                            {emotion?.emoji} {emotion?.label || tag}
                          </span>
                        );
                      })}
                      <span className="text-[10px] font-semibold tracking-wide bg-reflexo-rose/10 text-reflexo-rose rounded-full px-2 py-0.5">
                        Nível {entry.intensity}/10
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}