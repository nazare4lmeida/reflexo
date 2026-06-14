import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Trash2, Upload } from 'lucide-react';
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

  // Agrupa memórias por ano/mês para a navegação do álbum
  const grouped = memories.reduce((acc, memory) => {
    const date = new Date(memory.memory_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(memory);
    return acc;
  }, {});

  return (
    <PageTransition>
      <h1 className="text-2xl font-semibold mb-1">Álbum de Memórias</h1>
      <p className="text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70 mb-6">
        Guarde momentos importantes, como páginas de um álbum antigo.
      </p>

      <form onSubmit={handleSubmit} className="bg-white/70 dark:bg-white/10 rounded-xl2 shadow-soft p-6 mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Título da memória"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border border-reflexo-beigeRose/40 bg-white/60 dark:bg-white/10 px-4 py-2 outline-none"
          />
          <input
            type="date"
            value={memoryDate}
            onChange={(e) => setMemoryDate(e.target.value)}
            className="rounded-xl border border-reflexo-beigeRose/40 bg-white/60 dark:bg-white/10 px-4 py-2 outline-none"
          />
        </div>
        <textarea
          rows={3}
          placeholder="O que esse momento significa para você?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border border-reflexo-beigeRose/40 bg-white/60 dark:bg-white/10 px-4 py-2 outline-none resize-none font-handwritten text-lg"
        />
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Upload className="h-4 w-4" />
          {file ? file.name : 'Escolher imagem (opcional)'}
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-full bg-reflexo-rose text-white font-medium hover:opacity-90 transition disabled:opacity-60"
        >
          {saving ? 'Guardando memória...' : 'Guardar memória'}
        </button>
      </form>

      {Object.keys(grouped).length === 0 ? (
        <p className="text-sm text-reflexo-brown/70 dark:text-reflexo-beigeLight/70">
          Seu álbum ainda está vazio. Adicione sua primeira memória acima.
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
              <div key={key} className="album-page rounded-xl2 shadow-soft p-6 mb-6">
                <h2 className="font-handwritten text-2xl mb-4 capitalize">{monthName}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((memory) => (
                    <motion.div
                      key={memory.id}
                      initial={{ opacity: 0, rotate: -1, y: 10 }}
                      animate={{ opacity: 1, rotate: 0, y: 0 }}
                      whileHover={{ scale: 1.04, rotate: -2, zIndex: 10 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="polaroid"
                    >
                      {memory.image_url ? (
                        <img
                          src={memory.image_url}
                          alt={memory.title}
                          className="w-full h-40 object-cover rounded-sm mb-2"
                        />
                      ) : (
                        <div className="w-full h-40 bg-reflexo-beigeRose/40 rounded-sm mb-2 flex items-center justify-center text-reflexo-brown/40">
                          Sem imagem
                        </div>
                      )}
                      <p className="font-handwritten text-lg">{memory.title}</p>
                      {memory.description && (
                        <p className="text-xs text-reflexo-brown/70 line-clamp-2">{memory.description}</p>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        <button onClick={() => toggleFavorite(memory)} aria-label="Favoritar">
                          <Heart
                            className={`h-4 w-4 ${
                              memory.is_favorite ? 'fill-reflexo-rose text-reflexo-rose' : 'text-reflexo-brown/40'
                            }`}
                          />
                        </button>
                        <button onClick={() => handleDelete(memory.id)} aria-label="Excluir">
                          <Trash2 className="h-4 w-4 text-reflexo-brown/40 hover:text-reflexo-rose" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })
      )}
    </PageTransition>
  );
}
