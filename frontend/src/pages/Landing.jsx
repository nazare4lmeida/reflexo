import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Image, Users, LineChart, Mail } from "lucide-react";
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
      <div className="relative">
        <AnimatedBackground />

        {/* ==========================================================================
           NOVA HERO IMERSIVA (MANTIDA INTEGRALMENTE INTACTA CONFORME SEU PROJETO)
           ========================================================================== */}
        <section className="relative w-full h-[90vh] md:h-screen overflow-hidden rounded-b-[2rem] shadow-soft">
          {/* Imagem de Fundo Cinematográfica com Movimento Lento */}
          <div className="absolute inset-0 z-0">
            <img
              src="/hero-bg.png"
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
                fotos, pensamentos, e todos os momentos que merecem ser
                lembrados.
              </p>

              <div className="mt-12 flex flex-col sm:flex-row gap-4 items-center justify-center">
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
            <span className="font-handwritten text-sm opacity-60 text-center block">
              mar azul · 2026
            </span>
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
            <span className="font-handwritten text-sm opacity-60 text-center block">
              luz da noite
            </span>
          </motion.div>
        </section>

        {/* Ícone de transição natural e suave para rolar a página */}
        <div className="flex justify-center -mt-6 relative z-20">
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="bg-white dark:bg-stone-900 p-3 rounded-full shadow-soft text-reflexo-rose text-xl border border-stone-200/20"
          >
            🌿
          </motion.div>
        </div>

        {/* ==========================================================================
           SEÇÕES INFERIORES ATUALIZADAS PARA O PADRÃO EDITORIAL DO DASHBOARD
           ========================================================================== */}

        {/* Título da seção de Features */}
        <div className="text-center pt-20 pb-4">
          <h2 className="font-sans text-xs uppercase tracking-[0.25em] text-reflexo-brown/40 dark:text-reflexo-beigeLight/40 font-semibold">
            Recursos do Sistema
          </h2>
        </div>

        {/* Features (Melhorado com Glassmorphic Cards) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-8 px-6 md:px-12 max-w-7xl mx-auto">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="rounded-2xl bg-white/50 dark:bg-stone-900/40 backdrop-blur-md p-6 shadow-soft border border-stone-200/30 dark:border-stone-800/30 transition-all duration-300"
              >
                <motion.div
                  whileHover={{ rotate: 6, scale: 1.05 }}
                  className="inline-block p-3 rounded-xl bg-stone-100/60 dark:bg-stone-800/40 mb-4 border border-stone-200/10 shadow-sm"
                >
                  <Icon className="h-6 w-6 text-reflexo-rose" />
                </motion.div>
                <h3 className="font-semibold text-lg mb-2 text-reflexo-brown dark:text-reflexo-beigeLight">
                  {feature.title}
                </h3>
                <p className="text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 font-light leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </section>

        {/* Testimonials (Melhorado com visual de folhas soltas e rotação sutil) */}
        <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto">
          <h2 className="font-sans text-xs text-center uppercase tracking-[0.25em] text-reflexo-brown/40 dark:text-reflexo-beigeLight/40 font-semibold mb-12">
            Vozes da nossa comunidade
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02, rotate: i % 2 === 0 ? -0.5 : 0.5 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl bg-reflexo-beigeRose/15 dark:bg-reflexo-beigeRose/5 border border-reflexo-beigeRose/30 p-6 shadow-softer flex flex-col justify-between group transition-all duration-300"
              >
                <p className="font-handwritten text-xl md:text-2xl mb-4 text-reflexo-brown/90 dark:text-reflexo-beigeLight/90 leading-snug">
                  "{t.text}"
                </p>
                <p className="text-xs tracking-wider uppercase text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 font-medium pt-2 border-t border-stone-200/20">
                  — {t.name}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Nota de saúde mental com espaçamento proporcional */}
        <div className="px-6 md:px-12 max-w-7xl mx-auto pb-12">
          <MentalHealthNotice className="rounded-2xl shadow-soft border border-stone-200/20" />
        </div>
      </div>
    </PageTransition>
  );
}
