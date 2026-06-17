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
  User,
  ShieldAlert,
  Bell,
  Palette
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

  // Listas de Favoritos
  const [books, setBooks] = useState([]);
  const [music, setMusic] = useState([]);
  const [newBook, setNewBook] = useState('');
  const [newSong, setNewSong] = useState('');
  const [spotifyConnected, setSpotifyConnected] = useState(false);

  async function load() {
    try {
      const res = await api.get('/profile/me');
      const p = res.data.profile;
      if (p) {
        setProfile(p);
        setStats(res.data.stats || null);
        setNickname(p.nickname || '');
        setNotifications(p.notifications_enabled ?? true);
        setTheme(p.theme || 'light');
        setAvatarSeed(p.avatar_seed || null);
        setBooks(p.favorite_books || []);
        setMusic(p.favorite_music || []);
        setSpotifyConnected(p.spotify_connected || false);
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function persist(payloadPayload = null) {
    setSaving(true);
    setMessage('');
    
    // Constrói o corpo da requisição garantindo valores fallback seguros
    const body = {
      nickname: nickname,
      notifications_enabled: notifications,
      theme: theme,
      avatar_seed: avatarSeed,
      favorite_books: books,
      favorite_music: music,
      spotify_connected: spotifyConnected,
      ...(payloadPayload || {})
    };

    try {
      await api.put('/profile/me', body);
      setMessage('Configurações salvas com sucesso.');
      
      // Atualiza o estado da aplicação local com o payload enviado para evitar loops
      if (payloadPayload) {
        if (payloadPayload.avatar_seed !== undefined) setAvatarSeed(payloadPayload.avatar_seed);
        if (payloadPayload.favorite_books !== undefined) setBooks(payloadPayload.favorite_books);
        if (payloadPayload.favorite_music !== undefined) setMusic(payloadPayload.favorite_music);
        if (payloadPayload.spotify_connected !== undefined) setSpotifyConnected(payloadPayload.spotify_connected);
      }
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      setMessage(err.response?.data?.error || 'Não foi possível salvar agora.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!nickname.trim()) return;
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
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <p className="text-xs uppercase tracking-widest opacity-40">Sincronizando suas chaves privadas...</p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        
        {/* HERO CAPA DO PERFIL COM IMAGEM DO UNSPLASH OTIMIZADA */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-full rounded-[2rem] overflow-hidden h-44 md:h-48 shadow-soft"
        >
          <img 
            src="https://images.unsplash.com/photo-1578941838877-141265f3a898?q=80&w=1200&auto=format&fit=crop" 
            alt="Escrita e calmaria analógica" 
            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.65] dark:brightness-[0.4] saturate-[0.85]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/60 to-transparent z-10" />
          
          <div className="relative z-20 w-full h-full flex flex-col justify-center items-start px-8 md:px-12 text-white">
            <h1 className="font-sans text-2xl md:text-3xl font-light tracking-wide mb-1 flex items-center gap-2">
              <User className="h-5 w-5 text-reflexo-rose stroke-[1.5]" /> 
              Meu <span className="font-semibold">Perfil</span>
            </h1>
            <p className="text-stone-200/90 font-sans text-xs md:text-sm font-light tracking-wide max-w-md">
              Suas informações de jornada, preferências e dados privados protegidos em um único lugar.
            </p>
          </div>
        </motion.div>

        {/* DISTRIBUIÇÃO EM GRADE DO PERFIL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* COLUNA ESQUERDA: CARD DE IDENTIDADE ANALÓGICA */}
          <div className="space-y-6">
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white/50 dark:bg-stone-900/40 backdrop-blur-md rounded-2xl border border-stone-200/30 dark:border-stone-800/40 p-6 flex flex-col items-center text-center shadow-soft"
            >
              <button 
                type="button"
                onClick={() => setShowAvatarPicker(true)} 
                className="relative group mb-4 shadow-md rounded-full transition-transform duration-300 hover:scale-102"
              >
                <AvatarBubble seed={avatarSeed} size="lg" />
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-stone-900/40 text-white text-[10px] uppercase tracking-widest font-medium transition-opacity"
                >
                  Alterar
                </motion.div>
              </button>

              <h2 className="font-sans font-semibold text-lg text-reflexo-brown dark:text-reflexo-beigeLight">{nickname || 'Sem apelido'}</h2>
              <p className="text-[10px] uppercase tracking-wider text-reflexo-brown/40 dark:text-reflexo-beigeLight/40 font-semibold mt-1">
                Membro desde{' '}
                {new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </p>

              <button
                type="button"
                onClick={() => setShowAvatarPicker(true)}
                className="mt-4 text-[10px] uppercase tracking-widest font-semibold px-4 py-2 rounded-full border border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-800/20 text-reflexo-brown/80 dark:text-reflexo-beigeLight/80 hover:border-reflexo-rose hover:text-reflexo-rose transition-all duration-300"
              >
                Mudar Ilustração
              </button>
            </motion.div>

            {/* PRIVACIDADE E EXCLUSÃO (LGPD) */}
            <motion.div 
              whileHover={{ y: -2 }}
              className="bg-white/50 dark:bg-stone-900/40 backdrop-blur-md rounded-2xl border border-stone-200/30 dark:border-stone-800/40 p-6 shadow-soft space-y-4"
            >
              <h3 className="font-sans text-xs uppercase tracking-[0.2em] text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 font-semibold flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-reflexo-rose/70" /> Privacidade & LGPD
              </h3>
              <p className="text-xs font-light text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 leading-relaxed">
                Em total conformidade com a LGPD, seus dados pertencem estritamente a você. Exporte um arquivo ou remova sua conta permanentemente quando quiser.
              </p>
              
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleExport}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-800/20 text-xs font-medium uppercase tracking-wider text-reflexo-brown/80 dark:text-reflexo-beigeLight/80 hover:border-reflexo-rose hover:text-reflexo-rose transition-all duration-300 shadow-sm"
                >
                  <Download className="h-3.5 w-3.5 opacity-60" /> Exportar meus dados (.json)
                </button>

                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/10 text-xs font-medium uppercase tracking-wider transition-all duration-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Encerrar Conta Permanentemente
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="rounded-xl border border-red-200 bg-red-50/20 dark:bg-red-950/5 p-4 space-y-3"
                  >
                    <p className="text-xs text-red-500 font-light leading-relaxed">
                      Esta operação é definitiva. Todas as suas escritas síncronas do diário, memórias fotográficas, cartas guardadas e postagens anônimas serão destruídas dos servidores. Continuar?
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 px-3 py-2 rounded-full border border-stone-200 text-[11px] font-medium uppercase tracking-wider text-stone-600 bg-white dark:bg-stone-900"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="flex-1 px-3 py-2 rounded-full bg-red-500 text-white text-[11px] font-medium uppercase tracking-wider hover:bg-red-600 transition-colors"
                      >
                        Apagar tudo
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* COLUNA DIREITA: ESTATÍSTICAS E PAINÉIS DE PREFERÊNCIAS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* CARD DE INDICADORES DE EVOLUÇÃO */}
            <div className="bg-white/50 dark:bg-stone-900/40 backdrop-blur-md rounded-2xl border border-stone-200/30 dark:border-stone-800/40 p-6 shadow-soft">
              <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 font-semibold mb-5 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-reflexo-rose/70" /> Resumo de Engajamento Interno
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  ['Páginas do Diário', stats?.diaryEntries ?? 0],
                  ['Memórias Fixadas', stats?.memories ?? 0],
                  ['Humor Médio (Mês)', stats?.averageMoodThisMonth != null ? Number(stats.averageMoodThisMonth).toFixed(1) : '—'],
                ].map(([label, value], i) => (
                  <div key={label} className="rounded-xl bg-stone-50/60 dark:bg-stone-800/10 border border-stone-200/10 p-4 flex flex-col justify-between shadow-sm">
                    <p className="text-3xl font-light font-sans text-reflexo-rose font-semibold">{value}</p>
                    <p className="text-[11px] text-reflexo-brown/60 dark:text-reflexo-beigeLight/60 font-light mt-1.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* PREFERÊNCIAS OPERACIONAIS DO SISTEMA */}
            <div className="bg-white/50 dark:bg-stone-900/40 backdrop-blur-md rounded-2xl border border-stone-200/30 dark:border-stone-800/40 p-6 shadow-soft">
              <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 font-semibold mb-5 flex items-center gap-2">
                <Settings className="h-4 w-4 text-reflexo-rose/70" /> Configurações Gerais da Conta
              </h2>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-reflexo-brown/60 dark:text-reflexo-beigeLight/60 block mb-1.5">Identidade (Nickname)</label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full rounded-xl border border-stone-200/40 dark:border-stone-800/40 bg-white/60 dark:bg-stone-800/20 px-4 py-2.5 text-xs outline-none text-reflexo-brown dark:text-reflexo-beigeLight focus:border-reflexo-rose/40"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-reflexo-brown/60 dark:text-reflexo-beigeLight/60 block mb-1.5 flex items-center gap-1"><Palette className="h-3.5 w-3.5 text-reflexo-rose/60" /> Customização de Tema</label>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="w-full rounded-xl border border-stone-200/40 dark:border-stone-800/40 bg-white/60 dark:bg-stone-800/20 px-4 py-2.5 text-xs outline-none text-reflexo-brown dark:text-reflexo-beigeLight cursor-pointer focus:border-reflexo-rose/40"
                    >
                      <option value="light">Modo Claro (Papel de Carta)</option>
                      <option value="dark">Modo Escuro (Calmaria da Noite)</option>
                    </select>
                  </div>
                </div>

                <div className="py-2">
                  <label className="flex items-start gap-3 text-xs text-reflexo-brown/80 dark:text-reflexo-beigeLight/80 cursor-pointer font-light select-none leading-relaxed">
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      className="mt-0.5 accent-reflexo-rose rounded cursor-pointer"
                    />
                    <span className="flex items-center gap-1.5">
                      <Bell className="h-3.5 w-3.5 text-stone-400" /> Ativar notificações no e-mail (alertas de cápsulas do tempo liberadas e desabafos aprovados).
                    </span>
                  </label>
                </div>

                {message && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-medium text-reflexo-rose bg-reflexo-rose/5 w-max px-3 py-1 rounded-full border border-reflexo-rose/10">
                    {message}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full bg-reflexo-rose text-white text-xs uppercase tracking-widest font-medium shadow-sm hover:opacity-95 transition disabled:opacity-50"
                >
                  {saving ? 'Atualizando servidores...' : 'Salvar preferências'}
                </button>
              </form>
            </div>

            {/* SEÇÕES DE FAVORITOS INTERNOS (LIVROS E MÚSICAS) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* BLOCO DE LEITURAS REFINADO */}
              <div className="bg-white/50 dark:bg-stone-900/40 backdrop-blur-md rounded-2xl border border-stone-200/30 dark:border-stone-800/40 p-6 shadow-soft flex flex-col justify-between">
                <div>
                  <h3 className="font-sans text-xs uppercase tracking-[0.2em] text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 font-semibold mb-4 flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-reflexo-rose/70" /> Livros de Cabeceira
                  </h3>
                  <form onSubmit={addBook} className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Título da obra ou autor..."
                      value={newBook}
                      onChange={(e) => setNewBook(e.target.value)}
                      className="flex-1 rounded-xl border border-stone-200/40 dark:border-stone-800/40 bg-white/60 dark:bg-stone-800/20 px-3 py-2 text-xs outline-none text-reflexo-brown dark:text-reflexo-beigeLight placeholder:opacity-40"
                    />
                    <button
                      type="submit"
                      className="p-2 rounded-xl bg-reflexo-rose text-white hover:opacity-90 shadow-sm flex items-center justify-center shrink-0"
                      aria-label="Anexar livro"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                    <AnimatePresence>
                      {books.map((b, i) => (
                        <motion.span
                          key={b + i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-stone-100/80 dark:bg-stone-800/50 border border-stone-200/10 text-reflexo-brown/80 dark:text-reflexo-beigeLight/80 shadow-sm font-light"
                        >
                          <span className="opacity-70">📖</span> <span className="truncate max-w-[120px]">{b}</span>
                          <button type="button" onClick={() => removeBook(i)} aria-label="Desvincular livro">
                            <X className="h-3 w-3 text-stone-400 hover:text-reflexo-rose" />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                    {books.length === 0 && (
                      <p className="text-[11px] text-stone-400 font-light italic">Nenhuma obra adicionada à cabeceira.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* BLOCO DE TRILHA SONORA REFINADO + SPOTIFY */}
              <div className="bg-white/50 dark:bg-stone-900/40 backdrop-blur-md rounded-2xl border border-stone-200/30 dark:border-stone-800/40 p-6 shadow-soft flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-sans text-xs uppercase tracking-[0.2em] text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 font-semibold mb-4 flex items-center gap-1.5">
                    <Music2 className="h-4 w-4 text-reflexo-rose/70" /> Músicas de Alento
                  </h3>
                  <form onSubmit={addSong} className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Música - Banda..."
                      value={newSong}
                      onChange={(e) => setNewSong(e.target.value)}
                      className="flex-1 rounded-xl border border-stone-200/40 dark:border-stone-800/40 bg-white/60 dark:bg-stone-800/20 px-3 py-2 text-xs outline-none text-reflexo-brown dark:text-reflexo-beigeLight placeholder:opacity-40"
                    />
                    <button
                      type="submit"
                      className="p-2 rounded-xl bg-reflexo-rose text-white hover:opacity-90 shadow-sm flex items-center justify-center shrink-0"
                      aria-label="Anexar música"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pr-1 mb-4">
                    <AnimatePresence>
                      {music.map((m, i) => (
                        <motion.span
                          key={m + i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-stone-100/80 dark:bg-stone-800/50 border border-stone-200/10 text-reflexo-brown/80 dark:text-reflexo-beigeLight/80 shadow-sm font-light"
                        >
                          <span className="opacity-70">🎵</span> <span className="truncate max-w-[120px]">{m}</span>
                          <button type="button" onClick={() => removeSong(i)} aria-label="Desvincular canção">
                            <X className="h-3 w-3 text-stone-400 hover:text-reflexo-rose" />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                    {music.length === 0 && (
                      <p className="text-[11px] text-stone-400 font-light italic">Nenhuma melodia anexada.</p>
                    )}
                  </div>
                </div>

                {/* PAINEL SPOTIFY INTEGRADO */}
                <div className="flex items-center justify-between rounded-xl border border-stone-200/40 dark:border-stone-800/60 p-3 bg-stone-50/30 dark:bg-stone-900/10">
                  <div className="flex items-center gap-2 text-xs font-medium text-reflexo-brown/90 dark:text-reflexo-beigeLight/90">
                    <span className="text-sm select-none">🟢</span>
                    <span>Spotify {spotifyConnected ? 'Ativo' : 'Inativo'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleSpotify}
                    className={`text-[10px] uppercase tracking-widest font-semibold px-3 py-1.5 rounded-full transition-all duration-300 ${
                      spotifyConnected
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/20'
                        : 'bg-reflexo-rose text-white shadow-sm'
                    }`}
                  >
                    {spotifyConnected ? 'Desconectar' : 'Sincronizar'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* NOTA DE RODAPÉ DE SAÚDE MENTAL DE APOIO INTEGRADA */}
        <div className="pt-2">
          <MentalHealthNotice className="rounded-2xl shadow-soft" />
        </div>
      </div>

      {/* MODAL RESPONSIVO SELETOR DE AVATAR */}
      <AnimatePresence>
        {showAvatarPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-950/40 dark:bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowAvatarPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-stone-900 border border-stone-200/40 dark:border-stone-800/40 rounded-3xl shadow-deep p-6 max-w-md w-full"
            >
              <h3 className="flex items-center gap-2 font-sans text-sm font-semibold mb-4 text-reflexo-brown dark:text-reflexo-beigeLight">
                <Sparkles className="h-4 w-4 text-reflexo-rose" /> Escolha sua ilustração de jornada
              </h3>
              <div className="max-h-[50vh] overflow-y-auto p-1">
                <AvatarPicker value={avatarSeed} onChange={selectAvatar} />
              </div>
              <button
                type="button"
                onClick={() => setShowAvatarPicker(false)}
                className="mt-4 w-full px-4 py-2.5 rounded-full border border-stone-200 dark:border-stone-800 text-xs font-medium uppercase tracking-widest text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 transition"
              >
                Fechar janela
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}