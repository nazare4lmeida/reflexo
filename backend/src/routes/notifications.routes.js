const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

/**
 * GET /api/notifications
 * Lista notificações globais e cartas para o futuro disponíveis para o usuário.
 */
router.get('/', async (req, res) => {
  try {
    const { data: globalNotifications, error: notifError } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('is_global', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (notifError) return res.status(400).json({ error: notifError.message });

    const { data: letters, error: lettersError } = await supabaseAdmin
      .from('future_letters')
      .select('id, title, deliver_at, is_opened')
      .eq('user_id', req.user.id)
      .eq('is_opened', false)
      .lte('deliver_at', new Date().toISOString());

    if (lettersError) return res.status(400).json({ error: lettersError.message });

    return res.json({
      notifications: globalNotifications,
      availableLetters: letters,
    });
  } catch (err) {
    console.error('Erro ao buscar notificações:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar notificações.' });
  }
});

module.exports = router;
