import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Trash2,
  Settings,
  BarChart3,
  BookOpen,
  Music2,
  Plus,
  X,
  Sparkles,
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import MentalHealthNotice from '../components/MentalHealthNotice';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AvatarPicker, { AvatarBubble } from '../components/AvatarPicker';

export default function Profile() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [nickname, setNickname] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState('light');
  const [avatarSeed, setAvatarSeed] = useState(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Favoritos
  const [books, setBooks] = useState([]);
  const [music, setMusic] = useState([]);
  const [newBook, setNewBook] = useState('');
  const [newSong, setNewSong] = useState('');
  const [spotifyConnected, setSpotifyConnected] = useState(false);

  async function load() {
    try {
      const res = await api.get('/profile/me');
      const p = res.data.profile;
      setProfile(p);
      setStats(res.data.stats);
      setNickname(p.nickname || '');
      setNotifications(p.notifications_enabled ?? true);
      setTheme(p.theme || 'light');
      setAvatarSeed(p.avatar_seed);
      setBooks(p.favorite_books || []);
      setMusic(p.favorite_music || []);
      setSpotifyConnected(p.spotify_connected || false);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function persist(extra = {}) {
    setSaving(true);
    setMessage('');
    try {
      await api.put('/profile/me', {
        nickname,
        notifications_enabled: notifications,
        theme,
        avatar_seed: avatarSeed,
        favorite_books: books,
        favorite_music: music,
        spotify_connected: spotifyConnected,
        ...extra,
      });
      setMessage('Preferências atualizadas com sucesso.');
      load();
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      setMessage(err.response?.data?.error || 'Não foi possível salvar agora.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    persist();
  }

  function selectAvatar(seed) {
    setAvatarSeed(seed);
    setShowAvatarPicker(false);
    persist({ avatar_seed: seed });
  }

  function addBook(e) {
    e.preventDefault();
    if (!newBook.trim()) return;
    const updated = [...books, newBook.trim()];
    setBooks(updated);
    setNewBook('');
    persist({ favorite_books: updated });
  }

  function removeBook(idx) {
    const updated = books.filter((_, i) => i !== idx);
    setBooks(updated);
    persist({ favorite_books: updated });
  }

  function addSong(e) {
    e.preventDefault();
    if (!newSong.trim()) return;
    const updated = [...music, newSong.trim()];
    setMusic(updated);
    setNewSong('');
    persist({ favorite_music: updated });
  }

  function removeSong(idx) {
    const updated = music.filter((_, i) => i !== idx);
    setMusic(updated);
    persist({ favorite_music: updated });
  }

  function toggleSpotify() {
    const updated = !spotifyConnected;
    setSpotifyConnected(updated);
    persist({ spotify_connected: updated });
  }

  async function handleExport() {
    try {
      const res = await api.get('/profile/export');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reflexo-meus-dados.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao exportar dados:', err);
    }
  }

  async function handleDelete() {
    try {
      await api.delete('/profile/me');
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Erro ao excluir conta:', err);
    }
  }

  if (!profile) {
    return (
      <PageTransition>
        <p className="text-sm text-reflexo-brown/60 dark:text-reflexo-beigeLight/60">Carregando...</p>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <h1 className="text-2xl font-semibold mb-1">Meu perfil</h1>
      <p className="text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 mb-6">
        Suas informações são privadas e visíveis apenas para você.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card de identidade */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white/70 dark:bg-white/10 rounded-xl2 shadow-soft p-6 flex flex-col items-center text-center"
        >
          <button onClick={() => setShowAvatarPicker(true)} className="relative group mb-3">
            <AvatarBubble seed={avatarSeed} size="lg" />
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 text-white text-xs font-medium"
            >
              Trocar
            </motion.div>
          </button>
          <h2 className="font-medium text-lg">{profile.nickname}</h2>
          <p className="text-xs text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 mt-1">
            Na plataforma desde{' '}
            {new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
          <button
            onClick={() => setShowAvatarPicker(true)}
            className="mt-3 text-xs px-3 py-1.5 rounded-full border border-reflexo-beigeRose hover:border-reflexo-rose transition"
          >
            Escolher avatar
          </button>
        </motion.div>

        {/* Estatísticas */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white/70 dark:bg-white/10 rounded-xl2 shadow-soft p-6 lg:col-span-2"
        >
          <h2 className="flex items-center gap-2 font-medium mb-4">
            <BarChart3 className="h-4 w-4 text-reflexo-rose" /> Suas estatísticas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            {[
              ['Entradas no diário', stats?.diaryEntries ?? 0],
              ['Memórias guardadas', stats?.memories ?? 0],
              [
                'Humor médio do mês',
                stats?.averageMoodThisMonth != null ? Number(stats.averageMoodThisMonth).toFixed(1) : '—',
              ],
            ].map(([label, value], i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.04 }}
                className="rounded-xl bg-reflexo-beigeRose/20 p-4"
              >
                <p className="text-2xl font-semibold text-reflexo-rose">{value}</p>
                <p className="text-xs text-reflexo-brown/60 dark:text-reflexo-beigeLight/60 mt-1">{label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Preferências */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white/70 dark:bg-white/10 rounded-xl2 shadow-soft p-6 lg:col-span-2"
        >
          <h2 className="flex items-center gap-2 font-medium mb-4">
            <Settings className="h-4 w-4 text-reflexo-rose" /> Preferências
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nickname</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full rounded-xl border border-reflexo-beigeRose/40 bg-white/60 dark:bg-white/10 px-4 py-2 outline-none"
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="accent-reflexo-rose"
              />
              Receber notificações (cartas disponíveis, comunicados)
            </label>

            <div>
              <label className="block text-sm font-medium mb-1">Tema</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full sm:w-auto rounded-xl border border-reflexo-beigeRose/40 bg-white/60 dark:bg-white/10 px-4 py-2 outline-none"
              >
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
              </select>
            </div>

            {message && <p className="text-sm text-reflexo-rose">{message}</p>}

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-full bg-reflexo-rose text-white font-medium hover:opacity-90 transition disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Salvar preferências'}
            </button>
          </form>
        </motion.div>

        {/* Privacidade e LGPD */}
        <motion.div whileHover={{ y: -4 }} className="bg-white/70 dark:bg-white/10 rounded-xl2 shadow-soft p-6">
          <h2 className="font-medium mb-4">Privacidade e dados</h2>
          <p className="text-xs text-reflexo-brown/60 dark:text-reflexo-beigeLight/60 mb-4">
            Em conformidade com a LGPD, você pode exportar uma cópia de todos os seus dados ou excluir
            permanentemente sua conta a qualquer momento.
          </p>
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-reflexo-beigeRose bg-white/60 dark:bg-white/10 hover:border-reflexo-rose transition text-sm mb-3"
          >
            <Download className="h-4 w-4" /> Exportar meus dados
          </button>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition text-sm"
            >
              <Trash2 className="h-4 w-4" /> Excluir conta permanentemente
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-red-300 p-3 text-sm"
            >
              <p className="mb-3 text-red-500">
                Esta ação é irreversível. Todos os seus dados — diário, memórias, cartas e posts — serão
                excluídos permanentemente. Tem certeza?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 px-4 py-2 rounded-full border border-reflexo-beigeRose/50 text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 rounded-full bg-red-500 text-white text-sm hover:opacity-90"
                >
                  Sim, excluir
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Livros favoritos */}
        <motion.div whileHover={{ y: -4 }} className="bg-white/70 dark:bg-white/10 rounded-xl2 shadow-soft p-6">
          <h2 className="flex items-center gap-2 font-medium mb-4">
            <BookOpen className="h-4 w-4 text-reflexo-rose" /> Livros que eu amo
          </h2>
          <form onSubmit={addBook} className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Título do livro..."
              value={newBook}
              onChange={(e) => setNewBook(e.target.value)}
              className="flex-1 rounded-xl border border-reflexo-beigeRose/40 bg-white/60 dark:bg-white/10 px-3 py-2 text-sm outline-none"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-reflexo-rose text-white hover:opacity-90"
              aria-label="Adicionar livro"
            >
              <Plus className="h-4 w-4" />
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {books.map((b, i) => (
                <motion.span
                  key={b + i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full bg-reflexo-beigeRose/30 border border-reflexo-beigeRose/40"
                >
                  📖 {b}
                  <button onClick={() => removeBook(i)} aria-label="Remover">
                    <X className="h-3 w-3 opacity-60 hover:opacity-100" />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
            {books.length === 0 && (
              <p className="text-xs text-reflexo-brown/50 dark:text-reflexo-beigeLight/50">
                Nenhum livro adicionado ainda.
              </p>
            )}
          </div>
        </motion.div>

        {/* Músicas favoritas + Spotify */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white/70 dark:bg-white/10 rounded-xl2 shadow-soft p-6 lg:col-span-2"
        >
          <h2 className="flex items-center gap-2 font-medium mb-4">
            <Music2 className="h-4 w-4 text-reflexo-rose" /> Músicas que me representam
          </h2>
          <form onSubmit={addSong} className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Música - Artista..."
              value={newSong}
              onChange={(e) => setNewSong(e.target.value)}
              className="flex-1 rounded-xl border border-reflexo-beigeRose/40 bg-white/60 dark:bg-white/10 px-3 py-2 text-sm outline-none"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-reflexo-rose text-white hover:opacity-90"
              aria-label="Adicionar música"
            >
              <Plus className="h-4 w-4" />
            </button>
          </form>
          <div className="flex flex-wrap gap-2 mb-4">
            <AnimatePresence>
              {music.map((m, i) => (
                <motion.span
                  key={m + i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full bg-reflexo-beigeRose/30 border border-reflexo-beigeRose/40"
                >
                  🎵 {m}
                  <button onClick={() => removeSong(i)} aria-label="Remover">
                    <X className="h-3 w-3 opacity-60 hover:opacity-100" />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
            {music.length === 0 && (
              <p className="text-xs text-reflexo-brown/50 dark:text-reflexo-beigeLight/50">
                Nenhuma música adicionada ainda.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-reflexo-beigeRose/30 p-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-lg">🟢</span>
              <span>
                Spotify {spotifyConnected ? '— conectado' : ''}
              </span>
            </div>
            <button
              onClick={toggleSpotify}
              className={`text-xs px-3 py-1.5 rounded-full transition ${
                spotifyConnected
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-reflexo-rose text-white hover:opacity-90'
              }`}
            >
              {spotifyConnected ? 'Desconectar' : 'Conectar Spotify'}
            </button>
          </div>
          <p className="text-xs text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 mt-2">
            A integração completa com o Spotify (importar playlists automaticamente) ainda está em
            desenvolvimento — por enquanto, você pode marcar como conectado e adicionar suas músicas
            favoritas manualmente acima.
          </p>
        </motion.div>
      </div>

      <div className="mt-6">
        <MentalHealthNotice />
      </div>

      {/* Modal de seleção de avatar */}
      <AnimatePresence>
        {showAvatarPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAvatarPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-reflexo-dark rounded-xl2 shadow-soft p-6 max-w-md w-full"
            >
              <h3 className="flex items-center gap-2 font-medium mb-4">
                <Sparkles className="h-4 w-4 text-reflexo-rose" /> Escolha seu avatar
              </h3>
              <AvatarPicker value={avatarSeed} onChange={selectAvatar} />
              <button
                onClick={() => setShowAvatarPicker(false)}
                className="mt-4 w-full px-4 py-2 rounded-full border border-reflexo-beigeRose/50 text-sm"
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
