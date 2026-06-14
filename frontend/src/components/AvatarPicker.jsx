import React from 'react';
import { motion } from 'framer-motion';

/**
 * Conjunto de avatares "figurinha" — emojis com fundos coloridos vibrantes,
 * para deixar o perfil mais divertido e pessoal sem usar imagens de terceiros.
 * O valor salvo em avatar_seed segue o formato "emoji|colorKey".
 */
export const AVATAR_BACKGROUNDS = {
  blue: 'bg-blue-100 dark:bg-blue-500/20',
  green: 'bg-emerald-100 dark:bg-emerald-500/20',
  purple: 'bg-purple-100 dark:bg-purple-500/20',
  pink: 'bg-pink-100 dark:bg-pink-500/20',
  yellow: 'bg-amber-100 dark:bg-amber-500/20',
  orange: 'bg-orange-100 dark:bg-orange-500/20',
  teal: 'bg-teal-100 dark:bg-teal-500/20',
  rose: 'bg-reflexo-rose/15',
};

export const AVATAR_OPTIONS = [
  { emoji: '🦊', color: 'orange' },
  { emoji: '🐱', color: 'pink' },
  { emoji: '🐼', color: 'green' },
  { emoji: '🐸', color: 'teal' },
  { emoji: '🐧', color: 'blue' },
  { emoji: '🦄', color: 'purple' },
  { emoji: '🐢', color: 'green' },
  { emoji: '🦋', color: 'rose' },
  { emoji: '🌻', color: 'yellow' },
  { emoji: '🌙', color: 'purple' },
  { emoji: '⭐', color: 'yellow' },
  { emoji: '🔥', color: 'orange' },
  { emoji: '🌈', color: 'pink' },
  { emoji: '🍀', color: 'green' },
  { emoji: '🎧', color: 'blue' },
  { emoji: '📚', color: 'teal' },
  { emoji: '☕', color: 'orange' },
  { emoji: '🌊', color: 'blue' },
  { emoji: '🍉', color: 'rose' },
  { emoji: '👻', color: 'purple' },
  { emoji: '🤖', color: 'teal' },
  { emoji: '🎮', color: 'blue' },
  { emoji: '🐙', color: 'rose' },
  { emoji: '🌵', color: 'green' },
];

export function parseAvatarSeed(seed) {
  if (!seed) return AVATAR_OPTIONS[0];
  const [emoji, color] = seed.split('|');
  if (!emoji) return AVATAR_OPTIONS[0];
  return { emoji, color: color || 'rose' };
}

/**
 * Bolha de avatar redonda, usada na navbar, perfil e em qualquer lugar
 * que precise mostrar o "rostinho" do usuário.
 */
export function AvatarBubble({ seed, size = 'md', className = '' }) {
  const { emoji, color } = parseAvatarSeed(seed);
  const sizes = {
    sm: 'w-8 h-8 text-base',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-20 h-20 text-4xl',
  };

  return (
    <div
      className={`flex items-center justify-center rounded-full ${AVATAR_BACKGROUNDS[color] || AVATAR_BACKGROUNDS.rose} ${sizes[size]} ${className}`}
    >
      <span>{emoji}</span>
    </div>
  );
}

/**
 * Grade de seleção de avatares estilo "figurinha".
 * value: string no formato "emoji|color". onChange: (novoSeed) => void
 */
export default function AvatarPicker({ value, onChange }) {
  const current = parseAvatarSeed(value);

  return (
    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
      {AVATAR_OPTIONS.map((opt) => {
        const seed = `${opt.emoji}|${opt.color}`;
        const active = current.emoji === opt.emoji;
        return (
          <motion.button
            key={seed}
            type="button"
            whileHover={{ scale: 1.12, rotate: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(seed)}
            className={`flex items-center justify-center rounded-full aspect-square text-2xl transition-colors ${
              AVATAR_BACKGROUNDS[opt.color]
            } ${active ? 'ring-2 ring-reflexo-rose ring-offset-2 ring-offset-transparent' : ''}`}
          >
            {opt.emoji}
          </motion.button>
        );
      })}
    </div>
  );
}
