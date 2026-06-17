import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageCircle, Plus, Sparkles, Users, MessageSquarePlus, AlertCircle } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import api from '../services/api';

// Cores suaves e minimalistas baseadas nas paletas do seu tema para chips de categoria
const CATEGORY_COLORS = [
  'bg-stone-100 dark:bg-stone-800/60 border-stone-200/40 text-reflexo-brown dark:text-reflexo-beigeLight',
  'bg-reflexo-beigeRose/15 border-reflexo-beigeRose/30 text-reflexo-brown dark:text-reflexo-beigeLight',
  'bg-stone-100 dark:bg-stone-800/40 border-stone-200/20 text-stone-600 dark:text-stone-400',
];

export default function Forum() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  async function loadCategories() {
    try {
      const res = await api.get('/forum/categories');
      setCategories(res.data.categories);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  }

  async function loadPosts(catId) {
    try {
      const params = catId ? { category_id: catId } : {};
      const res = await api.get('/forum/posts', { params });
      setPosts(res.data.posts);
    } catch (err) {
      console.error('Erro ao carregar posts:', err);
    }
  }

  useEffect(() => {
    loadCategories();
    loadPosts(null);
  }, []);

  function selectCategory(catId) {
    setActiveCategory(catId);
    loadPosts(catId);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim() || !categoryId) return;

    setSaving(true);
    setFeedback('');
    try {
      const res = await api.post('/forum/posts', {
        title,
        content,
        category_id: categoryId,
      });

      if (res.data?.post?.status === 'pending') {
        setFeedback(
          'Seu desabafo foi recebido com carinho. Como passou pela nossa moderação preventiva, ele será revisado antes de aparecer publicamente — em breve estará disponível.'
        );
      } else {
        setFeedback('Seu post foi publicado. Obrigado por compartilhar com a comunidade.');
      }

      setTitle('');
      setContent('');
      setCategoryId('');
      setShowForm(false);
      loadPosts(activeCategory);
    } catch (err) {
      console.error('Erro ao criar post:', err);
      setFeedback('Não foi possível publicar agora. Tente novamente em alguns instantes.');
    } finally {
      setSaving(false);
    }
  }

  function categoryColor(catId) {
    const idx = categories.findIndex((c) => c.id === catId);
    if (idx === -1) return CATEGORY_COLORS[0];
    return CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        
        {/* CABEÇALHO IMERSIVO PANORÂMICO DO FÓRUM */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-full rounded-[2rem] overflow-hidden h-44 md:h-48 shadow-soft group"
        >
          <img 
            src="https://images.unsplash.com/photo-1432821596592-e2c18b78144f?q=80&w=1200&auto=format&fit=crop" 
            alt="Luz entre folhas e acolhimento" 
            className="absolute inset-0 w-full h-50 object-cover filter brightness-[0.45] dark:brightness-[0.45] saturate-[0.85] animate-slow-pan"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/50 to-transparent z-10" />
          
          <div className="relative z-20 w-full h-full flex flex-col md:flex-row md:items-center justify-between items-start px-8 md:px-12 gap-4">
            <div className="text-white max-w-xl">
              <h1 className="font-sans text-2xl md:text-3xl font-light tracking-wide mb-1 flex items-center gap-2.5">
                <Users className="h-5 w-5 text-reflexo-rose stroke-[1.5]" />
                Fórum <span className="font-semibold">Anônimo</span>
              </h1>
              <p className="text-stone-200/90 font-sans text-xs md:text-sm font-light tracking-wide leading-relaxed">
                Um espaço seguro de escuta, eco e acolhimento compartilhado. Tudo aqui é rigorosamente confidencial — apenas o seu nickname é exibido.
              </p>
            </div>
            
            <button
              onClick={() => setShowForm((s) => !s)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-reflexo-rose text-white text-xs uppercase tracking-widest font-medium shadow-sm hover:opacity-95 transition"
            >
              <Plus className="h-3.5 w-3.5" /> Novo desabafo
            </button>
          </div>
        </motion.div>

        {/* FEEDBACK FEED FLUTUANTE DE CRIAÇÃO */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3 rounded-2xl bg-reflexo-beigeRose/15 dark:bg-stone-800/30 border border-reflexo-beigeRose/30 p-4 text-xs md:text-sm text-reflexo-brown dark:text-reflexo-beigeLight shadow-sm"
            >
              <Sparkles className="h-4 w-4 mt-0.5 text-reflexo-rose shrink-0" />
              <p className="font-light leading-relaxed">{feedback}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FORMULÁRIO COLAPSÁVEL DE ESCRITA GLASSMORPHIC */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
              className="overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="bg-white/50 dark:bg-stone-900/40 backdrop-blur-md rounded-2xl border border-stone-200/30 dark:border-stone-800/30 p-6 shadow-soft space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="md:col-span-1">
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      required
                      className="w-full text-xs rounded-xl border border-stone-200/40 dark:border-stone-800/40 bg-white/60 dark:bg-stone-800/20 px-4 py-2.5 outline-none text-reflexo-brown dark:text-reflexo-beigeLight cursor-pointer focus:border-reflexo-rose/40"
                    >
                      <option value="">Escolha uma categoria</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="Título do desabafo (opcional)"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-xl border border-stone-200/40 dark:border-stone-800/40 bg-white/60 dark:bg-stone-800/20 px-4 py-2.5 text-xs outline-none text-reflexo-brown dark:text-reflexo-beigeLight placeholder:opacity-40 focus:border-reflexo-rose/40"
                    />
                  </div>
                </div>

                <textarea
                  rows={5}
                  placeholder="Compartilhe o que está sobrecarregando sua mente, sem pressa..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="w-full bg-white/60 dark:bg-stone-800/20 rounded-xl border border-stone-200/40 dark:border-stone-800/40 px-4 py-3 outline-none resize-none font-sans text-xs md:text-sm text-reflexo-brown dark:text-reflexo-beigeLight placeholder:opacity-40 focus:border-reflexo-rose/40 leading-relaxed"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <p className="text-[10px] text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 flex items-center gap-1.5 font-light max-w-xl leading-relaxed">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-reflexo-rose/70" /> Lembre-se: respeito mútuo é obrigatório. Divulgação de dados pessoais ou conteúdos agressivos passam por moderação rígida para proteção coletiva.
                  </p>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-full bg-reflexo-rose text-white text-xs uppercase tracking-widest font-medium shadow-sm hover:opacity-95 transition disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    <MessageSquarePlus className="h-3.5 w-3.5" /> {saving ? 'Publicando...' : 'Soltar no fórum'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* NAVEGAÇÃO DE CHIPS DE CATEGORIAS MINIMALISTAS */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={() => selectCategory(null)}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest font-medium transition-all duration-300 ${
              activeCategory === null
                ? 'bg-reflexo-rose text-white shadow-sm'
                : 'bg-white/50 dark:bg-stone-900/20 border border-stone-200/40 dark:border-stone-800/40 text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 hover:border-reflexo-rose'
            }`}
          >
            Todas as vozes
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => selectCategory(c.id)}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest font-medium transition-all duration-300 ${
                activeCategory === c.id
                  ? 'bg-reflexo-rose text-white shadow-sm'
                  : 'bg-white/50 dark:bg-stone-900/20 border border-stone-200/40 dark:border-stone-800/40 text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 hover:border-reflexo-rose'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* LISTAGEM PRINCIPAL DE ENTRADAS ANÔNIMAS COESAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(index * 0.04, 0.2) }}
              whileHover={{ y: -3 }}
              className="group"
            >
              <Link
                to={`/forum/${post.id}`}
                className="flex flex-col justify-between rounded-2xl p-5 border border-stone-200/30 dark:border-stone-800/40 bg-white/50 dark:bg-stone-900/40 backdrop-blur-md hover:border-reflexo-rose/40 transition-all duration-300 min-h-[160px] shadow-soft hover:shadow-md"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] font-medium tracking-wide border px-2 py-0.5 rounded-full shadow-sm ${categoryColor(post.category_id)}`}>
                      {post.forum_categories?.name || 'Geral'}
                    </span>
                  </div>
                  <h3 className="font-sans text-base font-semibold mb-1.5 text-reflexo-brown dark:text-reflexo-beigeLight group-hover:text-reflexo-rose transition-colors duration-300 line-clamp-2">
                    {post.title || 'Sem título'}
                  </h3>
                  <p className="text-xs md:text-sm font-light leading-relaxed text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 line-clamp-3">
                    {post.content}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-[11px] font-medium tracking-wide text-stone-400 mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/30">
                  <span className="font-sans italic opacity-75">{post.author_nickname || 'Alma Anônima'}</span>
                  <span className="flex items-center gap-1 bg-stone-100/60 dark:bg-stone-800/40 border border-stone-200/10 rounded-full px-2.5 py-1 text-[10px] shadow-sm">
                    <MessageCircle className="h-3.5 w-3.5 text-reflexo-rose/70" />
                    {post.comment_count || 0}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}

          {posts.length === 0 && (
            <div className="col-span-full text-center py-12 border border-dashed border-stone-300/60 dark:border-stone-700/60 rounded-2xl">
              <p className="text-xs uppercase tracking-wider text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 font-light">
                Nenhum relato ecoando nesta categoria. Sinta-se confortável para iniciar a primeira conversa.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}