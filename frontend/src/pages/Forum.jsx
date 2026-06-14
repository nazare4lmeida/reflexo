import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageCircle, Plus, Sparkles } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import api from '../services/api';

// Cores suaves da paleta para alternar entre categorias
const CATEGORY_COLORS = [
  'bg-reflexo-rose/15 border-reflexo-rose/40 text-reflexo-rose',
  'bg-reflexo-beigeRose/30 border-reflexo-beigeRose/60 text-reflexo-brown',
  'bg-reflexo-gray/20 border-reflexo-gray/40 text-reflexo-brown',
  'bg-reflexo-beigeLight/40 border-reflexo-beigeLight text-reflexo-brown',
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
    return CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
  }

  return (
    <PageTransition>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Fórum Anônimo</h1>
          <p className="text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70">
            Um espaço de escuta e acolhimento. Tudo aqui é anônimo — apenas o seu nickname é mostrado.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-reflexo-rose text-white font-medium hover:opacity-90 transition self-start"
        >
          <Plus className="h-4 w-4" /> Novo desabafo
        </button>
      </div>

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-start gap-2 rounded-xl2 bg-reflexo-beigeRose/30 border border-reflexo-beigeRose/50 p-4 text-sm"
        >
          <Sparkles className="h-4 w-4 mt-0.5 text-reflexo-rose flex-shrink-0" />
          <p>{feedback}</p>
        </motion.div>
      )}

      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleSubmit}
          className="bg-white/70 dark:bg-white/10 rounded-xl2 shadow-soft p-6 mb-8 space-y-4 overflow-hidden"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full rounded-xl border border-reflexo-beigeRose/40 bg-white/60 dark:bg-white/10 px-4 py-2 outline-none"
            >
              <option value="">Escolha uma categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="Título (opcional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-reflexo-beigeRose/40 bg-white/60 dark:bg-white/10 px-4 py-2 outline-none"
          />
          <textarea
            rows={5}
            placeholder="Compartilhe o que está sentindo, sem pressa..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full rounded-xl border border-reflexo-beigeRose/40 bg-white/60 dark:bg-white/10 px-4 py-2 outline-none resize-none"
          />
          <p className="text-xs text-reflexo-brown/60 dark:text-reflexo-beigeLight/60">
            Lembre-se: respeito é obrigatório. Conteúdos ofensivos, discurso de ódio ou divulgação de dados pessoais não são permitidos e podem passar por moderação.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-full bg-reflexo-rose text-white font-medium hover:opacity-90 transition disabled:opacity-60"
          >
            {saving ? 'Publicando...' : 'Publicar'}
          </button>
        </motion.form>
      )}

      {/* Categorias */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => selectCategory(null)}
          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
            activeCategory === null
              ? 'bg-reflexo-rose text-white border-reflexo-rose'
              : 'bg-white/60 dark:bg-white/10 border-reflexo-beigeRose text-reflexo-brown dark:text-reflexo-beigeLight hover:border-reflexo-rose'
          }`}
        >
          Todas
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => selectCategory(c.id)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              activeCategory === c.id
                ? 'bg-reflexo-rose text-white border-reflexo-rose'
                : 'bg-white/60 dark:bg-white/10 border-reflexo-beigeRose text-reflexo-brown dark:text-reflexo-beigeLight hover:border-reflexo-rose'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Lista de posts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            whileHover={{ y: -4, scale: 1.01 }}
          >
            <Link
              to={`/forum/${post.id}`}
              className="block rounded-xl2 p-5 shadow-softer border border-reflexo-beigeRose/30 bg-white/70 dark:bg-white/10 hover:border-reflexo-rose transition-colors h-full"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${categoryColor(post.category_id)}`}
                >
                  {post.forum_categories?.name || 'Geral'}
                </span>
              </div>
              <h3 className="font-medium mb-1 line-clamp-2">{post.title || 'Sem título'}</h3>
              <p className="text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 line-clamp-3 mb-3">
                {post.content}
              </p>
              <div className="flex items-center justify-between text-xs text-reflexo-brown/50 dark:text-reflexo-beigeLight/50">
                <span>{post.author_nickname || 'Anônimo'}</span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {post.comment_count || 0}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}

        {posts.length === 0 && (
          <p className="text-sm text-reflexo-brown/60 dark:text-reflexo-beigeLight/60 col-span-full text-center py-10">
            Nenhum post por aqui ainda. Seja o primeiro a compartilhar.
          </p>
        )}
      </div>
    </PageTransition>
  );
}
