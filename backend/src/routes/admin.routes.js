const express = require("express");
const { body, validationResult } = require("express-validator");
const { supabaseAdmin } = require("../config/supabase");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth, requireAdmin);

/**
 * Registra uma ação administrativa para auditoria.
 */
async function logAdminAction(adminId, action, details) {
  await supabaseAdmin.from("admin_logs").insert({
    admin_id: adminId,
    action,
    details,
  });
}

/**
 * GET /api/admin/users
 * Lista usuários com busca opcional por nickname ou e-mail.
 */
router.get("/users", async (req, res) => {
  const { search } = req.query;

  try {
    let query = supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (search) query = query.ilike("nickname", `%${search}%`);

    const { data, error } = await query;

    if (error) return res.status(400).json({ error: error.message });

    // Enriquece com o e-mail (armazenado em auth.users, não em profiles)
    const enriched = await Promise.all(
      (data || []).map(async (profile) => {
        try {
          const { data: authData } = await supabaseAdmin.auth.admin.getUserById(
            profile.id,
          );
          return { ...profile, email: authData?.user?.email || null };
        } catch {
          return { ...profile, email: null };
        }
      }),
    );

    const filtered = search
      ? enriched.filter(
          (u) =>
            u.nickname?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase()),
        )
      : enriched;

    return res.json({ users: filtered });
  } catch (err) {
    console.error("Erro ao listar usuários:", err);
    return res.status(500).json({ error: "Erro interno ao listar usuários." });
  }
});

/**
 * PATCH /api/admin/users/:id/status
 * Suspende ou bane um usuário (status: active | suspended | banned).
 */
router.patch(
  "/users/:id/status",
  [
    body("status")
      .isIn(["active", "suspended", "banned"])
      .withMessage("Status inválido."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { status } = req.body;

    try {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      await logAdminAction(req.user.id, "update_user_status", {
        userId: id,
        status,
      });

      return res.json({ user: data });
    } catch (err) {
      console.error("Erro ao atualizar status do usuário:", err);
      return res
        .status(500)
        .json({ error: "Erro interno ao atualizar usuário." });
    }
  },
);

/**
 * GET /api/admin/moderation/queue
 * Lista posts e comentários pendentes de moderação.
 */
router.get("/moderation/queue", async (req, res) => {
  try {
    const [
      { data: posts, error: postsError },
      { data: comments, error: commentsError },
    ] = await Promise.all([
      supabaseAdmin
        .from("forum_posts")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("forum_comments")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
    ]);

    if (postsError) return res.status(400).json({ error: postsError.message });
    if (commentsError)
      return res.status(400).json({ error: commentsError.message });

    return res.json({ posts, comments });
  } catch (err) {
    console.error("Erro ao buscar fila de moderação:", err);
    return res
      .status(500)
      .json({ error: "Erro interno ao buscar fila de moderação." });
  }
});

/**
 * PATCH /api/admin/moderation/posts/:id
 * Aprova ou remove um post.
 */
router.patch(
  "/moderation/posts/:id",
  [
    body("status")
      .isIn(["approved", "removed"])
      .withMessage("Status inválido."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { status } = req.body;

    try {
      const { data, error } = await supabaseAdmin
        .from("forum_posts")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      await logAdminAction(req.user.id, "moderate_post", {
        postId: id,
        status,
      });

      return res.json({ post: data });
    } catch (err) {
      console.error("Erro ao moderar post:", err);
      return res.status(500).json({ error: "Erro interno ao moderar post." });
    }
  },
);

/**
 * PATCH /api/admin/moderation/comments/:id
 * Aprova ou remove um comentário.
 */
router.patch(
  "/moderation/comments/:id",
  [
    body("status")
      .isIn(["approved", "removed"])
      .withMessage("Status inválido."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { status } = req.body;

    try {
      const { data, error } = await supabaseAdmin
        .from("forum_comments")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      await logAdminAction(req.user.id, "moderate_comment", {
        commentId: id,
        status,
      });

      return res.json({ comment: data });
    } catch (err) {
      console.error("Erro ao moderar comentário:", err);
      return res
        .status(500)
        .json({ error: "Erro interno ao moderar comentário." });
    }
  },
);

/**
 * GET /api/admin/reports
 * Lista denúncias abertas.
 */
router.get("/reports", async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ reports: data });
  } catch (err) {
    console.error("Erro ao listar denúncias:", err);
    return res.status(500).json({ error: "Erro interno ao listar denúncias." });
  }
});

/**
 * PATCH /api/admin/reports/:id
 * Atualiza o status de uma denúncia (open | reviewed | dismissed).
 */
router.patch(
  "/reports/:id",
  [
    body("status")
      .isIn(["open", "reviewed", "dismissed"])
      .withMessage("Status inválido."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { status } = req.body;

    try {
      const { data, error } = await supabaseAdmin
        .from("reports")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      await logAdminAction(req.user.id, "update_report", {
        reportId: id,
        status,
      });

      return res.json({ report: data });
    } catch (err) {
      console.error("Erro ao atualizar denúncia:", err);
      return res
        .status(500)
        .json({ error: "Erro interno ao atualizar denúncia." });
    }
  },
);

/**
 * GET /api/admin/metrics
 * Retorna métricas gerais da plataforma.
 */
router.get("/metrics", async (req, res) => {
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
      supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true }),
      supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),
      supabaseAdmin
        .from("diary_entries")
        .select("*", { count: "exact", head: true }),
      supabaseAdmin
        .from("forum_posts")
        .select("*", { count: "exact", head: true }),
      supabaseAdmin
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "open"),
      supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString()),
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
    console.error("Erro ao buscar métricas:", err);
    return res.status(500).json({ error: "Erro interno ao buscar métricas." });
  }
});

/**
 * GET /api/admin/growth
 * Retorna o número de novos cadastros por dia nos últimos 14 dias,
 * para o gráfico de crescimento da plataforma.
 */
router.get("/growth", async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 13);
    since.setHours(0, 0, 0, 0);

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("created_at")
      .gte("created_at", since.toISOString());

    if (error) return res.status(400).json({ error: error.message });

    const days = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      days.push({ date: d.toISOString().slice(0, 10), count: 0 });
    }

    (data || []).forEach((row) => {
      const day = row.created_at.slice(0, 10);
      const entry = days.find((d) => d.date === day);
      if (entry) entry.count += 1;
    });

    return res.json({ growth: days });
  } catch (err) {
    console.error("Erro ao buscar crescimento:", err);
    return res
      .status(500)
      .json({ error: "Erro interno ao buscar crescimento." });
  }
});

/**
 * GET /api/admin/posts
 * Lista todos os posts do fórum (qualquer status), para revisão geral.
 */
router.get("/posts", async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("forum_posts")
      .select(
        "id, title, content, status, nickname, comment_count, created_at, category_id, forum_categories(name)",
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ posts: data || [] });
  } catch (err) {
    console.error("Erro ao buscar posts:", err);
    return res.status(500).json({ error: "Erro interno ao buscar posts." });
  }
});

/**
 * GET /api/admin/logs
 * Retorna o histórico de ações administrativas (auditoria).
 */
router.get("/logs", async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ logs: data || [] });
  } catch (err) {
    console.error("Erro ao buscar logs administrativos:", err);
    return res.status(500).json({ error: "Erro interno ao buscar logs." });
  }
});

/**
 * POST /api/admin/categories
 * Cria uma nova categoria do fórum.
 */
router.post(
  "/categories",
  [
    body("name")
      .trim()
      .isLength({ min: 2, max: 60 })
      .withMessage("Nome da categoria inválido."),
    body("description").optional().trim().isLength({ max: 300 }),
    body("color").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { name, description, color } = req.body;

    try {
      const { data, error } = await supabaseAdmin
        .from("forum_categories")
        .insert({ name, description, color })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      await logAdminAction(req.user.id, "create_category", { name });

      return res.status(201).json({ category: data });
    } catch (err) {
      console.error("Erro ao criar categoria:", err);
      return res
        .status(500)
        .json({ error: "Erro interno ao criar categoria." });
    }
  },
);

/**
 * POST /api/admin/notifications
 * Envia uma notificação global para todos os usuários.
 */
router.post(
  "/notifications",
  [
    body("title")
      .trim()
      .isLength({ min: 1, max: 150 })
      .withMessage("Título obrigatório."),
    body("message")
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage("Mensagem obrigatória."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { title, message } = req.body;

    try {
      const { data, error } = await supabaseAdmin
        .from("notifications")
        .insert({ title, message, is_global: true })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      await logAdminAction(req.user.id, "send_global_notification", { title });

      return res.status(201).json({ notification: data });
    } catch (err) {
      console.error("Erro ao enviar notificação:", err);
      return res
        .status(500)
        .json({ error: "Erro interno ao enviar notificação." });
    }
  },
);

module.exports = router;
