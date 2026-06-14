require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const diaryRoutes = require('./routes/diary.routes');
const moodRoutes = require('./routes/mood.routes');
const lettersRoutes = require('./routes/letters.routes');
const memoriesRoutes = require('./routes/memories.routes');
const forumRoutes = require('./routes/forum.routes');
const profileRoutes = require('./routes/profile.routes');
const adminRoutes = require('./routes/admin.routes');
const notificationsRoutes = require('./routes/notifications.routes');

const app = express();

// Segurança básica de headers HTTP
app.use(helmet());

// CORS restrito ao frontend configurado
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));

// Limita o número de requisições por IP para evitar abuso/spam
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
});
app.use('/api', limiter);

// Rate limit mais estrito para autenticação (evita brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de autenticação. Tente novamente mais tarde.' },
});
app.use('/api/auth', authLimiter);

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/letters', lettersRoutes);
app.use('/api/memories', memoriesRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationsRoutes);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Reflexo API está funcionando.' });
});

// Aviso importante sobre saúde mental, disponível via API caso o frontend queira exibir dinamicamente
app.get('/api/mental-health-notice', (req, res) => {
  res.json({
    notice:
      'Reflexo não substitui acompanhamento psicológico profissional. Em situações de crise emocional, procure ajuda especializada ou serviços de emergência da sua região.',
  });
});

// Tratamento de erros genérico
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Reflexo API rodando na porta ${PORT}`);
});
