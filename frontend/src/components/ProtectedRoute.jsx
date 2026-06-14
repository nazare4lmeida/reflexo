import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protege rotas que exigem autenticação. Redireciona para o login
 * caso o usuário não esteja autenticado.
 */
export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-reflexo-beigeLight">
        <p className="text-reflexo-brown font-handwritten text-2xl">Carregando seu espaço...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
