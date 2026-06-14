const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin } = require('../config/supabase');

const router = express.Router();

/**
 * POST /api/auth/register
 * Cria um novo usuário no Supabase Auth e a respectiva linha em "profiles".
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('E-mail inválido.'),
    body('password').isLength({ min: 8 }).withMessage('A senha deve ter ao menos 8 caracteres.'),
    body('nickname').trim().isLength({ min: 3, max: 30 }).withMessage('O nickname deve ter entre 3 e 30 caracteres.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, nickname } = req.body;

    try {
      // Verifica se o nickname já está em uso
      const { data: existing } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('nickname', nickname)
        .maybeSingle();

      if (existing) {
        return res.status(409).json({ error: 'Esse nickname já está em uso.' });
      }

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Marca o e-mail como confirmado para evitar a necessidade de confirmação por parte do usuário
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      const userId = data.user.id;

      const { error: profileError } = await supabaseAdmin.from('profiles').insert({
        id: userId,
        nickname,
        role: 'user',
      });

      if (profileError) {
        return res.status(400).json({ error: profileError.message });
      }

      return res.status(201).json({
        message: 'Conta criada com sucesso! Verifique seu e-mail para confirmar o cadastro.',
        userId,
      });
    } catch (err) {
      console.error('Erro no registro:', err);
      return res.status(500).json({ error: 'Erro interno ao criar conta.' });
    }
  }
);

/**
 * POST /api/auth/login
 * Autentica o usuário via Supabase e retorna o token de sessão.
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('E-mail inválido.'),
    body('password').notEmpty().withMessage('Senha obrigatória.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
      }

      return res.json({
        session: data.session,
        user: data.user,
      });
    } catch (err) {
      console.error('Erro no login:', err);
      return res.status(500).json({ error: 'Erro interno ao realizar login.' });
    }
  }
);

/**
 * POST /api/auth/recover
 * Envia e-mail de recuperação de senha.
 */
router.post(
  '/recover',
  [body('email').isEmail().withMessage('E-mail inválido.')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { error } = await supabaseAdmin.auth.resetPasswordForEmail(req.body.email, {
        redirectTo: `${process.env.FRONTEND_URL}/redefinir-senha`,
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json({ message: 'Se o e-mail existir em nossa base, um link de recuperação foi enviado.' });
    } catch (err) {
      console.error('Erro na recuperação de senha:', err);
      return res.status(500).json({ error: 'Erro interno ao processar solicitação.' });
    }
  }
);

module.exports = router;
