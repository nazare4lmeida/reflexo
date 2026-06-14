import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import RecoverPassword from './pages/RecoverPassword';
import Dashboard from './pages/Dashboard';
import Diary from './pages/Diary';
import MoodMap from './pages/MoodMap';
import Letters from './pages/Letters';
import Memories from './pages/Memories';
import Forum from './pages/Forum';
import ForumPost from './pages/ForumPost';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar darkMode={darkMode} onToggleDarkMode={() => setDarkMode((d) => !d)} />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/redefinir-senha" element={<RecoverPassword />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diario"
            element={
              <ProtectedRoute>
                <Diary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mapa-emocional"
            element={
              <ProtectedRoute>
                <MoodMap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cartas"
            element={
              <ProtectedRoute>
                <Letters />
              </ProtectedRoute>
            }
          />
          <Route
            path="/memorias"
            element={
              <ProtectedRoute>
                <Memories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum"
            element={
              <ProtectedRoute>
                <Forum />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum/:id"
            element={
              <ProtectedRoute>
                <ForumPost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          </Routes>
        </AnimatePresence>
      </main>

      <footer className="text-center text-xs text-reflexo-brown/70 dark:text-reflexo-beigeLight/60 py-6">
        © {new Date().getFullYear()} Reflexo · Um espaço seguro para olhar para dentro.
      </footer>
    </div>
  );
}
