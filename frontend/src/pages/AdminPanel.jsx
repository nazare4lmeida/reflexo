import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  ShieldAlert,
  Flag,
  BarChart3,
  FolderPlus,
  Megaphone,
  Search,
  Check,
  X,
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import api from '../services/api';

const TABS = [
  { id: 'metrics', label: 'Métricas', icon: BarChart3 },
  { id: 'users', label: 'Usuários', icon: Users },
  { id: 'moderation', label: 'Moderação', icon: ShieldAlert },
  { id: 'reports', label: 'Denúncias', icon: Flag },
  { id: 'categories', label: 'Categorias', icon: FolderPlus },
  { id: 'notifications', label: 'Comunicados', icon: Megaphone },
];

export default function AdminPanel() {
  const [tab, setTab] = useState('metrics');
  const [accessDenied, setAccessDenied] = useState(false);

  const [metrics, setMetrics] = useState(null);

  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);

  const [queue, setQueue] = useState({ posts: [], comments: [] });

  const [reports, setReports] = useState([]);

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSent, setNotifSent] = useState(false);

  function handleError(err) {
    if (err.response?.status === 403) {
      setAccessDenied(true);
    } else {
      console.error(err);
    }
  }

  async function loadMetrics() {
    try {
      const res = await api.get('/admin/metrics');
      setMetrics(res.data.metrics);
    } catch (err) {
      handleError(err);
    }
  }

  async function loadUsers(query = '') {
    try {
      const res = await api.get('/admin/users', { params: { search: query } });
      setUsers(res.data.users);
    } catch (err) {
      handleError(err);
    }
  }

  async function loadQueue() {
    try {
      const res = await api.get('/admin/moderation/queue');
      setQueue({ posts: res.data.posts || [], comments: res.data.comments || [] });
    } catch (err) {
      handleError(err);
    }
  }

  async function loadReports() {
    try {
      const res = await api.get('/admin/reports');
      setReports(res.data.reports);
    } catch (err) {
      handleError(err);
    }
  }

  async function loadCategories() {
    try {
      const res = await api.get('/forum/categories');
      setCategories(res.data.categories);
    } catch (err) {
      handleError(err);
    }
  }

  useEffect(() => {
    loadMetrics();
    loadUsers();
    loadQueue();
    loadReports();
    loadCategories();
  }, []);

  async function changeUserStatus(userId, status) {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status });
      loadUsers(search);
    } catch (err) {
      handleError(err);
    }
  }

  async function moderatePost(postId, status) {
    try {
      await api.patch(`/admin/moderation/posts/${postId}`, { status });
      loadQueue();
    } catch (err) {
      handleError(err);
    }
  }

  async function moderateComment(commentId, status) {
    try {
      await api.patch(`/admin/moderation/comments/${commentId}`, { status });
      loadQueue();
    } catch (err) {
      handleError(err);
    }
  }

  async function resolveReport(reportId, status) {
    try {
      await api.patch(`/admin/reports/${reportId}`, { status });
      loadReports();
    } catch (err) {
      handleError(err);
    }
  }

  async function createCategory(e) {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      await api.post('/admin/categories', { name: newCategory });
      setNewCategory('');
      loadCategories();
    } catch (err) {
      handleError(err);
    }
  }

  async function sendNotification(e) {
    e.preventDefault();
    if (!notifMessage.trim()) return;
    try {
      await api.post('/admin/notifications', { title: notifTitle, message: notifMessage });
      setNotifSent(true);
      setNotifTitle('');
      setNotifMessage('');
      setTimeout(() => setNotifSent(false), 2500);
    } catch (err) {
      handleError(err);
    }
  }

  if (accessDenied) {
    return (
      <PageTransition>
        <div className="text-center py-20">
          <ShieldAlert className="h-10 w-10 text-reflexo-rose mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Acesso restrito</h1>
          <p className="text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70">
            Esta área é exclusiva para administradores da plataforma.
          </p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <h1 className="text-2xl font-semibold mb-1">Painel administrativo</h1>
      <p className="text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 mb-6">
        Gerencie usuários, modere o fórum e acompanhe a saúde da comunidade.
      </p>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                tab === t.id
                  ? 'bg-reflexo-rose text-white border-reflexo-rose'
                  : 'bg-white/60 dark:bg-white/10 border-reflexo-beigeRose text-reflexo-brown dark:text-reflexo-beigeLight hover:border-reflexo-rose'
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Métricas */}
      {tab === 'metrics' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics &&
            [
              ['Usuários totais', metrics.totalUsers],
              ['Usuários ativos', metrics.activeUsers],
              ['Entradas no diário', metrics.diaryEntries],
              ['Posts no fórum', metrics.forumPosts],
              ['Denúncias abertas', metrics.openReports],
              ['Novos esta semana', metrics.newUsersThisWeek],
            ].map(([label, value]) => (
              <div key={label} className="bg-white/70 dark:bg-white/10 rounded-xl2 shadow-soft p-4 text-center">
                <p className="text-2xl font-semibold text-reflexo-rose">{value ?? 0}</p>
                <p className="text-xs text-reflexo-brown/60 dark:text-reflexo-beigeLight/60 mt-1">{label}</p>
              </div>
            ))}
          {!metrics && <p className="text-sm col-span-full">Carregando métricas...</p>}
        </motion.div>
      )}

      {/* Usuários */}
      {tab === 'users' && (
        <div className="bg-white/70 dark:bg-white/10 rounded-xl2 shadow-soft p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadUsers(search);
            }}
            className="flex gap-2 mb-4"
          >
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-reflexo-brown/40" />
              <input
                type="text"
                placeholder="Buscar por nickname ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-reflexo-beigeRose/40 bg-white/60 dark:bg-white/10 pl-9 pr-4 py-2 outline-none"
              />
            </div>
            <button type="submit" className="px-4 py-2 rounded-full bg-reflexo-rose text-white text-sm hover:opacity-90">
              Buscar
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-reflexo-brown/60 dark:text-reflexo-beigeLight/60 border-b border-reflexo-beigeRose/30">
                  <th className="py-2 pr-4">Nickname</th>
                  <th className="py-2 pr-4">E-mail</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-reflexo-beigeRose/10">
                    <td className="py-2 pr-4">{u.nickname}</td>
                    <td className="py-2 pr-4">{u.email}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          u.status === 'banned'
                            ? 'bg-red-100 text-red-600'
                            : u.status === 'suspended'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td className="py-2 pr-4 space-x-2">
                      <button
                        onClick={() => changeUserStatus(u.id, 'active')}
                        className="text-xs px-2 py-1 rounded-full border border-reflexo-beigeRose hover:border-reflexo-rose"
                      >
                        Ativar
                      </button>
                      <button
                        onClick={() => changeUserStatus(u.id, 'suspended')}
                        className="text-xs px-2 py-1 rounded-full border border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                      >
                        Suspender
                      </button>
                      <button
                        onClick={() => changeUserStatus(u.id, 'banned')}
                        className="text-xs px-2 py-1 rounded-full border border-red-300 text-red-500 hover:bg-red-50"
                      >
                        Banir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="text-sm text-reflexo-brown/60 dark:text-reflexo-beigeLight/60 text-center py-6">
                Nenhum usuário encontrado.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Moderação */}
      {tab === 'moderation' && (
        <div className="space-y-6">
          <div className="bg-white/70 dark:bg-white/10 rounded-xl2 shadow-soft p-6">
            <h2 className="font-medium mb-3">Posts pendentes</h2>
            {queue.posts.length === 0 && (
              <p className="text-sm text-reflexo-brown/60 dark:text-reflexo-beigeLight/60">Nenhum post pendente.</p>
            )}
            <div className="space-y-3">
              {queue.posts.map((p) => (
                <div key={p.id} className="rounded-xl border border-reflexo-beigeRose/30 p-4">
                  <p className="text-sm font-medium mb-1">{p.title || 'Sem título'}</p>
                  <p className="text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 mb-3 whitespace-pre-wrap">
                    {p.content}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => moderatePost(p.id, 'approved')}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-green-100 text-green-700 hover:opacity-90"
                    >
                      <Check className="h-3.5 w-3.5" /> Aprovar
                    </button>
                    <button
                      onClick={() => moderatePost(p.id, 'removed')}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-red-100 text-red-600 hover:opacity-90"
                    >
                      <X className="h-3.5 w-3.5" /> Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/70 dark:bg-white/10 rounded-xl2 shadow-soft p-6">
            <h2 className="font-medium mb-3">Comentários pendentes</h2>
            {queue.comments.length === 0 && (
              <p className="text-sm text-reflexo-brown/60 dark:text-reflexo-beigeLight/60">Nenhum comentário pendente.</p>
            )}
            <div className="space-y-3">
              {queue.comments.map((c) => (
                <div key={c.id} className="rounded-xl border border-reflexo-beigeRose/30 p-4">
                  <p className="text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 mb-3 whitespace-pre-wrap">
                    {c.content}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => moderateComment(c.id, 'approved')}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-green-100 text-green-700 hover:opacity-90"
                    >
                      <Check className="h-3.5 w-3.5" /> Aprovar
                    </button>
                    <button
                      onClick={() => moderateComment(c.id, 'removed')}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-red-100 text-red-600 hover:opacity-90"
                    >
                      <X className="h-3.5 w-3.5" /> Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Denúncias */}
      {tab === 'reports' && (
        <div className="bg-white/70 dark:bg-white/10 rounded-xl2 shadow-soft p-6">
          <h2 className="font-medium mb-3">Histórico de denúncias</h2>
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="rounded-xl border border-reflexo-beigeRose/30 p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-reflexo-beigeRose/30">{r.target_type}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      r.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {r.status || 'pending'}
                  </span>
                </div>
                <p className="text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 mb-3">{r.reason}</p>
                {r.status !== 'resolved' && (
                  <button
                    onClick={() => resolveReport(r.id, 'resolved')}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-green-100 text-green-700 hover:opacity-90"
                  >
                    <Check className="h-3.5 w-3.5" /> Marcar como resolvida
                  </button>
                )}
              </div>
            ))}
            {reports.length === 0 && (
              <p className="text-sm text-reflexo-brown/60 dark:text-reflexo-beigeLight/60">Nenhuma denúncia registrada.</p>
            )}
          </div>
        </div>
      )}

      {/* Categorias */}
      {tab === 'categories' && (
        <div className="bg-white/70 dark:bg-white/10 rounded-xl2 shadow-soft p-6">
          <h2 className="font-medium mb-3">Categorias do fórum</h2>
          <form onSubmit={createCategory} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Nome da nova categoria"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 rounded-xl border border-reflexo-beigeRose/40 bg-white/60 dark:bg-white/10 px-4 py-2 outline-none"
            />
            <button type="submit" className="px-4 py-2 rounded-full bg-reflexo-rose text-white text-sm hover:opacity-90">
              Adicionar
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <span key={c.id} className="text-sm px-3 py-1.5 rounded-full border border-reflexo-beigeRose/40 bg-reflexo-beigeRose/10">
                {c.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notificações */}
      {tab === 'notifications' && (
        <div className="bg-white/70 dark:bg-white/10 rounded-xl2 shadow-soft p-6 max-w-xl">
          <h2 className="font-medium mb-3">Enviar comunicado global</h2>
          <form onSubmit={sendNotification} className="space-y-3">
            <input
              type="text"
              placeholder="Título (opcional)"
              value={notifTitle}
              onChange={(e) => setNotifTitle(e.target.value)}
              className="w-full rounded-xl border border-reflexo-beigeRose/40 bg-white/60 dark:bg-white/10 px-4 py-2 outline-none"
            />
            <textarea
              rows={4}
              placeholder="Mensagem para todos os usuários..."
              value={notifMessage}
              onChange={(e) => setNotifMessage(e.target.value)}
              className="w-full rounded-xl border border-reflexo-beigeRose/40 bg-white/60 dark:bg-white/10 px-4 py-2 outline-none resize-none"
            />
            <button type="submit" className="px-6 py-2.5 rounded-full bg-reflexo-rose text-white font-medium hover:opacity-90">
              Enviar
            </button>
            {notifSent && <p className="text-sm text-green-600">Comunicado enviado com sucesso.</p>}
          </form>
        </div>
      )}
    </PageTransition>
  );
}
