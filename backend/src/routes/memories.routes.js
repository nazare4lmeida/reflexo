const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');
const { sanitizeText } = require('../middleware/moderation');

const router = express.Router();
router.use(requireAuth);

/**
 * GET /api/memories
 * Lista memórias do usuário, organizadas por data (mais recentes primeiro).
 */
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('memories')
      .select('*')
      .eq('user_id', req.user.id)
      .order('memory_date', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ memories: data });
  } catch (err) {
    console.error('Erro ao listar memórias:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar memórias.' });
  }
});

/**
 * POST /api/memories
 * Cria uma nova memória. A imagem deve ser previamente enviada ao Supabase Storage
 * pelo frontend, e a URL pública/privada é enviada aqui em "image_url".
 */
router.post(
  '/',
  [
    body('title').trim().isLength({ min: 1, max: 150 }).withMessage('O título é obrigatório.'),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('memory_date').isISO8601().withMessage('Data da memória inválida.'),
    body('image_url').optional().isString(),
    body('is_favorite').optional().isBoolean(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, memory_date, image_url, is_favorite = false } = req.body;

    try {
      const { data, error } = await supabaseAdmin
        .from('memories')
        .insert({
          user_id: req.user.id,
          title: sanitizeText(title),
          description: description ? sanitizeText(description) : null,
          memory_date,
          image_url: image_url || null,
          is_favorite,
        })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      return res.status(201).json({ memory: data });
    } catch (err) {
      console.error('Erro ao criar memória:', err);
      return res.status(500).json({ error: 'Erro interno ao salvar memória.' });
    }
  }
);

/**
 * PUT /api/memories/:id
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, memory_date, image_url, is_favorite } = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from('memories')
      .update({
        title: title ? sanitizeText(title) : undefined,
        description: description !== undefined ? sanitizeText(description) : undefined,
        memory_date,
        image_url,
        is_favorite,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ memory: data });
  } catch (err) {
    console.error('Erro ao atualizar memória:', err);
    return res.status(500).json({ error: 'Erro interno ao atualizar memória.' });
  }
});

/**
 * DELETE /api/memories/:id
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabaseAdmin
      .from('memories')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ message: 'Memória removida com sucesso.' });
  } catch (err) {
    console.error('Erro ao remover memória:', err);
    return res.status(500).json({ error: 'Erro interno ao remover memória.' });
  }
});

module.exports = router;
