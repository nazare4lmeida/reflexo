const { supabaseAdmin } = require('../config/supabase');

/**
 * Middleware que valida o token JWT do Supabase enviado no header Authorization.
 * Em caso de sucesso, anexa req.user com os dados do usuário autenticado.
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) {
      return res.status(401).json({ error: 'Token de autenticação não informado.' });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    }

    req.user = data.user;
    req.token = token;
    next();
  } catch (err) {
    console.error('Erro no middleware de autenticação:', err);
    return res.status(500).json({ error: 'Erro interno de autenticação.' });
  }
}

/**
 * Middleware que exige que o usuário autenticado tenha papel de administrador.
 * Verifica o campo "role" na tabela profiles.
 */
async function requireAdmin(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || !data || data.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso restrito a administradores.' });
    }

    next();
  } catch (err) {
    console.error('Erro ao verificar permissão de admin:', err);
    return res.status(500).json({ error: 'Erro interno ao verificar permissões.' });
  }
}

module.exports = { requireAuth, requireAdmin };
