import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Flag, Send, Sparkles, AlertCircle, MessageCircle } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import api from '../services/api';

export default function ForumPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSent, setReportSent] = useState(false);

  async function load() {
    try {
      const res = await api.get(`/forum/posts/${id}`);
      setPost(res.data.post);
      setComments(res.data.comments || []);
    } catch (err) {
      console.error('Erro ao carregar post:', err);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;

    setSending(true);
    setFeedback('');
    try {
      const res = await api.post(`/forum/posts/${id}/comments`, { content: comment });
      if (res.data?.comment?.status === 'pending') {
        setFeedback('Seu comentário foi recebido e está em revisão antes de aparecer publicamente.');
      } else {
        setFeedback('');
      }
      setComment('');
      load();
    } catch (err) {
      console.error('Erro ao comentar:', err);
      setFeedback('Não foi possível enviar o comentário agora.');
    } finally {
      setSending(false);
    }
  }

  async function submitReport() {
    if (!reportTarget || !reportReason.trim()) return;
    try {
      await api.post('/forum/reports', {
        target_type: reportTarget.type,
        target_id: reportTarget.id,
        reason: reportReason,
      });
      setReportSent(true);
      setReportReason('');
      setTimeout(() => {
        setReportTarget(null);
        setReportSent(false);
      }, 1800);
    } catch (err) {
      console.error('Erro ao enviar denúncia:', err);
    }
  }

  if (!post) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-xs uppercase tracking-widest opacity-40">Buscando relato na rede...</p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* BOTÃO VOLTAR MINIMALISTA */}
        <div>
          <Link
            to="/forum"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-medium text-reflexo-brown/60 dark:text-reflexo-beigeLight/60 hover:text-reflexo-rose transition-colors duration-300"
          >
            <ArrowLeft className="h-3.5 w-3.5 stroke-[2]" /> Voltar ao fórum
          </Link>
        </div>

        {/* POST PRINCIPAL ESTILO CARTA ABERTA */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/50 dark:bg-stone-900/40 backdrop-blur-md rounded-2xl border border-stone-200/30 dark:border-stone-800/40 p-6 md:p-8 shadow-soft"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-medium tracking-wider bg-stone-100 dark:bg-stone-800/60 text-reflexo-brown dark:text-reflexo-beigeLight border border-stone-200/20 px-2.5 py-0.5 rounded-full shadow-sm">
              {post.forum_categories?.name || 'Geral'}
            </span>
          </div>
          
          <h1 className="font-sans text-xl md:text-2xl font-semibold mb-3 text-reflexo-brown dark:text-reflexo-beigeLight">
            {post.title || 'Sem título'}
          </h1>
          
          <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base font-light text-reflexo-brown/90 dark:text-reflexo-beigeLight/90 mb-6">
            {post.content}
          </p>
          
          <div className="flex items-center justify-between text-xs font-medium tracking-wide text-stone-400 pt-4 border-t border-stone-100 dark:border-stone-800/30">
            <span className="italic opacity-80">{post.author_nickname || 'Alma Anônima'}</span>
            <button
              onClick={() => setReportTarget({ type: 'post', id: post.id })}
              className="flex items-center gap-1.5 hover:text-reflexo-rose transition-colors"
            >
              <Flag className="h-3.5 w-3.5 opacity-70" /> Denunciar desabafo
            </button>
          </div>
        </motion.div>

        {/* SEÇÃO HISTÓRICA DE COMENTÁRIOS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pl-1">
            <MessageCircle className="h-4 w-4 text-reflexo-rose/70" />
            <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 font-semibold">
              Respostas da Comunidade
            </h2>
          </div>

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2.5 rounded-xl bg-reflexo-beigeRose/15 dark:bg-stone-800/30 border border-reflexo-beigeRose/30 p-4 text-xs md:text-sm text-reflexo-brown dark:text-reflexo-beigeLight"
              >
                <Sparkles className="h-4 w-4 mt-0.5 text-reflexo-rose shrink-0" />
                <p className="font-light leading-relaxed">{feedback}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* LISTA DE RESPOSTAS */}
          <div className="space-y-3">
            {comments.map((c, index) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.15) }}
                className="rounded-2xl p-5 border border-stone-200/20 dark:border-stone-800/40 bg-white/40 dark:bg-stone-900/20 shadow-sm"
              >
                <p className="text-xs md:text-sm leading-relaxed font-light text-reflexo-brown/90 dark:text-reflexo-beigeLight/90 mb-3 whitespace-pre-wrap">
                  {c.content}
                </p>
                <div className="flex items-center justify-between text-[11px] font-medium tracking-wide text-stone-400 pt-2 border-t border-stone-100/40 dark:border-stone-800/10">
                  <span className="italic opacity-70">{c.author_nickname || 'Apoio Anônimo'}</span>
                  <button
                    onClick={() => setReportTarget({ type: 'comment', id: c.id })}
                    className="flex items-center gap-1.5 hover:text-reflexo-rose transition-colors"
                  >
                    <Flag className="h-3.5 w-3.5 opacity-60" /> Denunciar
                  </button>
                </div>
              </motion.div>
            ))}

            {comments.length === 0 && (
              <div className="text-center py-10 border border-dashed border-stone-300/60 dark:border-stone-700/60 rounded-2xl">
                <p className="text-xs uppercase tracking-wider text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 font-light px-4">
                  Ainda não há comentários por aqui. Você pode ser a primeira pessoa a responder com acolhimento.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* FORMULÁRIO FIXADO PARA ENVIAR RESPOSTA */}
        <form onSubmit={handleComment} className="flex flex-col sm:flex-row gap-3 items-start pt-2">
          <textarea
            rows={2}
            placeholder="Escreva uma resposta acolhedora e gentil..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full flex-1 rounded-2xl border border-stone-200/40 dark:border-stone-800/40 bg-white/60 dark:bg-stone-900/30 px-4 py-3 text-xs md:text-sm outline-none resize-none font-sans text-reflexo-brown dark:text-reflexo-beigeLight placeholder:opacity-40 focus:border-reflexo-rose/40 leading-relaxed"
          />
          <button
            type="submit"
            disabled={sending}
            className="px-6 py-3 rounded-full bg-reflexo-rose text-white text-xs uppercase tracking-widest font-medium shadow-sm hover:opacity-95 transition disabled:opacity-60 flex items-center justify-center gap-1.5 shrink-0 self-stretch sm:self-auto"
          >
            <Send className="h-3.5 w-3.5" /> Enviar
          </button>
        </form>

        {/* MODAL DE DENÚNCIA TOTALMENTE EDITORIAL */}
        <AnimatePresence>
          {reportTarget && (
            <div
              className="fixed inset-0 bg-stone-950/40 dark:bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setReportTarget(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-stone-900 rounded-3xl shadow-deep p-6 max-w-md w-full border border-stone-200/40 dark:border-stone-800/40"
              >
                {reportSent ? (
                  <div className="text-center py-4 space-y-2">
                    <Sparkles className="h-6 w-6 text-reflexo-rose mx-auto animate-pulse" />
                    <p className="text-sm font-light text-reflexo-brown dark:text-reflexo-beigeLight">
                      Obrigado pelo zelo. Sua denúncia foi arquivada e encaminhada à nossa equipe de moderação protetiva.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-2.5 mb-4 text-reflexo-brown dark:text-reflexo-beigeLight">
                      <AlertCircle className="h-5 w-5 text-reflexo-rose shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-sans text-sm font-semibold">Sinalizar conteúdo inadequado</h3>
                        <p className="text-[11px] text-stone-400 font-light mt-0.5">Por qual motivo você acredita que este registro quebra as diretrizes de acolhimento?</p>
                      </div>
                    </div>
                    
                    <textarea
                      rows={3}
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      placeholder="Descreva brevemente o motivo da sinalização..."
                      className="w-full text-xs rounded-xl border border-stone-200/40 dark:border-stone-800/40 bg-stone-50/50 dark:bg-stone-800/20 px-4 py-3 outline-none resize-none mb-4 text-reflexo-brown dark:text-reflexo-beigeLight focus:border-reflexo-rose/40 leading-relaxed"
                    />
                    
                    <div className="flex justify-end gap-2 text-xs uppercase tracking-widest font-medium">
                      <button
                        type="button"
                        onClick={() => setReportTarget(null)}
                        className="px-4 py-2.5 rounded-full border border-stone-200 text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={submitReport}
                        className="px-4 py-2.5 rounded-full bg-reflexo-rose text-white hover:opacity-95 transition shadow-sm"
                      >
                        Enviar sinalização
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </PageTransition>
  );
}