import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import api from '../services/api';

const schema = z
  .object({
    nickname: z
      .string()
      .min(3, 'O nickname deve ter ao menos 3 caracteres.')
      .max(30, 'O nickname deve ter no máximo 30 caracteres.'),
    email: z.string().email('Informe um e-mail válido.'),
    password: z.string().min(8, 'A senha deve ter ao menos 8 caracteres.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

export default function Register() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    setServerError(null);
    try {
      await api.post('/auth/register', {
        nickname: values.nickname,
        email: values.email,
        password: values.password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      const message = err?.response?.data?.error || 'Não foi possível criar sua conta. Tente novamente.';
      setServerError(message);
    }
  }

  return (
    <PageTransition>
      <div className="max-w-md mx-auto bg-white/70 dark:bg-white/10 rounded-xl2 shadow-soft p-8">
        <h1 className="text-2xl font-semibold mb-2">Crie sua conta</h1>
        <p className="text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 mb-6">
          Escolha um nickname anônimo — não pedimos dados sensíveis.
        </p>

        {success ? (
          <p className="text-sm text-reflexo-rose">
            Conta criada com sucesso! Verifique seu e-mail para confirmar o cadastro. Você será
            redirecionado para o login.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nickname</label>
              <input
                type="text"
                {...register('nickname')}
                className="w-full rounded-xl border border-reflexo-beigeRose bg-white/80 dark:bg-white/10 px-4 py-2 outline-none focus:ring-2 focus:ring-reflexo-rose"
              />
              {errors.nickname && <p className="text-xs text-reflexo-rose mt-1">{errors.nickname.message}</p>}
            </div>

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

            <div>
              <label className="block text-sm font-medium mb-1">Confirmar senha</label>
              <input
                type="password"
                {...register('confirmPassword')}
                className="w-full rounded-xl border border-reflexo-beigeRose bg-white/80 dark:bg-white/10 px-4 py-2 outline-none focus:ring-2 focus:ring-reflexo-rose"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-reflexo-rose mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {serverError && <p className="text-sm text-reflexo-rose">{serverError}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-full bg-reflexo-rose text-white font-medium hover:opacity-90 transition disabled:opacity-60"
            >
              {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>
        )}

        <div className="mt-4 text-sm text-center">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-reflexo-rose hover:underline">
            Entrar
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
