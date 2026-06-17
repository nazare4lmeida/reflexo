import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Trash2, Upload, Image as ImageIcon, Calendar, Sparkles, BookOpen } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import api from '../services/api';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function Memories() {
  const { user } = useAuth();
  const [memories, setMemories] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [memoryDate, setMemoryDate] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const res = await api.get('/memories');
      setMemories(res.data.memories);
    } catch (err) {
      console.error('Erro ao carregar memórias:', err);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !memoryDate) return;

    setSaving(true);
    try {
      let image_url = null;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage.from('memories').upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = await supabase.storage.from('memories').createSignedUrl(filePath, 60 * 60 * 24 * 365);
        image_url = urlData?.signedUrl || null;
      }

      await api.post('/memories', {
        title,
        description,
        memory_date: memoryDate,
        image_url,
      });

      setTitle('');
      setDescription('');
      setMemoryDate('');
      setFile(null);
      load();
    } catch (err) {
      console.error('Erro ao salvar memória:', err);
    } finally {
      setSaving(false);
    }
  }

  async function toggleFavorite(memory) {
    try {
      await api.put(`/memories/${memory.id}`, { is_favorite: !memory.is_favorite });
      load();
    } catch (err) {
      console.error('Erro ao favoritar memória:', err);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir esta memória permanentemente?')) return;
    try {
      await api.delete(`/memories/${id}`);
      load();
    } catch (err) {
      console.error('Erro ao excluir memória:', err);
    }
  }

  const grouped = memories.reduce((acc, memory) => {
    const date = new Date(memory.memory_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(memory);
    return acc;
  }, {});

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* HEADER DO ÁLBUM DE ESTILO EDITORIAL */}
        <div className="border-b border-stone-200/20 dark:border-stone-800/20 pb-4">
          <h1 className="text-2xl md:text-3xl font-light tracking-wide text-reflexo-brown dark:text-reflexo-beigeLight">
            Álbum de <span className="font-semibold">Memórias</span>
          </h1>
          <p className="font-sans text-xs md:text-sm text-reflexo-brown/60 dark:text-reflexo-beigeLight/60 tracking-wide mt-1">
            Eternize e organize seus momentos mais bonitos em recortes digitais táteis.
          </p>
        </div>

        {/* GRADE DE DIVISÃO INTERNA: FORMULÁRIO À ESQUERDA, FOTOS À DIREITA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* SEÇÃO DO FORMULÁRIO DE CAPTURA DE LEMBRANÇAS */}
          <div className="bg-white/50 dark:bg-stone-900/40 backdrop-blur-md rounded-2xl border border-stone-200/30 dark:border-stone-800/30 p-6 shadow-soft space-y-4 sticky top-24">
            <h2 className="font-sans text-[11px] uppercase tracking-[0.2em] text-reflexo-brown/50 dark:text-reflexo-beigeLight/50 font-semibold flex items-center gap-1.5 mb-2">
              <BookOpen className="h-3.5 w-3.5 text-reflexo-rose" /> Novo fragmento do tempo
            </h2>
            
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Título da recordação"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-stone-200/40 dark:border-stone-800/40 bg-white/60 dark:bg-stone-800/20 px-4 py-2.5 text-xs outline-none text-reflexo-brown dark:text-reflexo-beigeLight placeholder:opacity-40 focus:border-reflexo-rose/40"
              />
              <input
                type="date"
                value={memoryDate}
                onChange={(e) => setMemoryDate(e.target.value)}
                className="w-full rounded-xl border border-stone-200/40 dark:border-stone-800/40 bg-white/60 dark:bg-stone-800/20 px-4 py-2.5 text-xs outline-none text-reflexo-brown dark:text-reflexo-beigeLight cursor-pointer focus:border-reflexo-rose/40"
              />
              <textarea
                rows={4}
                placeholder="O que essa lembrança diz ao seu coração?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/60 dark:bg-stone-800/20 rounded-xl border border-stone-200/40 dark:border-stone-800/40 px-4 py-3 outline-none resize-none font-handwritten text-xl text-reflexo-brown dark:text-reflexo-beigeLight placeholder:opacity-40 focus:border-reflexo-rose/40 leading-relaxed"
              />
            </div>

            {/* DESIGN REFINADO PARA O UPLOAD DE IMAGEM */}
            <div className="pt-2 flex flex-col gap-3">
              <label className="flex items-center justify-center gap-2 py-4 border border-dashed border-stone-300 dark:border-stone-700/60 rounded-xl cursor-pointer hover:border-reflexo-rose/50 hover:bg-stone-50/50 dark:hover:bg-stone-800/20 transition-all duration-300">
                <Upload className="h-4 w-4 text-reflexo-rose" />
                <span className="text-xs uppercase tracking-wider font-medium text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 truncate max-w-[180px]">
                  {file ? file.name : 'Vincular imagem'}
                </span>
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
              </label>

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={saving}
                className="w-full py-3 rounded-full bg-reflexo-rose text-white text-xs uppercase tracking-widest font-medium shadow-sm hover:opacity-95 transition disabled:opacity-50"
              >
                {saving ? 'Guardando no álbum...' : 'Guardar lembrança'}
              </button>
            </div>
          </div>

          {/* LISTAGEM PRINCIPAL DO ÁLBUM SCRAPBOOK CRONOLÓGICO */}
          <div className="lg:col-span-2 space-y-8">
            {Object.keys(grouped).length === 0 ? (
              <p className="text-sm text-center py-12 text-reflexo-brown/60 dark:text-reflexo-beigeLight/60 font-light border border-dashed border-stone-300/60 dark:border-stone-700/60 rounded-2xl">
                Seu mural de recortes está em branco. Comece a preencher sua história pelo painel lateral.
              </p>
            ) : (
              Object.entries(grouped)
                .sort((a, b) => (a[0] < b[0] ? 1 : -1))
                .map(([key, items]) => {
                  const [year, month] = key.split('-');
                  const monthName = new Date(`${year}-${month}-01`).toLocaleDateString('pt-BR', {
                    month: 'long',
                    year: 'numeric',
                  });

                  return (
                    <div key={key} className="space-y-4">
                      {/* Título Mensal Manuscrito */}
                      <h2 className="font-handwritten text-2xl md:text-3xl text-reflexo-brown dark:text-reflexo-beigeLight capitalize pl-1 flex items-center gap-2 select-none">
                        <Sparkles className="h-4 w-4 text-reflexo-rose/40" /> {monthName}
                      </h2>
                      
                      {/* Grid de Disposição Orgânica das Fotos */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {items.map((memory) => (
                          <motion.div
                            key={memory.id}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ scale: 1.02, rotate: memory.id % 2 === 0 ? -1 : 1, zIndex: 10 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                            className="p-4 bg-white dark:bg-stone-900 border border-stone-200/30 dark:border-stone-800/60 shadow-soft hover:shadow-md flex flex-col justify-between rounded-sm"
                          >
                            <div>
                              {memory.image_url ? (
                                <img
                                  src={memory.image_url}
                                  alt={memory.title}
                                  className="w-full h-48 object-cover rounded-sm mb-3 filter saturate-[0.9] dark:brightness-90"
                                />
                              ) : (
                                <div className="w-full h-48 bg-stone-100 dark:bg-stone-800/40 border border-stone-200/10 rounded-sm mb-3 flex flex-col items-center justify-center gap-1 text-stone-400 select-none">
                                  <ImageIcon className="h-5 w-5 stroke-[1.2] opacity-40" />
                                  <span className="text-[9px] uppercase tracking-wider font-semibold opacity-40">Lembrança em prosa</span>
                                </div>
                              )}
                              
                              <h3 className="font-handwritten text-xl text-reflexo-brown dark:text-reflexo-beigeLight px-0.5 truncate">
                                {memory.title}
                              </h3>
                              
                              {memory.description && (
                                <p className="text-xs font-light text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 line-clamp-3 mt-1 px-0.5 leading-relaxed">
                                  {memory.description}
                                </p>
                              )}
                            </div>

                            {/* Controles da Polaroid */}
                            <div className="flex justify-between items-center mt-4 pt-2 border-t border-stone-100 dark:border-stone-800/40 px-0.5">
                              <div className="flex gap-3.5">
                                <button onClick={() => toggleFavorite(memory)} aria-label="Favoritar lembrança">
                                  <Heart
                                    className={`h-4 w-4 transition-all duration-300 ${
                                      memory.is_favorite ? 'fill-reflexo-rose text-reflexo-rose scale-110' : 'text-stone-400 hover:text-reflexo-rose'
                                    }`}
                                  />
                                </button>
                                <button onClick={() => handleDelete(memory.id)} aria-label="Excluir permanentemente">
                                  <Trash2 className="h-4 w-4 text-stone-400 hover:text-reflexo-rose transition-colors" />
                                </button>
                              </div>
                              
                              <span className="text-[9px] uppercase tracking-wider text-stone-400 font-semibold flex items-center gap-1.5 select-none">
                                <Calendar className="h-3 w-3 opacity-60" />
                                {new Date(memory.memory_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })
            )}
          </div>

        </div>
      </div>
    </PageTransition>
  );
}