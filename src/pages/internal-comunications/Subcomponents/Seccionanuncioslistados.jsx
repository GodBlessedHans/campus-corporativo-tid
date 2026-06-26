import React from 'react';
import { EmptyState, FormField, Modal } from '../../../components/components.jsx';
import { COLORS } from '../../../components/theme.js';
import { confirm, toast } from '../../../helpers/alerts.js';
import { tidApi } from '../../../services/tid.js';
import { Pencil, Plus, Trash2 } from 'lucide-react';

export default function SeccionAnunciosListados({ anuncios = [], session, revalidator }) {
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({ titulo: '', contenido: '', prioridad: 'Media' });
  const isAdmin = session?.rol === 'Admin';
  const isStudent = session?.rol === 'Estudiante';
  const isEditing = Boolean(form.id);

  const canManage = (anuncio) => isAdmin || Number(anuncio.authorId) === Number(session?.id);

  const openCreate = () => {
    setForm({ titulo: '', contenido: '', prioridad: 'Media' });
    setOpen(true);
  };

  const openEdit = (anuncio) => {
    setForm({ ...anuncio, fecha: anuncio.fecha || new Date().toISOString().slice(0, 10) });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.titulo.trim() || !form.contenido.trim()) {
      toast.warning('Completa título y contenido', 'Campos requeridos');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        titulo: form.titulo.trim(),
        contenido: form.contenido.trim(),
        prioridad: form.prioridad,
        fecha: form.fecha || new Date().toISOString().slice(0, 10),
        autorId: form.authorId || session.id,
        requesterId: session.id,
        requesterRole: session.rol,
      };

      if (isEditing) await tidApi.updateAnuncio(form.id, payload);
      else await tidApi.createAnuncio(payload);

      setOpen(false);
      setForm({ titulo: '', contenido: '', prioridad: 'Media' });
      toast.success(isEditing ? 'Anuncio actualizado' : 'Anuncio creado');
      revalidator.revalidate();
    } catch (error) {
      toast.error(error.message || 'No se pudo guardar el anuncio');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (anuncio) => {
    const ok = await confirm({
      title: 'Eliminar anuncio',
      message: anuncio.titulo,
      okText: 'Eliminar',
      cancelText: 'Cancelar',
      color: COLORS.danger,
    });
    if (!ok) return;

    try {
      await tidApi.deleteAnuncio(anuncio.id, { requesterId: session.id, requesterRole: session.rol });
      toast.success('Anuncio eliminado');
      revalidator.revalidate();
    } catch (error) {
      toast.error(error.message || 'No se pudo eliminar el anuncio');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        {!isStudent && (
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Nuevo anuncio
          </button>
        )}
      </div>

      {!anuncios.length ? (
        <EmptyState title="Sin anuncios" subtitle="Aún no hay comunicaciones publicadas." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {anuncios.map((anuncio) => (
            <div key={anuncio.id} className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: 15 }}>{anuncio.titulo}</h3>
                  <div style={{ marginTop: 6, fontSize: 12, color: COLORS.textMuted, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span>{anuncio.fecha}</span>
                    <span>{anuncio.autor}</span>
                    <span className={`badge ${anuncio.prioridad === 'Alta' ? 'badge-red' : anuncio.prioridad === 'Media' ? 'badge-yellow' : 'badge-gray'}`}>
                      {anuncio.prioridad}
                    </span>
                  </div>
                </div>
                {canManage(anuncio) && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(anuncio)} style={{ padding: '6px 10px' }}>
                      <Pencil size={14} />
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(anuncio)} style={{ padding: '6px 10px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              <div className="card-body">
                <p style={{ color: COLORS.textSecondary, lineHeight: 1.7 }}>{anuncio.contenido}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={isEditing ? 'Editar anuncio' : 'Nuevo anuncio'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Publicar'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormField label="Título">
            <input className="form-input" value={form.titulo} onChange={(event) => setForm((prev) => ({ ...prev, titulo: event.target.value }))} />
          </FormField>
          <FormField label="Prioridad">
            <select className="form-input" value={form.prioridad} onChange={(event) => setForm((prev) => ({ ...prev, prioridad: event.target.value }))}>
              {['Baja', 'Media', 'Alta'].map((prioridad) => (
                <option key={prioridad} value={prioridad}>{prioridad}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Contenido">
            <textarea className="form-input" rows={5} value={form.contenido} onChange={(event) => setForm((prev) => ({ ...prev, contenido: event.target.value }))} style={{ resize: 'vertical' }} />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}
