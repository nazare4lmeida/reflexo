import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun, BookHeart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { AvatarBubble } from './AvatarPicker';

const links = [
  { to: '/dashboard', label: 'Painel' },
  { to: '/diario', label: 'Diário' },
  { to: '/mapa-emocional', label: 'Mapa Emocional' },
  { to: '/cartas', label: 'Cartas' },
  { to: '/memorias', label: 'Memórias' },
  { to: '/forum', label: 'Fórum' },
  { to: '/perfil', label: 'Perfil' },
];

export default function Navbar({ darkMode, onToggleDarkMode }) {
  const { session, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await signOut();
    setOpen(false);
    navigate('/');
  }

  useEffect(() => {
    if (!session) {
      setAvatarSeed(null);
      setIsAdmin(false);
      return;
    }
    api
      .get('/profile/me')
      .then((res) => {
        setAvatarSeed(res.data.profile?.avatar_seed);
        setIsAdmin(res.data.profile?.role === 'admin');
      })
      .catch(() => {});
  }, [session, location.pathname]);

  const navLinks = isAdmin ? [...links, { to: '/admin', label: 'Admin' }] : links;
  
  // Condicional dinâmico: se estiver na home inicial, a barra fica transparente
  const isLanding = location.pathname === '/';

  return (
    <header 
      className={`sticky top-0 z-40 transition-all duration-500 ${
        isLanding 
          ? 'bg-transparent border-b border-transparent' 
          : 'bg-white/60 dark:bg-stone-900/50 backdrop-blur-md border-b border-stone-200/20 dark:border-stone-800/20 shadow-sm'
      } text-reflexo-brown dark:text-reflexo-beigeLight`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* LOGOTIPO ARTÍSTICO / EDITORIAL */}
        <Link 
          to="/" 
          className="flex items-center gap-2 font-handwritten text-2xl md:text-3xl font-semibold tracking-wide text-reflexo-brown dark:text-reflexo-beigeLight"
        >
          <motion.div whileHover={{ rotate: -8, scale: 1.05 }} className="text-reflexo-rose">
            <BookHeart className="h-5 w-5 md:h-6 md:w-6 stroke-[1.8]" />
          </motion.div>
          reflexo
        </Link>

        {/* NAVEGAÇÃO CENTRAL CORRIGIDA COM AS CORES DO SEU TEMA */}
        <nav className="hidden md:flex items-center gap-6 text-sm tracking-wider uppercase font-medium">
          {navLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative pb-1 text-[11px] transition-colors duration-300 ${
                  active
                    ? 'text-reflexo-rose font-semibold'
                    : 'text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 hover:text-reflexo-rose'
                }`}
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="navbar-underline"
                    className="absolute left-0 right-0 -bottom-0.5 h-[1.5px] rounded-full bg-reflexo-rose"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* CONTROLES LATERAIS */}
        <div className="flex items-center gap-4">
          <motion.button
            onClick={onToggleDarkMode}
            aria-label="Alternar tema"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9, rotate: 15 }}
            className="p-2 rounded-xl transition-colors hover:bg-stone-200/40 dark:hover:bg-stone-800/40"
          >
            {darkMode ? <Sun className="h-4 w-4 md:h-5 md:w-5 text-reflexo-beigeLight" /> : <Moon className="h-4 w-4 md:h-5 md:w-5 text-reflexo-brown" />}
          </motion.button>

          {session ? (
            <div className="flex items-center gap-4">
              <Link to="/perfil" className="hidden sm:block hover:opacity-90 transition-opacity">
                <AvatarBubble seed={avatarSeed} size="sm" className="border border-stone-200/20 shadow-sm" />
              </Link>
              <button
                onClick={handleLogout}
                className="hidden sm:inline-block text-[11px] uppercase tracking-widest font-medium px-5 py-2.5 rounded-full bg-reflexo-rose hover:bg-reflexo-rose/90 text-white transition-all duration-300 shadow-sm"
              >
                Sair
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-block text-[11px] uppercase tracking-widest font-medium px-5 py-2.5 rounded-full bg-reflexo-rose hover:bg-reflexo-rose/90 text-white transition-all duration-300 shadow-sm"
            >
              Entrar
            </Link>
          )}

          {/* BOTÃO DO MENU MOBILE */}
          <button 
            className="md:hidden p-2 rounded-xl transition-colors hover:bg-stone-200/40 dark:hover:bg-stone-800/40 text-reflexo-brown dark:text-reflexo-beigeLight"
            onClick={() => setOpen(!open)} 
            aria-label="Abrir menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* MENU DE CORTINA RESPONSIVO */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            className="md:hidden flex flex-col gap-1 px-6 pb-6 overflow-hidden border-t border-stone-200/15 dark:border-stone-800/40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-lg text-reflexo-brown dark:text-reflexo-beigeLight"
          >
            {session && (
              <div className="flex items-center gap-3 py-4 border-b border-stone-200/10 dark:border-stone-800/20 mb-2">
                <AvatarBubble seed={avatarSeed} size="sm" />
                <span className="text-xs font-medium uppercase tracking-wider opacity-60">Sua Jornada</span>
              </div>
            )}
            
            {navLinks.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  onClick={() => setOpen(false)} 
                  className={`py-2 text-xs uppercase tracking-widest transition-colors ${
                    active ? 'text-reflexo-rose font-semibold' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            
            {session ? (
              <button 
                onClick={handleLogout} 
                className="text-left py-2 text-xs uppercase tracking-widest font-semibold text-reflexo-rose mt-2 pt-4 border-t border-stone-200/10 dark:border-stone-800/20"
              >
                Encerrar Sessão
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="text-left py-2 text-xs uppercase tracking-widest font-semibold text-reflexo-rose mt-2 pt-4 border-t border-stone-200/10 dark:border-stone-800/20"
              >
                Fazer Login
              </Link>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}