const sanitizeHtml = require('sanitize-html');

// Lista simples de termos bloqueados (expandir conforme necessário).
// Mantemos em minúsculas e sem acentos para facilitar a comparação.
const BLOCKED_TERMS = [
  'idiota', 'imbecil', 'burro', 'vadia', 'puta',
  'negro de merda', 'macaco', // termos racistas comuns - exemplo simplificado
  'viado de merda', 'bicha de merda',
  'mate-se', 'se mate', 'vá morrer', 'suicide kit',
  'http://bit.ly', 'http://tinyurl',
];

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // remove acentos
}

/**
 * Analisa um texto e retorna se ele deve ser bloqueado/colocado em fila de moderação.
 * Retorna { flagged: boolean, reasons: string[] }
 */
function analyzeContent(text = '') {
  const normalized = normalize(text);
  const reasons = [];

  BLOCKED_TERMS.forEach((term) => {
    if (normalized.includes(normalize(term))) {
      reasons.push(`Termo potencialmente ofensivo detectado: "${term}"`);
    }
  });

  // Detecta possíveis links suspeitos (heurística simples)
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const urls = text.match(urlRegex) || [];
  if (urls.length > 2) {
    reasons.push('Múltiplos links detectados - possível spam.');
  }

  return { flagged: reasons.length > 0, reasons };
}

/**
 * Sanitiza o HTML de entradas de texto para evitar XSS.
 */
function sanitizeText(text = '') {
  return sanitizeHtml(text, {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    allowedAttributes: {},
  });
}

module.exports = { analyzeContent, sanitizeText };
