import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { supabase } from '../services/supabaseClient';

const schema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
});

export default function RecoverPassword() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    // Por segurança, sempre mostramos a mesma mensagem,
    // independentemente de o e-mail existir ou não.
    setSent(true);
  }

  return (
    <PageTransition>
      <div className="max-w-md mx-auto bg-white/70 dark:bg-white/10 rounded-xl2 shadow-soft p-8">
        <h1 className="text-2xl font-semibold mb-2">Recuperar senha</h1>
        <p className="text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 mb-6">
          Informe seu e-mail e enviaremos um link para redefinir sua senha.
        </p>

        {sent ? (
          <p className="text-sm text-reflexo-rose">
            Se o e-mail informado existir em nossa base, um link de recuperação foi enviado.
          </p>
        ) : (
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-full bg-reflexo-rose text-white font-medium hover:opacity-90 transition disabled:opacity-60"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
          </form>
        )}

        <div className="mt-4 text-sm text-center">
          <Link to="/login" className="text-reflexo-rose hover:underline">
            Voltar para o login
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
