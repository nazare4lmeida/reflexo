import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Image, Users, LineChart, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import MentalHealthNotice from "../components/MentalHealthNotice";
import AnimatedBackground from "../components/AnimatedBackground";

const features = [
  {
    icon: BookOpen,
    title: "Diário Pessoal",
    description:
      "Escreva livremente em um espaço privado, inspirado em um caderno de papel, com tags emocionais e sugestões acolhedoras.",
  },
  {
    icon: LineChart,
    title: "Mapa Emocional",
    description:
      "Acompanhe sua jornada com gráficos simples e gentis, percebendo padrões e sua evolução com o tempo.",
  },
  {
    icon: Image,
    title: "Álbum de Memórias",
    description:
      "Guarde fotos e lembranças importantes em um álbum visual, com a sensação de virar páginas de um caderno antigo.",
  },
  {
    icon: Mail,
    title: "Cartas para o Futuro",
    description:
      "Escreva para a pessoa que você será, e receba sua própria carta no momento certo.",
  },
  {
    icon: Users,
    title: "Fórum Anônimo",
    description:
      "Converse com outras pessoas sobre o que você está sentindo, em um ambiente respeitoso, moderado e sem exposição.",
  },
];

const testimonials = [
  {
    name: "Usuária anônima",
    text: "Escrever aqui me ajudou a entender melhor o que estava sentindo, sem pressa e sem julgamento.",
  },
  {
    name: "Usuário anônimo",
    text: "O mapa emocional me mostrou que tive mais dias bons do que eu imaginava. Isso mudou minha perspectiva.",
  },
  {
    name: "Usuária anônima",
    text: "O fórum é o primeiro lugar online onde me senti realmente ouvida, sem medo de ser julgada.",
  },
];

export default function Landing() {
  return (
    <PageTransition>
      <div className="relative min-h-screen bg-[#fcfbf7] dark:bg-stone-950 transition-colors duration-300">
        <AnimatedBackground />

        

        {/* ==========================================================================
            HERO IMERSIVA (MENU FLUTUANTE REMOVIDO PARA PRESERVAR O LIVRO LIMPO)
            ========================================================================== */}
        <section className="relative w-full h-[85vh] md:h-screen overflow-hidden rounded-b-[2rem] shadow-soft">
          <div className="absolute inset-0 z-0">
            <img
              src="/hero-bg.png"
              alt="Mesa Reflexo"
              className="w-full h-full object-cover animate-bg-hero filter brightness-[0.75] contrast-[0.95] saturate-[0.85]"
            />
            <div className="hero-overlay" />
          </div>

          {/* Conteúdo Caligráfico Focado */}
          <div className="relative z-10 w-full h-full flex flex-col justify-center items-center text-center px-6">
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute left-[33%] top-[29%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center w-[320px] max-w-[30vw]"
            >
              <span className="font-handwritten text-xl md:text-3xl text-slate-200/90 tracking-wide mb-2 select-none">
                um lugar para guardar
              </span>

              <h1 className="font-handwritten text-5xl md:text-[5rem] font-bold tracking-tight mb-4 text-white drop-shadow-md select-none">
                o que importa
              </h1>

              <p className="font-sans text-xs md:text-sm font-light tracking-wide text-slate-200/80 max-w-md leading-relaxed px-4 select-none">
                fotos, pensamentos, e todos os momentos que merecem ser
                lembrados.
              </p>
              <div className="mt-20 flex flex-col sm:flex-row gap-4 items-center justify-center">
                <Link
                  to="/cadastro"
                  className="font-sans text-xs uppercase tracking-widest text-white border-b border-white/50 pb-1 transition duration-300 hover:border-white"
                >
                  começar a escrever
                </Link>

                <span className="hidden sm:inline text-white/40 text-xs">
                  •
                </span>

                <Link
                  to="/login"
                  className="font-sans text-xs uppercase tracking-widest text-slate-300 hover:text-white transition duration-300"
                >
                  entrar na conta
                </Link>
              </div>
            </motion.div>
          </div>

          {/* POLAROIDS DISCRETAS LATERAIS */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: -4 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block absolute bottom-16 left-16 scale-75 polaroid text-slate-800 shadow-soft"
          >
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=250"
              alt="Memória Mar"
              className="w-36 h-36 object-cover mb-2 filter sepia-[0.05]"
            />
            <span className="font-handwritten text-xs opacity-60 text-center block">
              mar azul · 2026
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 8 }}
            animate={{ opacity: 1, scale: 1, rotate: 3 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block absolute bottom-16 right-20 scale-75 polaroid text-slate-800 shadow-soft"
          >
            <img
              src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=250"
              alt="Memória Noite"
              className="w-36 h-36 object-cover mb-2"
            />
            <span className="font-handwritten text-xs opacity-60 text-center block">
              luz da noite
            </span>
          </motion.div>
        </section>

        {/* Divisor Fluido */}
        <div className="flex justify-center -mt-6 relative z-20">
          <div className="bg-white dark:bg-stone-900 p-3 rounded-full shadow-soft text-reflexo-rose border border-stone-200/10 dark:border-stone-800/40 text-base select-none">
            🌿
          </div>
        </div>

        {/* ==========================================================================
           SEÇÃO RECURSOS: RETORNO AO GRID ALINHADO, LIMPO E SIMÉTRICO
           ========================================================================== */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-12">
          <div className="text-center space-y-2 mb-12">
            <h2 className="font-sans text-[11px] uppercase tracking-[0.25em] text-reflexo-rose font-bold">
              Funcionalidades
            </h2>
            <p className="font-serif text-2xl md:text-3xl text-reflexo-brown dark:text-reflexo-beigeLight font-light">
              Recursos do Sistema
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-5%" }}
                  transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.2) }}
                  className="rounded-2xl bg-white/60 dark:bg-stone-900/40 backdrop-blur-sm p-6 border border-stone-200/30 dark:border-stone-800/40 shadow-soft flex flex-col items-start"
                >
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 text-reflexo-rose border border-stone-100 dark:border-stone-800/20 mb-4 shadow-sm">
                    <Icon className="h-5 w-5 stroke-[1.5]" />
                  </div>
                  <h3 className="font-sans font-semibold text-base text-reflexo-brown dark:text-reflexo-beigeLight mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-xs md:text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 font-light leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ==========================================================================
           SEÇÃO VOZES: DISPOSIÇÃO HORIZONTAL, LIMPA E SEM ROTAÇÕES
           ========================================================================== */}
        <section className="max-w-6xl mx-auto px-6 py-16 border-t border-stone-200/40 dark:border-stone-800/40">
          <div className="text-center space-y-1 mb-12">
            <h2 className="font-sans text-[11px] uppercase tracking-[0.25em] text-stone-400 dark:text-stone-500 font-semibold">
              Espaço Seguro
            </h2>
            <p className="font-serif text-xl md:text-2xl text-reflexo-brown dark:text-reflexo-beigeLight italic">
              Vozes da nossa comunidade
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="bg-white/40 dark:bg-stone-900/20 rounded-2xl p-6 border border-stone-200/20 dark:border-stone-800/40 shadow-sm flex flex-col justify-between min-h-[160px]"
              >
                <p className="font-sans text-xs md:text-sm font-light leading-relaxed text-reflexo-brown/90 dark:text-reflexo-beigeLight/90">
                  "{t.text}"
                </p>
                <div className="pt-3 mt-4 border-t border-stone-100 dark:text-stone-800/10 text-[10px] uppercase tracking-wider font-semibold text-stone-400">
                  — {t.name}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Espaço de Apoio */}
        <div className="max-w-6xl mx-auto px-6 pb-16">
          <MentalHealthNotice className="rounded-2xl shadow-soft border border-stone-200/20 dark:border-stone-800/40" />
        </div>
      </div>
    </PageTransition>
  );
}
