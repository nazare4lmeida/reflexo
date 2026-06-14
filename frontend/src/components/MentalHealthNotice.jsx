import React from 'react';
import { HeartHandshake } from 'lucide-react';

/**
 * Aviso obrigatório exibido em locais estratégicos da plataforma,
 * reforçando que o Reflexo não substitui acompanhamento profissional.
 */
export default function MentalHealthNotice({ className = '' }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl2 bg-reflexo-beigeRose/30 border border-reflexo-rose/30 p-4 text-sm text-reflexo-beigeRose/150 ${className}`}
    >
      <HeartHandshake className="h-5 w-5 flex-shrink-0 text-reflexo-beigeLight/150 mt-0.5" />
      <p>
        O Reflexo não substitui acompanhamento psicológico profissional. Em situações de crise
        emocional, procure ajuda especializada ou os serviços de emergência da sua região (no
        Brasil, o CVV oferece apoio gratuito pelo número <strong>188</strong>).
      </p>
    </div>
  );
}
