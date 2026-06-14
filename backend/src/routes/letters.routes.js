const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');
const { sanitizeText } = require('../middleware/moderation');

const router = express.Router();
router.use(requireAuth);

/**
 * POST /api/letters
 * Cria uma carta para o futuro, calculando a data de abertura a partir do prazo informado.
 */
router.post(
  '/',
  [
    body('content').trim().isLength({ min: 1, max: 10000 }).withMessage('A carta não pode estar vazia.'),
    body('title').optional().trim().isLength({ max: 150 }),
    body('deliver_at').isISO8601().withMessage('Data de abertura inválida.'),
    body('notify_email').optional().isBoolean(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, deliver_at, notify_email = false } = req.body;

    try {
      const { data, error } = await supabaseAdmin
        .from('future_letters')
        .insert({
          user_id: req.user.id,
          title: title ? sanitizeText(title) : 'Carta para o futuro',
          content: sanitizeText(content),
          deliver_at,
          notify_email,
          is_opened: false,
        })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      return res.status(201).json({ letter: data });
    } catch (err) {
      console.error('Erro ao criar carta:', err);
      return res.status(500).json({ error: 'Erro interno ao salvar carta.' });
    }
  }
);

/**
 * GET /api/letters
 * Lista as cartas do usuário, indicando quais já podem ser abertas.
 */
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('future_letters')
      .select('*')
      .eq('user_id', req.user.id)
      .order('deliver_at', { ascending: true });

    if (error) return res.status(400).json({ error: error.message });

    const now = new Date();
    const letters = data.map((letter) => ({
      ...letter,
      is_available: new Date(letter.deliver_at) <= now,
    }));

    return res.json({ letters });
  } catch (err) {
    console.error('Erro ao listar cartas:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar cartas.' });
  }
});

/**
 * PATCH /api/letters/:id/open
 * Marca uma carta como aberta, apenas se a data de entrega já passou.
 */
router.patch('/:id/open', async (req, res) => {
  const { id } = req.params;

  try {
    const { data: letter, error: fetchError } = await supabaseAdmin
      .from('future_letters')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !letter) return res.status(404).json({ error: 'Carta não encontrada.' });

    if (new Date(letter.deliver_at) > new Date()) {
      return res.status(403).json({ error: 'Essa carta ainda não pode ser aberta.' });
    }

    const { data, error } = await supabaseAdmin
      .from('future_letters')
      .update({ is_opened: true, opened_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ letter: data });
  } catch (err) {
    console.error('Erro ao abrir carta:', err);
    return res.status(500).json({ error: 'Erro interno ao abrir carta.' });
  }
});

module.exports = router;
