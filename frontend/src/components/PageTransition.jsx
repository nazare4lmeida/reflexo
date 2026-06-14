import React from 'react';
import { motion } from 'framer-motion';

/**
 * Envolve páginas com uma transição suave de entrada,
 * usada para dar a sensação acolhedora de "abrir" cada seção.
 */
export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-6xl mx-auto px-4 py-8 w-full"
    >
      {children}
    </motion.div>
  );
}
