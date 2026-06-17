import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
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
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      {/* TELA FLUIDA COM IMAGEM DE FUNDO ATMOSFÉRICA DELICADA */}
      <div 
        className="w-full min-h-screen flex items-center justify-center brightness-[0.85] dark:brightness-[0.65] bg-cover bg-center bg-no-repeat px-4 py-12 relative"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1200&auto=format&fit=crop')"
        }}
      >
        {/* Camada fosca por cima da imagem */}
        <div className="absolute inset-0 bg-stone-800/80 dark:bg-stone-750/40 pointer-events-none z-0" />

        {/* CARD CENTRAL GLASSMORPHIC */}
        <div className="w-full max-w-md bg-white/70 dark:bg-slate-50 backdrop-blur-md rounded-3xl border border-white/20 dark:border-stone-800/40 shadow-deep p-8 space-y-6 relative z-10">
          
          {/* HEADER DO FORMULÁRIO */}
          <div className="text-center space-y-1.5">
            <h1 className="font-sans text-2xl font-light tracking-wide text-stone-900 dark:text-yellow-950">
              Crie sua <span className="font-semibold">conta</span>
            </h1>
            <p className="font-sans text-xs md:text-sm text-reflexo-brown/60 dark:text-yellow-950/80 tracking-wide max-w-xs mx-auto leading-relaxed">
              Escolha um nickname totalmente anônimo — protegemos sua privacidade de ponta a ponta.
            </p>
          </div>

          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-reflexo-beigeRose/15 dark:bg-stone-800/30 border border-reflexo-beigeRose/30 rounded-2xl p-4 flex items-start gap-2.5 shadow-sm"
            >
              <Sparkles className="h-4 w-4 text-reflexo-rose mt-0.5 shrink-0 animate-pulse" />
              <p className="text-xs md:text-sm font-light leading-relaxed text-reflexo-brown  dark:text-amber-950">
                Conta criada com sucesso! Redirecionando para a página de Login...
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* NICKNAME */}
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-semibold text-reflexo-brown/50 dark:text-yellow-950 mb-1.5">
                  Nickname
                </label>
                <input
                  type="text"
                  {...register('nickname')}
                  className="w-full rounded-xl border border-stone-200/40 dark:border-stone-700/40 bg-white/60 dark:bg-stone-400/20 px-4 py-2.5 text-xs md:text-sm outline-none text-reflexo-brown dark:text-amber-950 focus:border-reflexo-rose/40 transition-colors"
                />
                {errors.nickname && <p className="text-[11px] text-reflexo-rose mt-1 font-medium">{errors.nickname.message}</p>}
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-semibold text-reflexo-brown/50 dark:text-yellow-950 mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full rounded-xl border border-stone-200/40 dark:border-stone-700/40 bg-white/60 dark:bg-stone-400/20 px-4 py-2.5 text-xs md:text-sm outline-none text-reflexo-brown dark:text-amber-950 focus:border-reflexo-rose/40 transition-colors"
                />
                {errors.email && <p className="text-[11px] text-reflexo-rose mt-1 font-medium">{errors.email.message}</p>}
              </div>

              {/* SENHA */}
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-semibold text-reflexo-brown/50 dark:text-yellow-950 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className="w-full rounded-xl border border-stone-200/40 dark:border-stone-700/40 bg-white/60  dark:bg-stone-400/20 pl-4 pr-11 py-2.5 text-xs md:text-sm outline-none text-reflexo-brown dark:text-amber-950 focus:border-reflexo-rose/40 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-reflexo-rose transition-colors p-1 rounded-md"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 stroke-[1.8]" /> : <Eye className="h-4 w-4 stroke-[1.8]" />}
                  </button>
                </div>
                {errors.password && <p className="text-[11px] text-reflexo-rose mt-1 font-medium">{errors.password.message}</p>}
              </div>

              {/* CONFIRMAR SENHA */}
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-semibold text-reflexo-brown/50 dark:text-yellow-950 mb-1.5">
                  Confirmar senha
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    className="w-full rounded-xl border border-stone-200/40 dark:border-stone-700/40 bg-white/60 dark:bg-stone-400/20 pl-4 pr-11 py-2.5 text-xs md:text-sm outline-none text-reflexo-brown dark:text-amber-950 focus:border-reflexo-rose/40 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-reflexo-rose transition-colors p-1 rounded-md"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 stroke-[1.8]" /> : <Eye className="h-4 w-4 stroke-[1.8]" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-reflexo-rose mt-1 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>

              {serverError && (
                <p className="text-xs font-medium text-reflexo-rose bg-reflexo-rose/5 p-3 rounded-xl border border-reflexo-rose/10 leading-relaxed">
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 mt-2 rounded-full bg-reflexo-rose text-white text-xs uppercase tracking-widest font-medium shadow-sm hover:opacity-95 transition disabled:opacity-60"
              >
                {isSubmitting ? 'Criando conta...' : 'Criar conta'}
              </button>
            </form>
          )}

          {/* SUPORTE */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800/30 text-center text-xs font-medium tracking-wide text-stone-600/70 dark:text-stone-800/70">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-reflexo-rose hover:opacity-80 transition-opacity font-semibold ml-0.5">
              Entrar
            </Link>
          </div>
          
        </div>
      </div>
    </PageTransition>
  );
}