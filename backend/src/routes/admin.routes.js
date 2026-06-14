const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin } = require('../config/supabase');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireAdmin);

/**
 * Registra uma ação administrativa para auditoria.
 */
async function logAdminAction(adminId, action, details) {
  await supabaseAdmin.from('admin_logs').insert({
    admin_id: adminId,
    action,
    details,
  });
}

/**
 * GET /api/admin/users
 * Lista usuários com busca opcional por nickname.
 */
router.get('/users', async (req, res) => {
  const { search } = req.query;

  try {
    let query = supabaseAdmin.from('profiles').select('*').order('created_at', { ascending: false });

    if (search) query = query.ilike('nickname', `%${search}%`);

    const { data, error } = await query;

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ users: data });
  } catch (err) {
    console.error('Erro ao listar usuários:', err);
    return res.status(500).json({ error: 'Erro interno ao listar usuários.' });
  }
});

/**
 * PATCH /api/admin/users/:id/status
 * Suspende ou bane um usuário (status: active | suspended | banned).
 */
router.patch(
  '/users/:id/status',
  [body('status').isIn(['active', 'suspended', 'banned']).withMessage('Status inválido.')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { status } = req.body;

    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      await logAdminAction(req.user.id, 'update_user_status', { userId: id, status });

      return res.json({ user: data });
    } catch (err) {
      console.error('Erro ao atualizar status do usuário:', err);
      return res.status(500).json({ error: 'Erro interno ao atualizar usuário.' });
    }
  }
);

/**
 * GET /api/admin/moderation/queue
 * Lista posts e comentários pendentes de moderação.
 */
router.get('/moderation/queue', async (req, res) => {
  try {
    const [{ data: posts, error: postsError }, { data: comments, error: commentsError }] = await Promise.all([
      supabaseAdmin.from('forum_posts').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
      supabaseAdmin.from('forum_comments').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
    ]);

    if (postsError) return res.status(400).json({ error: postsError.message });
    if (commentsError) return res.status(400).json({ error: commentsError.message });

    return res.json({ posts, comments });
  } catch (err) {
    console.error('Erro ao buscar fila de moderação:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar fila de moderação.' });
  }
});

/**
 * PATCH /api/admin/moderation/posts/:id
 * Aprova ou remove um post.
 */
router.patch(
  '/moderation/posts/:id',
  [body('status').isIn(['approved', 'removed']).withMessage('Status inválido.')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { status } = req.body;

    try {
      const { data, error } = await supabaseAdmin
        .from('forum_posts')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      await logAdminAction(req.user.id, 'moderate_post', { postId: id, status });

      return res.json({ post: data });
    } catch (err) {
      console.error('Erro ao moderar post:', err);
      return res.status(500).json({ error: 'Erro interno ao moderar post.' });
    }
  }
);

/**
 * PATCH /api/admin/moderation/comments/:id
 * Aprova ou remove um comentário.
 */
router.patch(
  '/moderation/comments/:id',
  [body('status').isIn(['approved', 'removed']).withMessage('Status inválido.')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { status } = req.body;

    try {
      const { data, error } = await supabaseAdmin
        .from('forum_comments')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      await logAdminAction(req.user.id, 'moderate_comment', { commentId: id, status });

      return res.json({ comment: data });
    } catch (err) {
      console.error('Erro ao moderar comentário:', err);
      return res.status(500).json({ error: 'Erro interno ao moderar comentário.' });
    }
  }
);

/**
 * GET /api/admin/reports
 * Lista denúncias abertas.
 */
router.get('/reports', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ reports: data });
  } catch (err) {
    console.error('Erro ao listar denúncias:', err);
    return res.status(500).json({ error: 'Erro interno ao listar denúncias.' });
  }
});

/**
 * PATCH /api/admin/reports/:id
 * Atualiza o status de uma denúncia (open | reviewed | dismissed).
 */
router.patch(
  '/reports/:id',
  [body('status').isIn(['open', 'reviewed', 'dismissed']).withMessage('Status inválido.')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { status } = req.body;

    try {
      const { data, error } = await supabaseAdmin
        .from('reports')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      await logAdminAction(req.user.id, 'update_report', { reportId: id, status });

      return res.json({ report: data });
    } catch (err) {
      console.error('Erro ao atualizar denúncia:', err);
      return res.status(500).json({ error: 'Erro interno ao atualizar denúncia.' });
    }
  }
);

/**
 * GET /api/admin/metrics
 * Retorna métricas gerais da plataforma.
 */
router.get('/metrics', async (req, res) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      { count: totalUsers },
      { count: activeUsers },
      { count: diaryEntries },
      { count: forumPosts },
      { count: openReports },
      { count: newUsersThisWeek },
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('diary_entries').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('forum_posts').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString()),
    ]);

    return res.json({
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      diaryEntries: diaryEntries || 0,
      forumPosts: forumPosts || 0,
      openReports: openReports || 0,
      newUsersThisWeek: newUsersThisWeek || 0,
    });
  } catch (err) {
    console.error('Erro ao buscar métricas:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar métricas.' });
  }
});

/**
 * POST /api/admin/categories
 * Cria uma nova categoria do fórum.
 */
router.post(
  '/categories',
  [
    body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Nome da categoria inválido.'),
    body('description').optional().trim().isLength({ max: 300 }),
    body('color').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, description, color } = req.body;

    try {
      const { data, error } = await supabaseAdmin
        .from('forum_categories')
        .insert({ name, description, color })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      await logAdminAction(req.user.id, 'create_category', { name });

      return res.status(201).json({ category: data });
    } catch (err) {
      console.error('Erro ao criar categoria:', err);
      return res.status(500).json({ error: 'Erro interno ao criar categoria.' });
    }
  }
);

/**
 * POST /api/admin/notifications
 * Envia uma notificação global para todos os usuários.
 */
router.post(
  '/notifications',
  [
    body('title').trim().isLength({ min: 1, max: 150 }).withMessage('Título obrigatório.'),
    body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Mensagem obrigatória.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, message } = req.body;

    try {
      const { data, error } = await supabaseAdmin
        .from('notifications')
        .insert({ title, message, is_global: true })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      await logAdminAction(req.user.id, 'send_global_notification', { title });

      return res.status(201).json({ notification: data });
    } catch (err) {
      console.error('Erro ao enviar notificação:', err);
      return res.status(500).json({ error: 'Erro interno ao enviar notificação.' });
    }
  }
);

module.exports = router;
