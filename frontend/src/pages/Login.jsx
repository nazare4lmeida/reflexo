import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, BookHeart } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { supabase } from '../services/supabaseClient';

const schema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe sua senha.'),
});

export default function Login() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
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
      {/* TELA FLUIDA COM IMAGEM DE FUNDO ATMOSFÉRICA */}
      <div 
        className="w-full min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-12 relative"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=1200&auto=format&fit=crop')"
        }}
      >
        {/* Camada de calmaria suave sobre a imagem */}
        <div className="absolute inset-0 bg-stone-800/80 dark:bg-stone-950/50 pointer-events-none z-0" />

        {/* CARD CENTRAL GLASSMORPHIC */}
        <div className="w-full max-w-md bg-white/70 dark:bg-stone-700/50 backdrop-blur-md rounded-3xl border border-white/20 dark:border-stone-800/40 shadow-deep p-8 space-y-6 relative z-10">
          
          {/* LOGO E IDENTIDADE DA TELA */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-full bg-reflexo-rose/10 text-reflexo-rose mb-1">
              <BookHeart className="h-5 w-5 stroke-[1.5]" />
            </div>
            <h1 className="font-sans text-2xl font-light tracking-wide text-stone-900 dark:text-white">
              Bem-vindo de <span className="font-semibold">volta</span>
            </h1>
            <p className="font-sans text-xs md:text-sm text-reflexo-brown/60 dark:text-reflexo-beigeLight/60 tracking-wide">
              Entre para continuar sua jornada de autoconhecimento.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* EMAIL */}
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-semibold text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full rounded-xl border border-stone-200/40 dark:border-stone-700/40 bg-white/60 dark:bg-stone-800/20 px-4 py-2.5 text-xs md:text-sm outline-none text-reflexo-brown dark:text-reflexo-beigeLight focus:border-reflexo-rose/40 transition-colors"
              />
              {errors.email && <p className="text-[11px] text-reflexo-rose mt-1 font-medium">{errors.email.message}</p>}
            </div>

            {/* SENHA */}
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-semibold text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="w-full rounded-xl border border-stone-200/40 dark:border-stone-700/40 bg-white/60 dark:bg-stone-800/20 pl-4 pr-11 py-2.5 text-xs md:text-sm outline-none text-reflexo-brown dark:text-reflexo-beigeLight focus:border-reflexo-rose/40 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-reflexo-rose transition-colors p-1 rounded-md"
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 stroke-[1.8]" /> : <Eye className="h-4 w-4 stroke-[1.8]" />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-reflexo-rose mt-1 font-medium">{errors.password.message}</p>}
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
              {isSubmitting ? 'Entrando...' : 'Entrar na conta'}
            </button>
          </form>

          {/* NAVEGAÇÃO DE SUPORTE */}
          <div className="pt-2 border-t border-stone-200/20 dark:border-stone-800/20 flex justify-between text-xs font-medium tracking-wide">
            <Link to="/redefinir-senha" className="text-stone-600/70 dark:text-stone-400/70 hover:text-reflexo-rose transition-colors">
              Esqueceu a senha?
            </Link>
            <Link to="/cadastro" className="text-reflexo-rose hover:opacity-80 transition-opacity font-semibold">
              Crie uma conta
            </Link>
          </div>
          
        </div>
      </div>
    </PageTransition>
  );
}