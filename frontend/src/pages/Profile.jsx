import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
  Palette,
} from "lucide-react";
import PageTransition from "../components/PageTransition";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import AvatarPicker, { AvatarBubble } from "../components/AvatarPicker";

// Recebemos onToggleDarkMode para poder alterar o tema global do app direto pelas preferências
export default function Profile({ onToggleDarkMode }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [nickname, setNickname] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState("light");
  const [avatarSeed, setAvatarSeed] = useState(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Listas de Favoritos
  const [books, setBooks] = useState([]);
  const [music, setMusic] = useState([]);
  const [newBook, setNewBook] = useState("");
  const [newSong, setNewSong] = useState("");
  const [spotifyConnected, setSpotifyConnected] = useState(false);

  async function load() {
    try {
      const res = await api.get("/profile/me");
      const p = res.data.profile;
      if (p) {
        setProfile(p);
        setStats(res.data.stats || null);
        setNickname(p.nickname || "");
        setNotifications(p.notifications_enabled ?? true);
        setTheme(p.theme || "light");
        setAvatarSeed(p.avatar_seed || null);
        setBooks(p.favorite_books || []);
        setMusic(p.favorite_music || []);
        setSpotifyConnected(p.spotify_connected || false);
      }
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function persist(payloadPayload = null) {
    setSaving(true);
    setMessage("");

    const body = {
      nickname: nickname,
      notifications_enabled: notifications,
      theme: theme,
      avatar_seed: avatarSeed,
      favorite_books: books,
      favorite_music: music,
      spotify_connected: spotifyConnected,
      ...(payloadPayload || {}),
    };

    try {
      await api.put("/profile/me", body);
      setMessage("Configurações salvas com sucesso.");

      if (payloadPayload) {
        if (payloadPayload.avatar_seed !== undefined)
          setAvatarSeed(payloadPayload.avatar_seed);
        if (payloadPayload.favorite_books !== undefined)
          setBooks(payloadPayload.favorite_books);
        if (payloadPayload.favorite_music !== undefined)
          setMusic(payloadPayload.favorite_music);
        if (payloadPayload.spotify_connected !== undefined)
          setSpotifyConnected(payloadPayload.spotify_connected);
      }
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      setMessage(err.response?.data?.error || "Não foi possível salvar agora.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!nickname.trim()) return;
    persist();
  }

  // Monitora a troca do select de temas e aplica a alteração visual na hora
  function handleThemeChange(newTheme) {
    setTheme(newTheme);

    // Se a função global de toggle existir, nós a executamos para mudar as classes do HTML em tempo real
    if (typeof onToggleDarkMode === "function") {
      onToggleDarkMode(newTheme);
    }

    // Salva a preferência imediatamente no banco de dados
    persist({ theme: newTheme });
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
    setNewBook("");
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
    setNewSong("");
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
      const res = await api.get("/profile/export");
      const data = res.data;

      // Pegamos os dados e construímos um documento HTML com design vintage/editorial integrado
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reflexo - Minha Jornada</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
            
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              background-color: #fcfbf7;
              color: #292524;
              margin: 0;
              padding: 40px 20px;
              line-height: 1.6;
            }
            .container {
              max-width: 750px;
              margin: 0 auto;
            }
            header {
              text-align: center;
              margin-bottom: 60px;
              border-b: 1px solid #e7e5e4;
              padding-bottom: 20px;
            }
            h1 {
              font-family: 'Playfair Display', serif;
              font-size: 2.5rem;
              margin-bottom: 10px;
              color: #1c1917;
            }
            h2 {
              font-family: 'Playfair Display', serif;
              font-size: 1.8rem;
              color: #b45309;
              border-bottom: 1px solid #f5eae6;
              padding-bottom: 8px;
              margin-top: 50px;
            }
            .card {
              background: #ffffff;
              border: 1px solid #f5eae6;
              border-radius: 16px;
              padding: 24px;
              margin-bottom: 24px;
              box-shadow: 0 4px 12px rgba(28, 25, 23, 0.02);
            }
            .meta {
              font-size: 0.75rem;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: #78716c;
              margin-bottom: 12px;
            }
            .title {
              font-family: 'Playfair Display', serif;
              font-size: 1.3rem;
              font-weight: 600;
              margin: 0 0 8px 0;
              color: #1c1917;
            }
            .content {
              font-size: 0.95rem;
              color: #44403c;
              white-space: pre-wrap;
            }
            .badge {
              display: inline-block;
              font-size: 0.7rem;
              font-weight: 600;
              background: #f5eae6;
              color: #da727e;
              padding: 4px 10px;
              border-radius: 20px;
              margin-top: 12px;
              margin-right: 6px;
            }
            .photo {
              width: 100%;
              max-height: 350px;
              object-cover: cover;
              border-radius: 8px;
              margin-bottom: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <header>
              <h1>Minha Jornada no Reflexo</h1>
              <p>Arquivo pessoal de recordações e autoconhecimento exportado em ${new Date().toLocaleDateString("pt-BR")}</p>
            </header>

            <h2>Páginas do Diário</h2>
            ${
              data.entries && data.entries.length > 0
                ? data.entries
                    .map(
                      (e) => `
              <div class="card">
                <div class="meta">${new Date(e.created_at).toLocaleString("pt-BR")}</div>
                <div class="title">${e.title || "Sem título"}</div>
                <div class="content">${e.content}</div>
                ${e.emotion_tags ? e.emotion_tags.map((tag) => `<span class="badge">${tag}</span>`).join("") : ""}
                <span class="badge" style="background: #fdf2f8; color: #db2777;">Intensidade: ${e.intensity}/10</span>
              </div>
            `,
                    )
                    .join("")
                : '<p class="content">Nenhuma entrada registrada.</p>'
            }

            <h2>Álbum de Memórias</h2>
            ${
              data.memories && data.memories.length > 0
                ? data.memories
                    .map(
                      (m) => `
              <div class="card">
                <div class="meta">${new Date(m.memory_date).toLocaleDateString("pt-BR")}</div>
                ${m.image_url ? `<img src="${m.image_url}" class="photo" alt="${m.title}" />` : ""}
                <div class="title">${m.title}</div>
                <div class="content">${m.description || ""}</div>
              </div>
            `,
                    )
                    .join("")
                : '<p class="content">Nenhuma memória salva.</p>'
            }

            <h2>Cartas para o Futuro</h2>
            ${
              data.letters && data.letters.length > 0
                ? data.letters
                    .map(
                      (l) => `
              <div class="card">
                <div class="meta">Disponível em: ${new Date(l.deliver_at).toLocaleDateString("pt-BR")} | Status: ${l.is_opened ? "Aberta" : "Lacrada"}</div>
                <div class="title">${l.title || "Carta para o futuro"}</div>
                <div class="content">${l.is_opened ? l.content : "<i>Esta carta ainda está guardada pelo tempo e não pode ser lida.</i>"}</div>
              </div>
            `,
                    )
                    .join("")
                : '<p class="content">Nenhuma carta escrita.</p>'
            }
          </div>
        </body>
        </html>
      `;

      // Criamos o blob contendo o HTML ao invés do JSON stringificado
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reflexo-minha-jornada-${nickname || "perfil"}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao exportar dados:", err);
    }
  }

  async function handleDelete() {
    try {
      await api.delete("/profile/me");
      await signOut();
      navigate("/");
    } catch (err) {
      console.error("Erro ao excluir conta:", err);
    }
  }

  if (!profile) {
    return (
      <PageTransition>
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <p className="text-xs uppercase tracking-widest opacity-40">
            Sincronizando suas chaves privadas...
          </p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      {/* CONTAINER DO PLANO DE FUNDO COMPLETO DA TELA */}
      <div
        className="w-full min-h-screen bg-cover bg-center bg-no-repeat py-8 px-4 md:px-6 relative"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1578941838877-141265f3a898?q=80&w=1400&auto=format&fit=crop')",
        }}
      >
        {/* Camada escura/fosca por cima da imagem para garantir contraste perfeito no claro e escuro */}
        <div className="absolute inset-0 bg-stone-900/10 dark:bg-stone-950/40 pointer-events-none z-0" />

        <div className="max-w-6xl mx-auto space-y-6 relative z-10">
          {/* CABEÇALHO INTEGRADO (GLASSMORPHIC) */}
          <div className="bg-white/40 dark:bg-stone-900/30 backdrop-blur-md rounded-2xl border border-white/20 dark:border-stone-800/20 p-6 md:p-8 shadow-soft">
            <h1 className="font-sans text-2xl md:text-3xl font-light tracking-wide text-stone-900 dark:text-white flex items-center gap-2">
              <User className="h-5 w-5 text-reflexo-rose stroke-[1.5]" />
              Meu <span className="font-semibold">Perfil</span>
            </h1>
            <p className="text-stone-800/80 dark:text-stone-200/80 font-sans text-xs md:text-sm font-light tracking-wide max-w-md mt-1">
              Suas informações de jornada, preferências e dados privados
              protegidos em um único lugar.
            </p>
          </div>

          {/* DISTRIBUIÇÃO EM GRADE DO PERFIL */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* COLUNA ESQUERDA: CARD DE IDENTIDADE ANALÓGICA */}
            <div className="space-y-6">
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-white/60 dark:bg-stone-900/50 backdrop-blur-md rounded-2xl border border-white/20 dark:border-stone-800/20 p-6 flex flex-col items-center text-center shadow-soft"
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

                <h2 className="font-sans font-semibold text-lg text-stone-900 dark:text-white">
                  {nickname || "Sem apelido"}
                </h2>
                <p className="text-[10px] uppercase tracking-wider text-stone-600/70 dark:text-stone-400/70 font-semibold mt-1">
                  Membro desde{" "}
                  {new Date(profile.created_at).toLocaleDateString("pt-BR", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>

                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(true)}
                  className="mt-4 text-[10px] uppercase tracking-widest font-semibold px-4 py-2 rounded-full border border-stone-300 dark:border-stone-700 bg-white/80 dark:bg-stone-800/40 text-stone-800 dark:text-stone-200 hover:border-reflexo-rose hover:text-reflexo-rose transition-all duration-300"
                >
                  Mudar Ilustração
                </button>
              </motion.div>

              {/* PRIVACIDADE E EXCLUSÃO (LGPD) */}
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-white/60 dark:bg-stone-900/50 backdrop-blur-md rounded-2xl border border-white/20 dark:border-stone-800/20 p-6 shadow-soft space-y-4"
              >
                <h3 className="font-sans text-xs uppercase tracking-[0.2em] text-stone-700 dark:text-stone-300 font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-reflexo-rose/70" />{" "}
                  Privacidade & LGPD
                </h3>
                <p className="text-xs font-light text-stone-800/90 dark:text-stone-200/90 leading-relaxed">
                  Em total conformidade com a LGPD, seus dados pertencem
                  estritamente a você. Exporte um arquivo ou remova sua conta
                  permanentemente quando quiser.
                </p>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handleExport}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-800/40 text-xs font-medium uppercase tracking-wider text-reflexo-brown/80 dark:text-reflexo-beigeLight/80 hover:border-reflexo-rose hover:text-reflexo-rose transition-all duration-300 shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5 opacity-60" /> Exportar
                    Diário & Lembranças (HTML)
                  </button>

                  {!confirmDelete ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-red-300 text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/10 text-xs font-medium uppercase tracking-wider transition-all duration-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Encerrar Conta
                      Permanentemente
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="rounded-xl border border-red-200 bg-red-50/20 dark:bg-red-950/5 p-4 space-y-3"
                    >
                      <p className="text-xs text-red-500 font-light leading-relaxed">
                        Esta operação é definitiva. Todas as suas escritas
                        síncronas serão destruídas. Continuar?
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(false)}
                          className="flex-1 px-3 py-2 rounded-full border border-stone-300 text-[11px] font-medium uppercase tracking-wider text-stone-600 bg-white dark:bg-stone-900"
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
              <div className="bg-white/60 dark:bg-stone-900/50 backdrop-blur-md rounded-2xl border border-white/20 dark:border-stone-800/20 p-6 shadow-soft">
                <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-stone-700 dark:text-stone-300 font-semibold mb-5 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-reflexo-rose/70" /> Resumo
                  de Engajamento Interno
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    ["Páginas do Diário", stats?.diaryEntries ?? 0],
                    ["Memórias Fixadas", stats?.memories ?? 0],
                    [
                      "Humor Médio (Mês)",
                      stats?.averageMoodThisMonth != null
                        ? Number(stats.averageMoodThisMonth).toFixed(1)
                        : "—",
                    ],
                  ].map(([label, value], i) => (
                    <div
                      key={label}
                      className="rounded-xl bg-white/80 dark:bg-stone-800/30 border border-stone-200/40 p-4 flex flex-col justify-between shadow-sm"
                    >
                      <p className="text-3xl font-light font-sans text-reflexo-rose">
                        {value}
                      </p>
                      <p className="text-[11px] text-stone-600 dark:text-stone-400 font-light mt-1.5">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* PREFERÊNCIAS OPERACIONAIS DO SISTEMA */}
              <div className="bg-white/60 dark:bg-stone-900/50 backdrop-blur-md rounded-2xl border border-white/20 dark:border-stone-800/20 p-6 shadow-soft">
                <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-stone-700 dark:text-stone-300 font-semibold mb-5 flex items-center gap-2">
                  <Settings className="h-4 w-4 text-reflexo-rose/70" />{" "}
                  Configurações Gerais da Conta
                </h2>

                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-semibold text-stone-700 dark:text-stone-300 block mb-1.5">
                        Identidade (Nickname)
                      </label>
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white/80 dark:bg-stone-800/40 px-4 py-2.5 text-xs outline-none text-stone-900 dark:text-white focus:border-reflexo-rose/40"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-semibold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1">
                        <Palette className="h-3.5 w-3.5 text-reflexo-rose/60" />{" "}
                        Customização de Tema
                      </label>
                      <select
                        value={theme}
                        onChange={(e) => handleThemeChange(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white/80 dark:bg-stone-800/40 px-4 py-2.5 text-xs outline-none text-stone-900 dark:text-white cursor-pointer focus:border-reflexo-rose/40"
                      >
                        <option value="light">
                          Modo Claro (Papel de Carta)
                        </option>
                        <option value="dark">
                          Modo Escuro (Calmaria da Noite)
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="py-2">
                    <label className="flex items-start gap-3 text-xs text-stone-800 dark:text-stone-200 cursor-pointer font-light select-none leading-relaxed">
                      <input
                        type="checkbox"
                        checked={notifications}
                        onChange={(e) => setNotifications(e.target.checked)}
                        className="mt-0.5 accent-reflexo-rose rounded cursor-pointer"
                      />
                      <span className="flex items-center gap-1.5">
                        <Bell className="h-3.5 w-3.5 text-stone-400" /> Ativar
                        notificações no e-mail (alertas de cápsulas do tempo
                        liberadas e desabafos aprovados).
                      </span>
                    </label>
                  </div>

                  {message && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs font-medium text-reflexo-rose bg-reflexo-rose/5 w-max px-3 py-1 rounded-full border border-reflexo-rose/10"
                    >
                      {message}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-full bg-reflexo-rose text-white text-xs uppercase tracking-widest font-medium shadow-sm hover:opacity-95 transition disabled:opacity-50"
                  >
                    {saving
                      ? "Atualizando servidores..."
                      : "Salvar preferências"}
                  </button>
                </form>
              </div>

              {/* SEÇÕES DE FAVORITOS INTERNOS (LIVROS E MÚSICAS) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* BLOCO DE LEITURAS REFINADO */}
                <div className="bg-white/60 dark:bg-stone-900/50 backdrop-blur-md rounded-2xl border border-white/20 dark:border-stone-800/20 p-6 shadow-soft flex flex-col justify-between">
                  <div>
                    <h3 className="font-sans text-xs uppercase tracking-[0.2em] text-stone-700 dark:text-stone-300 font-semibold mb-4 flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-reflexo-rose/70" />{" "}
                      Livros de Cabeceira
                    </h3>
                    <form onSubmit={addBook} className="flex gap-2 mb-4">
                      <input
                        type="text"
                        placeholder="Título da obra ou autor..."
                        value={newBook}
                        onChange={(e) => setNewBook(e.target.value)}
                        className="flex-1 rounded-xl border border-stone-300 dark:border-stone-700 bg-white/80 dark:bg-stone-800/40 px-3 py-2 text-xs outline-none text-stone-900 dark:text-white placeholder:opacity-40"
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
                            className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-white/90 dark:bg-stone-800/80 border border-stone-200/60 text-stone-800 dark:text-stone-200 shadow-sm font-light"
                          >
                            <span className="opacity-70">📖</span>{" "}
                            <span className="truncate max-w-[120px]">{b}</span>
                            <button
                              type="button"
                              onClick={() => removeBook(i)}
                              aria-label="Desvincular livro"
                            >
                              <X className="h-3 w-3 text-stone-400 hover:text-reflexo-rose" />
                            </button>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                      {books.length === 0 && (
                        <p className="text-[11px] text-stone-500 font-light italic">
                          Nenhuma obra adicionada à cabeceira.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* BLOCO DE TRILHA SONORA REFINADO + SPOTIFY */}
                <div className="bg-white/60 dark:bg-stone-900/50 backdrop-blur-md rounded-2xl border border-white/20 dark:border-stone-800/20 p-6 shadow-soft flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-sans text-xs uppercase tracking-[0.2em] text-stone-700 dark:text-stone-300 font-semibold mb-4 flex items-center gap-1.5">
                      <Music2 className="h-4 w-4 text-reflexo-rose/70" />{" "}
                      Músicas de Alento
                    </h3>
                    <form onSubmit={addSong} className="flex gap-2 mb-4">
                      <input
                        type="text"
                        placeholder="Música - Banda..."
                        value={newSong}
                        onChange={(e) => setNewSong(e.target.value)}
                        className="flex-1 rounded-xl border border-stone-300 dark:border-stone-700 bg-white/80 dark:bg-stone-800/40 px-3 py-2 text-xs outline-none text-stone-900 dark:text-white placeholder:opacity-40"
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
                            className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-white/90 dark:bg-stone-800/80 border border-stone-200/60 text-stone-800 dark:text-stone-200 shadow-sm font-light"
                          >
                            <span className="opacity-70">🎵</span>{" "}
                            <span className="truncate max-w-[120px]">{m}</span>
                            <button
                              type="button"
                              onClick={() => removeSong(i)}
                              aria-label="Desvincular canção"
                            >
                              <X className="h-3 w-3 text-stone-400 hover:text-reflexo-rose" />
                            </button>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                      {music.length === 0 && (
                        <p className="text-[11px] text-stone-500 font-light italic">
                          Nenhuma melodia anexada.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* PAINEL SPOTIFY INTEGRADO */}
                  <div className="flex items-center justify-between rounded-xl border border-stone-300 dark:border-stone-700 p-3 bg-white/40 dark:bg-stone-900/20">
                    <div className="flex items-center gap-2 text-xs font-medium text-stone-900 dark:text-white">
                      <span className="text-sm select-none">🟢</span>
                      <span>
                        Spotify {spotifyConnected ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={toggleSpotify}
                      className={`text-[10px] uppercase tracking-widest font-semibold px-3 py-1.5 rounded-full transition-all duration-300 ${
                        spotifyConnected
                          ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/20"
                          : "bg-reflexo-rose text-white shadow-sm"
                      }`}
                    >
                      {spotifyConnected ? "Desconectar" : "Sincronizar"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
              <h3 className="flex items-center gap-2 font-sans text-sm font-semibold mb-4 text-stone-900 dark:text-white">
                <Sparkles className="h-4 w-4 text-reflexo-rose" /> Escolha sua
                ilustração de jornada
              </h3>
              <div className="max-h-[50vh] overflow-y-auto p-1">
                <AvatarPicker value={avatarSeed} onChange={selectAvatar} />
              </div>
              <button
                type="button"
                onClick={() => setShowAvatarPicker(false)}
                className="mt-4 w-full px-4 py-2.5 rounded-full border border-stone-300 dark:border-stone-700 text-xs font-medium uppercase tracking-widest text-stone-700 dark:text-stone-300 transition"
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
