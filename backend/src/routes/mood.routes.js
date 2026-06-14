const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

/**
 * GET /api/mood
 * Retorna os registros de humor do usuário, opcionalmente filtrados por período.
 * Também calcula insights simples para o Mapa Emocional.
 */
router.get('/', async (req, res) => {
  const { days = 30 } = req.query;

  try {
    const since = new Date();
    since.setDate(since.getDate() - Number(days));

    const { data, error } = await supabaseAdmin
      .from('mood_logs')
      .select('*')
      .eq('user_id', req.user.id)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true });

    if (error) return res.status(400).json({ error: error.message });

    // Calcula frequência de emoções
    const emotionCount = {};
    let totalIntensity = 0;

    data.forEach((log) => {
      totalIntensity += log.intensity || 0;
      (log.emotion_tags || []).forEach((tag) => {
        emotionCount[tag] = (emotionCount[tag] || 0) + 1;
      });
    });

    const avgIntensity = data.length ? (totalIntensity / data.length).toFixed(1) : null;

    // Insights simples e amigáveis
    const insights = [];

    const sortedEmotions = Object.entries(emotionCount).sort((a, b) => b[1] - a[1]);
    if (sortedEmotions.length > 0) {
      insights.push(`A emoção mais frequente no período foi "${sortedEmotions[0][0]}".`);
    }
    if (avgIntensity) {
      insights.push(`Sua intensidade emocional média foi ${avgIntensity} em uma escala de 1 a 10.`);
    }
    if (data.length === 0) {
      insights.push('Ainda não há registros suficientes neste período. Que tal escrever no seu diário hoje?');
    }

    return res.json({
      logs: data,
      emotionFrequency: emotionCount,
      averageIntensity: avgIntensity,
      insights,
    });
  } catch (err) {
    console.error('Erro ao buscar mapa emocional:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar dados emocionais.' });
  }
});

module.exports = router;
