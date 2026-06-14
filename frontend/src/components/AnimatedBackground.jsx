import React from 'react';
import { motion } from 'framer-motion';

/**
 * Fundo decorativo com "blobs" suaves em movimento contínuo,
 * usado para dar mais vida a páginas como a Landing e o Dashboard.
 * É puramente decorativo (pointer-events-none) e fica atrás do conteúdo.
 */
export default function AnimatedBackground({ className = '' }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden -z-10 ${className}`}>
      <motion.div
        className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-reflexo-rose/20 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-reflexo-beigeRose/30 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, 40, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-reflexo-gray/20 blur-3xl"
        animate={{ x: [0, 25, 0], y: [0, -25, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
