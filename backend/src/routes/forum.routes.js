const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');
const { analyzeContent, sanitizeText } = require('../middleware/moderation');

const router = express.Router();

/**
 * GET /api/forum/categories
 * Lista todas as categorias do fórum (público).
 */
router.get('/categories', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('forum_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ categories: data });
  } catch (err) {
    console.error('Erro ao listar categorias:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar categorias.' });
  }
});

/**
 * GET /api/forum/posts
 * Lista posts aprovados, opcionalmente filtrados por categoria.
 * Não retorna user_id real ao público - apenas nickname.
 */
router.get('/posts', async (req, res) => {
  const { category_id } = req.query;

  try {
    let query = supabaseAdmin
      .from('forum_posts')
      .select('id, title, content, category_id, nickname, created_at, status, comment_count')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (category_id) query = query.eq('category_id', category_id);

    const { data, error } = await query;

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ posts: data });
  } catch (err) {
    console.error('Erro ao listar posts:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar posts.' });
  }
});

/**
 * GET /api/forum/posts/:id
 * Retorna um post e seus comentários aprovados.
 */
router.get('/posts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data: post, error: postError } = await supabaseAdmin
      .from('forum_posts')
      .select('id, title, content, category_id, nickname, created_at, status')
      .eq('id', id)
      .single();

    if (postError || !post) return res.status(404).json({ error: 'Post não encontrado.' });

    const { data: comments, error: commentsError } = await supabaseAdmin
      .from('forum_comments')
      .select('id, content, nickname, created_at, status')
      .eq('post_id', id)
      .eq('status', 'approved')
      .order('created_at', { ascending: true });

    if (commentsError) return res.status(400).json({ error: commentsError.message });

    return res.json({ post, comments });
  } catch (err) {
    console.error('Erro ao buscar post:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar post.' });
  }
});

/**
 * POST /api/forum/posts
 * Cria um novo post anônimo. Usa o nickname do perfil do usuário autenticado,
 * mas não expõe o user_id para outros usuários.
 * Posts com conteúdo suspeito vão para fila de moderação ("pending").
 */
router.post(
  '/posts',
  requireAuth,
  [
    body('title').trim().isLength({ min: 3, max: 150 }).withMessage('O título deve ter entre 3 e 150 caracteres.'),
    body('content').trim().isLength({ min: 1, max: 5000 }).withMessage('O conteúdo é obrigatório.'),
    body('category_id').isUUID().withMessage('Categoria inválida.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, category_id } = req.body;

    try {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('nickname')
        .eq('id', req.user.id)
        .single();

      if (profileError || !profile) return res.status(400).json({ error: 'Perfil não encontrado.' });

      const analysis = analyzeContent(`${title} ${content}`);
      const status = analysis.flagged ? 'pending' : 'approved';

      const { data, error } = await supabaseAdmin
        .from('forum_posts')
        .insert({
          user_id: req.user.id,
          nickname: profile.nickname,
          category_id,
          title: sanitizeText(title),
          content: sanitizeText(content),
          status,
          flag_reasons: analysis.flagged ? analysis.reasons : null,
          comment_count: 0,
        })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      return res.status(201).json({
        post: data,
        message: analysis.flagged
          ? 'Seu post foi enviado para revisão da moderação antes de ser publicado.'
          : 'Post publicado com sucesso.',
      });
    } catch (err) {
      console.error('Erro ao criar post:', err);
      return res.status(500).json({ error: 'Erro interno ao criar post.' });
    }
  }
);

/**
 * POST /api/forum/posts/:id/comments
 * Adiciona um comentário anônimo a um post.
 */
router.post(
  '/posts/:id/comments',
  requireAuth,
  [body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('O comentário é obrigatório.')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id: post_id } = req.params;
    const { content } = req.body;

    try {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('nickname')
        .eq('id', req.user.id)
        .single();

      if (profileError || !profile) return res.status(400).json({ error: 'Perfil não encontrado.' });

      const analysis = analyzeContent(content);
      const status = analysis.flagged ? 'pending' : 'approved';

      const { data, error } = await supabaseAdmin
        .from('forum_comments')
        .insert({
          post_id,
          user_id: req.user.id,
          nickname: profile.nickname,
          content: sanitizeText(content),
          status,
          flag_reasons: analysis.flagged ? analysis.reasons : null,
        })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      if (status === 'approved') {
        await supabaseAdmin.rpc('increment_comment_count', { post_id_input: post_id }).catch(() => {});
      }

      return res.status(201).json({
        comment: data,
        message: analysis.flagged
          ? 'Seu comentário foi enviado para revisão da moderação antes de ser publicado.'
          : 'Comentário publicado com sucesso.',
      });
    } catch (err) {
      console.error('Erro ao comentar:', err);
      return res.status(500).json({ error: 'Erro interno ao comentar.' });
    }
  }
);

/**
 * POST /api/forum/reports
 * Cria uma denúncia sobre um post ou comentário.
 */
router.post(
  '/reports',
  requireAuth,
  [
    body('target_type').isIn(['post', 'comment']).withMessage('Tipo de denúncia inválido.'),
    body('target_id').isUUID().withMessage('ID inválido.'),
    body('reason').trim().isLength({ min: 1, max: 500 }).withMessage('Informe o motivo da denúncia.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { target_type, target_id, reason } = req.body;

    try {
      const { data, error } = await supabaseAdmin
        .from('reports')
        .insert({
          reporter_id: req.user.id,
          target_type,
          target_id,
          reason: sanitizeText(reason),
          status: 'open',
        })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      return res.status(201).json({ report: data, message: 'Denúncia recebida. Nossa equipe irá analisar.' });
    } catch (err) {
      console.error('Erro ao registrar denúncia:', err);
      return res.status(500).json({ error: 'Erro interno ao registrar denúncia.' });
    }
  }
);

module.exports = router;
