import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

/**
 * Protege rotas administrativas: exige sessão ativa E role === 'admin'
 * no perfil do usuário. Usuários comuns são redirecionados para o painel.
 */
export default function AdminRoute({ children }) {
  const { session, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!session) {
      setChecking(false);
      return;
    }

    api
      .get('/profile/me')
      .then((res) => {
        setIsAdmin(res.data?.profile?.role === 'admin');
      })
      .catch(() => {
        setIsAdmin(false);
      })
      .finally(() => setChecking(false));
  }, [session, loading]);

  if (loading || checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-reflexo-beigeLight dark:bg-reflexo-dark">
        <p className="text-reflexo-brown dark:text-reflexo-beigeLight font-handwritten text-2xl">
          Verificando acesso...
        </p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}