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
      {/* Hero */}
      <section className="text-center py-12 md:py-20">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-5xl mb-4"
        >
          🌿
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl font-semibold text-reflexo-brown dark:text-reflexo-beigeLight"
        >
          Um espaço seguro para <span className="text-reflexo-rose">olhar para dentro</span>.
        </motion.h1>
        <p className="mt-4 max-w-xl mx-auto text-reflexo-brown/80 dark:text-reflexo-beigeLight/80">
          Reflexo é uma plataforma para autoconhecimento, expressão emocional e apoio anônimo —
          um lugar gentil para escrever, lembrar e se conectar.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/cadastro"
            className="px-6 py-3 rounded-full bg-reflexo-rose text-white font-medium shadow-soft hover:opacity-90 transition"
          >
            Começar agora
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-full bg-white/70 dark:bg-white/10 text-reflexo-brown dark:text-reflexo-beigeLight font-medium shadow-softer hover:bg-white transition"
          >
            Explorar Reflexo
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
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

      {/* Testimonials */}
      <section className="py-12">
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

      <MentalHealthNotice className="mt-8" />
      </div>
    </PageTransition>
  );
}
