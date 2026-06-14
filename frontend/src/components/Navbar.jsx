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

  return (
    <header className="sticky top-0 z-40 bg-reflexo-beigeLight/90 dark:bg-reflexo-dark/90 backdrop-blur border-b border-reflexo-beigeRose/40 shadow-softer">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-reflexo-rose text-xl">
          <motion.div whileHover={{ rotate: -10, scale: 1.1 }}>
            <BookHeart className="h-6 w-6" />
          </motion.div>
          Reflexo
        </Link>

        {session && (
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
            {navLinks.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative pb-1 transition-colors ${
                    active
                      ? 'text-reflexo-rose'
                      : 'text-reflexo-brown dark:text-reflexo-beigeLight hover:text-reflexo-rose'
                  }`}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="navbar-underline"
                      className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-reflexo-rose rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <motion.button
            onClick={onToggleDarkMode}
            aria-label="Alternar tema"
            whileTap={{ scale: 0.85, rotate: 180 }}
            className="p-2 rounded-full hover:bg-reflexo-beigeRose/40 transition-colors"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </motion.button>

          {session ? (
            <>
              <Link to="/perfil" className="hidden sm:block">
                <AvatarBubble seed={avatarSeed} size="sm" />
              </Link>
              <button
                onClick={handleLogout}
                className="hidden sm:inline text-sm px-4 py-2 rounded-full bg-reflexo-rose text-white hover:opacity-90 transition"
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline text-sm px-4 py-2 rounded-full bg-reflexo-rose text-white hover:opacity-90 transition"
            >
              Entrar
            </Link>
          )}

          {session && (
            <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Abrir menu">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {open && session && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden flex flex-col gap-2 px-4 pb-4 text-sm font-medium overflow-hidden"
          >
            <div className="flex items-center gap-2 py-2">
              <AvatarBubble seed={avatarSeed} size="sm" />
            </div>
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="py-1">
                {link.label}
              </Link>
            ))}
            <button onClick={handleLogout} className="text-left py-1 text-reflexo-rose">
              Sair
            </button>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}