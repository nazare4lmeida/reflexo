import React from 'react';
import { Sun, CloudRain, Wind, Compass, Sparkles } from 'lucide-react';

const EMOTIONS = [
  { slug: 'leve', label: 'Leveza', emoji: '☼' },       // Sol suave
  { slug: 'ansioso', label: 'Turbulência', emoji: '≈' }, // Ondas / Vento
  { slug: 'triste', label: 'Melancolia', emoji: '☁' },  // Nuvem
  { slug: 'calmo', label: 'Serenidade', emoji: '☘' },   // Trevo / Planta
  { slug: 'radiante', label: 'Radiante', emoji: '☀' }   // Sol brilhante
];

/**
 * Seletor de tags emocionais usado no diário.
 * value: array de slugs selecionados. onChange: (novoArray) => void
 */
export default function EmotionTagPicker({ value = [], onChange }) {
  function toggle(slug) {
    if (value.includes(slug)) {
      onChange(value.filter((s) => s !== slug));
    } else {
      onChange([...value, slug]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {EMOTIONS.map((emotion) => {
        const active = value.includes(emotion.slug);
        return (
          <button
            key={emotion.slug}
            type="button"
            onClick={() => toggle(emotion.slug)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              active
                ? 'bg-reflexo-rose text-white border-reflexo-rose'
                : 'bg-white/60 dark:bg-white/10 border-reflexo-beigeRose text-reflexo-brown dark:text-reflexo-beigeLight hover:border-reflexo-rose'
            }`}
          >
            {emotion.emoji} {emotion.label}
          </button>
        );
      })}
    </div>
  );
}

export { EMOTIONS };
