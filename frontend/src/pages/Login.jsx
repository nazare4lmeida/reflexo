import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { supabase } from '../services/supabaseClient';

const schema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe sua senha.'),
});

export default function Login() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    setServerError(null);
    const { error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      setServerError('E-mail ou senha inválidos. Verifique seus dados e tente novamente.');
      return;
    }

    navigate('/dashboard');
  }

  return (
    <PageTransition>
      <div className="max-w-md mx-auto bg-white/70 dark:bg-white/10 rounded-xl2 shadow-soft p-8">
        <h1 className="text-2xl font-semibold mb-2">Bem-vindo de volta</h1>
        <p className="text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 mb-6">
          Entre para continuar sua jornada de autoconhecimento.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">E-mail</label>
            <input
              type="email"
              {...register('email')}
              className="w-full rounded-xl border border-reflexo-beigeRose bg-white/80 dark:bg-white/10 px-4 py-2 outline-none focus:ring-2 focus:ring-reflexo-rose"
            />
            {errors.email && <p className="text-xs text-reflexo-rose mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <input
              type="password"
              {...register('password')}
              className="w-full rounded-xl border border-reflexo-beigeRose bg-white/80 dark:bg-white/10 px-4 py-2 outline-none focus:ring-2 focus:ring-reflexo-rose"
            />
            {errors.password && <p className="text-xs text-reflexo-rose mt-1">{errors.password.message}</p>}
          </div>

          {serverError && <p className="text-sm text-reflexo-rose">{serverError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-full bg-reflexo-rose text-white font-medium hover:opacity-90 transition disabled:opacity-60"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-4 flex justify-between text-sm">
          <Link to="/redefinir-senha" className="text-reflexo-rose hover:underline">
            Esqueci minha senha
          </Link>
          <Link to="/cadastro" className="text-reflexo-rose hover:underline">
            Criar conta
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
