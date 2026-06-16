import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Image, Users, LineChart, Mail } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import MentalHealthNotice from '../components/MentalHealthNotice';
import AnimatedBackground from '../components/AnimatedBackground';

const features = [
  {
    icon: BookOpen,
    title: 'Diário Pessoal',
    description:
      'Escreva livremente em um espaço privado, inspirado em um caderno de papel, com tags emocionais e sugestões acolhedoras.',
  },
  {
    icon: LineChart,
    title: 'Mapa Emocional',
    description:
      'Acompanhe sua jornada com gráficos simples e gentis, percebendo padrões e sua evolução com o tempo.',
  },
  {
    icon: Image,
    title: 'Álbum de Memórias',
    description:
      'Guarde fotos e lembranças importantes em um álbum visual, com a sensação de virar páginas de um caderno antigo.',
  },
  {
    icon: Mail,
    title: 'Cartas para o Futuro',
    description: 'Escreva para a pessoa que você será, e receba sua própria carta no momento certo.',
  },
  {
    icon: Users,
    title: 'Fórum Anônimo',
    description:
      'Converse com outras pessoas sobre o que você está sentindo, em um ambiente respeitoso, moderado e sem exposição.',
  },
];

const testimonials = [
  {
    name: 'Usuária anônima',
    text: 'Escrever aqui me ajudou a entender melhor o que estava sentindo, sem pressa e sem julgamento.',
  },
  {
    name: 'Usuário anônimo',
    text: 'O mapa emocional me mostrou que tive mais dias bons do que eu imaginava. Isso mudou minha perspectiva.',
  },
  {
    name: 'Usuária anônima',
    text: 'O fórum é o primeiro lugar online onde me senti realmente ouvida, sem medo de ser julgada.',
  },
];

export default function Landing() {
  return (
    <PageTransition>
      <div className="relative">
        <AnimatedBackground />
        
        {/* ==========================================================================
           NOVA HERO IMERSIVA (Substituindo o topo antigo para replicar a imagem enviada)
           ========================================================================== */}
        <section className="relative w-full h-[90vh] md:h-screen overflow-hidden rounded-b-[2rem] shadow-soft">
          
{/* Imagem de Fundo Cinematográfica com Movimento Lento */}
<div className="absolute inset-0 z-0">
<img
  src="https://drive.google.com/thumbnail?id=1fprvkj1Ugo95jeoObwHIx93AEDX-MGHz&sz=w2000"
  alt="Mesa Reflexo"
  className="w-full h-full object-cover animate-bg-hero filter brightness-[0.75] contrast-[0.95] saturate-[0.85]"
/>
  <div className="hero-overlay" />
</div>

          {/* Conteúdo Centralizado (Simula a escrita flutuante no livro aberto) */}
          <div className="relative z-10 w-full h-full flex flex-col justify-center items-center text-center px-6">
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
             className="
    absolute
    left-[33%]
    top-[29%]
    -translate-x-1/2
    -translate-y-1/2
    flex
    flex-col
    items-center
    text-center
    w-[320px]
    max-w-[30vw]
  "
>
              <span className="font-handwritten text-1xl md:text-3xl text-slate-200/90 tracking-wide mb-2">
                um lugar para guardar
              </span>
              
              <h1 className="font-handwritten text-5xl md:text-[5rem] font-bold tracking-tight mb-5 text-white drop-shadow-md">
                o que importa
              </h1>
              
              <p className="font-sans text-sm md:text-base font-light tracking-wide text-slate-200/80 max-w-md leading-relaxed px-4">
                fotos, pensamentos, e todos os momentos que merecem ser lembrados.
              </p>

              <div className="mt-12 flex flex-col sm:flex-row gap-4 items-center justify-center">
                <Link
                  to="/cadastro"
                  className="font-sans text-xs uppercase tracking-widest text-white border-b border-white/50 pb-1 transition duration-300 hover:border-white"
                >
                  começar a escrever
                </Link>
                <span className="hidden sm:inline text-white/40 text-xs">•</span>
                <Link
                  to="/login"
                  className="font-sans text-xs uppercase tracking-widest text-slate-300 hover:text-white transition duration-300"
                >
                  entrar na conta
                </Link>
              </div>
            </motion.div>
          </div>

          {/* POLAROIDS ORGANIZADAS NOS CANTOS DA IMAGEM */}
          {/* Polaroid Esquerda */}
          <motion.div 
            initial={{ opacity: 0, x: -50, rotate: -15 }}
            animate={{ opacity: 1, x: 0, rotate: -6 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="hidden lg:block absolute bottom-16 left-16 scale-90 polaroid polaroid-float text-slate-800"
          >
            <img 
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300" 
              alt="Memória Praia" 
              className="w-40 h-40 object-cover mb-2 filter sepia-[0.1]"
            />
            <span className="font-handwritten text-sm opacity-60 text-center block">mar azul · 2026</span>
          </motion.div>

          {/* Polaroid Direita */}
          <motion.div 
            initial={{ opacity: 0, x: 50, rotate: 15 }}
            animate={{ opacity: 1, x: 0, rotate: 4 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="hidden lg:block absolute bottom-12 right-20 scale-95 polaroid polaroid-float text-slate-800"
          >
            <img 
              src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=300" 
              alt="Memória Luz" 
              className="w-44 h-44 object-cover mb-2 filter grayscale-[0.05]"
            />
            <span className="font-handwritten text-sm opacity-60 text-center block">luz da noite</span>
          </motion.div>
        </section>

        {/* Ícone de transição natural e suave para rolar a página */}
        <div className="flex justify-center -mt-6 relative z-20">
          <motion.div 
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-white dark:bg-reflexo-dark p-3 rounded-full shadow-soft text-reflexo-rose text-xl"
          >
            🌿
          </motion.div>
        </div>

        {/* Título da seção de Features mantendo o contexto atual */}
        <div className="text-center pt-16 pb-4">
          <h2 className="text-xl font-medium tracking-widest text-reflexo-brown/60 dark:text-reflexo-beigeLight/60 uppercase text-xs">
            Recursos do Sistema
          </h2>
        </div>

        {/* Features (Intacto) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-8 px-6 md:px-12">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6, scale: 1.02 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-xl2 bg-white/70 dark:bg-white/10 p-6 shadow-soft hover:shadow-soft transition-shadow"
              >
                <motion.div whileHover={{ rotate: 8, scale: 1.1 }} className="inline-block">
                  <Icon className="h-8 w-8 text-reflexo-rose mb-3" />
                </motion.div>
                <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                <p className="text-sm text-reflexo-brown/80 dark:text-reflexo-beigeLight/80">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </section>

        {/* Testimonials (Intacto) */}
        <section className="py-12 px-6 md:px-12">
          <h2 className="text-2xl font-semibold text-center mb-8">Vozes da nossa comunidade</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.03, rotate: i % 2 === 0 ? -1 : 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-xl2 bg-reflexo-beigeRose/30 p-6 shadow-softer"
              >
                <p className="font-handwritten text-xl mb-3">"{t.text}"</p>
                <p className="text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70">— {t.name}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <MentalHealthNotice className="mt-8 mx-6 md:mx-12" />
      </div>
    </PageTransition>
  );
}