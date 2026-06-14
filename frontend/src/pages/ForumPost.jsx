import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Flag, Send, Sparkles } from 'lucide-react';
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
        <p className="text-sm text-reflexo-brown/60 dark:text-reflexo-beigeLight/60">Carregando...</p>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Link
        to="/forum"
        className="inline-flex items-center gap-1 text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 hover:text-reflexo-rose mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao fórum
      </Link>

      <div className="bg-white/70 dark:bg-white/10 rounded-xl2 shadow-soft p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2 py-0.5 rounded-full border border-reflexo-beigeRose/50 bg-reflexo-beigeRose/20 text-reflexo-brown">
            {post.forum_categories?.name || 'Geral'}
          </span>
        </div>
        <h1 className="text-xl font-semibold mb-2">{post.title || 'Sem título'}</h1>
        <p className="whitespace-pre-wrap leading-7 text-reflexo-brown/80 dark:text-reflexo-beigeLight/80 mb-4">
          {post.content}
        </p>
        <div className="flex items-center justify-between text-xs text-reflexo-brown/50 dark:text-reflexo-beigeLight/50">
          <span>{post.author_nickname || 'Anônimo'}</span>
          <button
            onClick={() => setReportTarget({ type: 'post', id: post.id })}
            className="flex items-center gap-1 hover:text-reflexo-rose"
          >
            <Flag className="h-3.5 w-3.5" /> Denunciar
          </button>
        </div>
      </div>

      <h2 className="font-medium mb-3">Comentários</h2>

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-start gap-2 rounded-xl2 bg-reflexo-beigeRose/30 border border-reflexo-beigeRose/50 p-3 text-sm"
        >
          <Sparkles className="h-4 w-4 mt-0.5 text-reflexo-rose flex-shrink-0" />
          <p>{feedback}</p>
        </motion.div>
      )}

      <div className="space-y-3 mb-6">
        {comments.map((c) => (
          <div
            key={c.id}
            className="rounded-xl2 p-4 border border-reflexo-beigeRose/30 bg-white/60 dark:bg-white/10"
          >
            <p className="text-sm leading-6 mb-2 whitespace-pre-wrap">{c.content}</p>
            <div className="flex items-center justify-between text-xs text-reflexo-brown/50 dark:text-reflexo-beigeLight/50">
              <span>{c.author_nickname || 'Anônimo'}</span>
              <button
                onClick={() => setReportTarget({ type: 'comment', id: c.id })}
                className="flex items-center gap-1 hover:text-reflexo-rose"
              >
                <Flag className="h-3.5 w-3.5" /> Denunciar
              </button>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-sm text-reflexo-brown/60 dark:text-reflexo-beigeLight/60 text-center py-6">
            Ainda não há comentários. Você pode ser a primeira pessoa a responder com gentileza.
          </p>
        )}
      </div>

      <form onSubmit={handleComment} className="flex flex-col sm:flex-row gap-2">
        <textarea
          rows={2}
          placeholder="Escreva uma resposta acolhedora..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="flex-1 rounded-xl border border-reflexo-beigeRose/40 bg-white/60 dark:bg-white/10 px-4 py-2 outline-none resize-none"
        />
        <button
          type="submit"
          disabled={sending}
          className="flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-reflexo-rose text-white font-medium hover:opacity-90 transition disabled:opacity-60 self-start"
        >
          <Send className="h-4 w-4" /> Enviar
        </button>
      </form>

      {/* Modal de denúncia */}
      {reportTarget && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={() => setReportTarget(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-reflexo-brown rounded-xl2 shadow-soft p-6 max-w-md w-full"
          >
            {reportSent ? (
              <p className="text-sm">Obrigado. Sua denúncia foi enviada para a equipe de moderação.</p>
            ) : (
              <>
                <h3 className="font-medium mb-3">Por que você está denunciando este conteúdo?</h3>
                <textarea
                  rows={3}
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Descreva brevemente o motivo..."
                  className="w-full rounded-xl border border-reflexo-beigeRose/40 bg-white/60 dark:bg-white/10 px-4 py-2 outline-none resize-none mb-4"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setReportTarget(null)}
                    className="px-4 py-2 rounded-full text-sm border border-reflexo-beigeRose/50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={submitReport}
                    className="px-4 py-2 rounded-full text-sm bg-reflexo-rose text-white hover:opacity-90"
                  >
                    Enviar denúncia
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </PageTransition>
  );
}
