const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');
const { sanitizeText } = require('../middleware/moderation');

const router = express.Router();
router.use(requireAuth);

/**
 * Gera uma sugestão acolhedora simples com base nas emoções/tags da entrada.
 * Não é diagnóstico, apenas um convite reflexivo.
 */
function generateReflectiveSuggestion(emotionTags = [], intensity = 5) {
  const suggestions = [
    'Parece que esse momento foi importante para você. O que mais chamou sua atenção no que aconteceu hoje?',
    'Às vezes, nomear o que sentimos já é um passo importante. Você gostaria de registrar o que mais pesou no seu dia?',
    'Você falaria consigo mesmo da mesma forma que falaria com um amigo querido?',
    'Obrigado por reservar um tempo para si. O que você gostaria de lembrar sobre este momento no futuro?',
    'Notar como você se sente é um ato de cuidado. Existe algo que te ajudaria a se sentir um pouco melhor agora?',
  ];

  if (emotionTags.includes('gratidao')) {
    return 'Que bonito registrar gratidão. O que esse sentimento te ensina sobre o que valoriza na vida?';
  }
  if (intensity >= 8) {
    return 'Parece que hoje foi um dia emocionalmente intenso. Tudo bem sentir assim - você gostaria de escrever mais sobre o que motivou essa intensidade?';
  }

  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

/**
 * GET /api/diary
 * Lista as entradas do diário do usuário autenticado, com filtros opcionais.
 */
router.get('/', async (req, res) => {
  const { q, emotion, from, to } = req.query;

  try {
    let query = supabaseAdmin
      .from('diary_entries')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (q) query = query.ilike('content', `%${q}%`);
    if (emotion) query = query.contains('emotion_tags', [emotion]);
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    const { data, error } = await query;

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ entries: data });
  } catch (err) {
    console.error('Erro ao listar diário:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar entradas.' });
  }
});

/**
 * POST /api/diary
 * Cria uma nova entrada de diário e retorna uma sugestão reflexiva.
 */
router.post(
  '/',
  [
    body('content').trim().isLength({ min: 1, max: 10000 }).withMessage('O conteúdo é obrigatório.'),
    body('title').optional().trim().isLength({ max: 150 }),
    body('emotion_tags').optional().isArray(),
    body('intensity').optional().isInt({ min: 1, max: 10 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, emotion_tags = [], intensity = 5, what_happened, what_to_remember } = req.body;

    try {
      const { data, error } = await supabaseAdmin
        .from('diary_entries')
        .insert({
          user_id: req.user.id,
          title: title ? sanitizeText(title) : null,
          content: sanitizeText(content),
          emotion_tags,
          intensity,
          what_happened: what_happened ? sanitizeText(what_happened) : null,
          what_to_remember: what_to_remember ? sanitizeText(what_to_remember) : null,
        })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      // Registra também no mood_logs para alimentar o mapa emocional
      await supabaseAdmin.from('mood_logs').insert({
        user_id: req.user.id,
        intensity,
        emotion_tags,
        source_entry_id: data.id,
      });

      const suggestion = generateReflectiveSuggestion(emotion_tags, intensity);

      return res.status(201).json({ entry: data, suggestion });
    } catch (err) {
      console.error('Erro ao criar entrada de diário:', err);
      return res.status(500).json({ error: 'Erro interno ao salvar entrada.' });
    }
  }
);

/**
 * PUT /api/diary/:id
 * Atualiza uma entrada existente, garantindo que pertence ao usuário.
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, emotion_tags, intensity, what_happened, what_to_remember } = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from('diary_entries')
      .update({
        title: title ? sanitizeText(title) : null,
        content: content ? sanitizeText(content) : undefined,
        emotion_tags,
        intensity,
        what_happened: what_happened ? sanitizeText(what_happened) : null,
        what_to_remember: what_to_remember ? sanitizeText(what_to_remember) : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ entry: data });
  } catch (err) {
    console.error('Erro ao atualizar entrada:', err);
    return res.status(500).json({ error: 'Erro interno ao atualizar entrada.' });
  }
});

/**
 * DELETE /api/diary/:id
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabaseAdmin
      .from('diary_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ message: 'Entrada removida com sucesso.' });
  } catch (err) {
    console.error('Erro ao remover entrada:', err);
    return res.status(500).json({ error: 'Erro interno ao remover entrada.' });
  }
});

module.exports = router;
