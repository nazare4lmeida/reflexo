const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

/**
 * GET /api/profile/me
 * Retorna o perfil do usuário autenticado, junto com estatísticas pessoais.
 */
router.get('/me', async (req, res) => {
  try {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (profileError || !profile) return res.status(404).json({ error: 'Perfil não encontrado.' });

    const [{ count: diaryCount }, { count: memoriesCount }, { data: moodData }] = await Promise.all([
      supabaseAdmin
        .from('diary_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', req.user.id),
      supabaseAdmin
        .from('memories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', req.user.id),
      supabaseAdmin
        .from('mood_logs')
        .select('intensity, created_at')
        .eq('user_id', req.user.id)
        .gte('created_at', new Date(new Date().setDate(1)).toISOString()),
    ]);

    const avgMood = moodData?.length
      ? (moodData.reduce((sum, m) => sum + (m.intensity || 0), 0) / moodData.length).toFixed(1)
      : null;

    return res.json({
      profile,
      stats: {
        diaryEntries: diaryCount || 0,
        memories: memoriesCount || 0,
        averageMoodThisMonth: avgMood,
      },
    });
  } catch (err) {
    console.error('Erro ao buscar perfil:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar perfil.' });
  }
});

/**
 * PUT /api/profile/me
 * Atualiza preferências e dados públicos do perfil (nickname, avatar, notificações).
 */
router.put(
  '/me',
  [
    body('nickname').optional().trim().isLength({ min: 3, max: 30 }),
    body('avatar_seed').optional().isString(),
    body('notifications_enabled').optional().isBoolean(),
    body('theme').optional().isIn(['light', 'dark']),
    body('favorite_books').optional().isArray(),
    body('favorite_music').optional().isArray(),
    body('spotify_connected').optional().isBoolean(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      nickname,
      avatar_seed,
      notifications_enabled,
      theme,
      favorite_books,
      favorite_music,
      spotify_connected,
    } = req.body;

    try {
      if (nickname) {
        const { data: existing } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('nickname', nickname)
          .neq('id', req.user.id)
          .maybeSingle();

        if (existing) return res.status(409).json({ error: 'Esse nickname já está em uso.' });
      }

      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({
          nickname,
          avatar_seed,
          notifications_enabled,
          theme,
          favorite_books,
          favorite_music,
          spotify_connected,
          updated_at: new Date().toISOString(),
        })
        .eq('id', req.user.id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      return res.json({ profile: data });
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      return res.status(500).json({ error: 'Erro interno ao atualizar perfil.' });
    }
  }
);

/**
 * GET /api/profile/export
 * Exporta todos os dados do usuário (conformidade LGPD) em formato JSON.
 */
router.get('/export', async (req, res) => {
  try {
    const tables = ['diary_entries', 'memories', 'future_letters', 'mood_logs'];
    const result = {};

    for (const table of tables) {
      const { data, error } = await supabaseAdmin.from(table).select('*').eq('user_id', req.user.id);
      if (error) return res.status(400).json({ error: error.message });
      result[table] = data;
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    result.profile = profile;

    res.setHeader('Content-Disposition', 'attachment; filename="reflexo-dados.json"');
    return res.json(result);
  } catch (err) {
    console.error('Erro ao exportar dados:', err);
    return res.status(500).json({ error: 'Erro interno ao exportar dados.' });
  }
});

/**
 * DELETE /api/profile/me
 * Exclui permanentemente a conta do usuário e todos os seus dados.
 */
router.delete('/me', async (req, res) => {
  try {
    const tables = ['diary_entries', 'memories', 'future_letters', 'mood_logs', 'forum_posts', 'forum_comments'];

    for (const table of tables) {
      await supabaseAdmin.from(table).delete().eq('user_id', req.user.id);
    }

    await supabaseAdmin.from('profiles').delete().eq('id', req.user.id);

    const { error } = await supabaseAdmin.auth.admin.deleteUser(req.user.id);
    if (error) return res.status(400).json({ error: error.message });

    return res.json({ message: 'Conta excluída permanentemente.' });
  } catch (err) {
    console.error('Erro ao excluir conta:', err);
    return res.status(500).json({ error: 'Erro interno ao excluir conta.' });
  }
});

module.exports = router;
