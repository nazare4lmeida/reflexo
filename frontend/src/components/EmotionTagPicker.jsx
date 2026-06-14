import React from 'react';

const EMOTIONS = [
  { slug: 'ansiedade', label: 'Ansiedade', emoji: '😟' },
  { slug: 'alegria', label: 'Alegria', emoji: '😊' },
  { slug: 'medo', label: 'Medo', emoji: '😨' },
  { slug: 'gratidao', label: 'Gratidão', emoji: '🙏' },
  { slug: 'cansaco', label: 'Cansaço', emoji: '😴' },
  { slug: 'tristeza', label: 'Tristeza', emoji: '😢' },
  { slug: 'raiva', label: 'Raiva', emoji: '😠' },
  { slug: 'calma', label: 'Calma', emoji: '🌿' },
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
