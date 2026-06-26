import React from 'react';
import { EmptyState, FormField, Modal } from '../../../components/components.jsx';
import { COLORS } from '../../../components/theme.js';
import { toast } from '../../../helpers/alerts.js';
import { tidApi } from '../../../services/tid.js';
import { MessageCircle, Plus, ThumbsUp } from 'lucide-react';

export default function SeccionForos({ session, foros = [], revalidator }) {
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [commentingId, setCommentingId] = React.useState(null);
  const [form, setForm] = React.useState({ titulo: '', categoria: 'General', contenido: '' });
  const [comments, setComments] = React.useState({});

  const handleCreate = async () => {
    if (!form.titulo.trim() || !form.categoria.trim() || !form.contenido.trim()) {
      toast.warning('Completa título, categoría y contenido', 'Campos requeridos');
      return;
    }

    setSaving(true);
    try {
      await tidApi.createForo({
        titulo: form.titulo.trim(),
        categoria: form.categoria.trim(),
        contenido: form.contenido.trim(),
        autorId: session.id,
      });
      setOpen(false);
      setForm({ titulo: '', categoria: 'General', contenido: '' });
      toast.success('Foro creado');
      revalidator.revalidate();
    } catch (error) {
      toast.error(error.message || 'No se pudo crear el foro');
    } finally {
      setSaving(false);
    }
  };

  const handleVote = async (foro) => {
    try {
      await tidApi.votarForo(foro.id);
      revalidator.revalidate();
    } catch (error) {
      toast.error(error.message || 'No se pudo registrar el voto');
    }
  };

  const handleComment = async (foro) => {
    const contenido = comments[foro.id]?.trim();
    if (!contenido) {
      toast.warning('Escribe un comentario');
      return;
    }

    setCommentingId(foro.id);
    try {
      await tidApi.comentarForo(foro.id, { autorId: session.id, contenido });
      setComments((prev) => ({ ...prev, [foro.id]: '' }));
      toast.success('Comentario publicado');
      revalidator.revalidate();
    } catch (error) {
      toast.error(error.message || 'No se pudo comentar');
    } finally {
      setCommentingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          <Plus size={16} /> Crear post
        </button>
      </div>

      {!foros.length ? (
        <EmptyState title="Sin foros" subtitle="Crea el primer tema de discusión." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {foros.map((foro) => (
            <div key={foro.id} className="card">
              <div className="card-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <span className="badge badge-gray">{foro.categoria}</span>
                    <h3 style={{ fontWeight: 800, fontSize: 16, marginTop: 8 }}>{foro.titulo}</h3>
                    <p style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 4 }}>
                      {foro.autor || 'Campus TID'} · {foro.fecha}
                    </p>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleVote(foro)}>
                    <ThumbsUp size={14} /> {foro.votos}
                  </button>
                </div>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {foro.contenido && <p style={{ color: COLORS.textSecondary, lineHeight: 1.7 }}>{foro.contenido}</p>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: COLORS.textMuted, fontSize: 12 }}>
                  <MessageCircle size={15} /> {foro.respuestas} respuestas
                </div>

                {!!foro.comentarios?.length && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {foro.comentarios.map((comment) => (
                      <div key={comment.id} style={{ background: COLORS.surface2, borderRadius: 8, padding: 10 }}>
                        <strong style={{ fontSize: 12 }}>{comment.autor || 'Usuario'}</strong>
                        <p style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 4 }}>{comment.contenido}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="form-input"
                    value={comments[foro.id] || ''}
                    onChange={(event) => setComments((prev) => ({ ...prev, [foro.id]: event.target.value }))}
                    placeholder="Escribe una respuesta..."
                  />
                  <button className="btn btn-primary" disabled={commentingId === foro.id} onClick={() => handleComment(foro)}>
                    {commentingId === foro.id ? 'Enviando...' : 'Responder'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Crear post de foro"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" disabled={saving} onClick={handleCreate}>
              {saving ? 'Guardando...' : 'Publicar'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormField label="Título">
            <input className="form-input" value={form.titulo} onChange={(event) => setForm((prev) => ({ ...prev, titulo: event.target.value }))} />
          </FormField>
          <FormField label="Categoría">
            <input className="form-input" value={form.categoria} onChange={(event) => setForm((prev) => ({ ...prev, categoria: event.target.value }))} />
          </FormField>
          <FormField label="Contenido">
            <textarea className="form-input" rows={5} value={form.contenido} onChange={(event) => setForm((prev) => ({ ...prev, contenido: event.target.value }))} style={{ resize: 'vertical' }} />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}
