import React from 'react';
import { EmptyState, Spinner } from '../../../components/components.jsx';
import { COLORS } from '../../../components/theme.js';
import { toast } from '../../../helpers/alerts.js';
import { tidApi } from '../../../services/tid.js';
import { Send } from 'lucide-react';

export default function SeccionMensajesDirectos({ session, contactos = [] }) {
  const [selectedContactId, setSelectedContactId] = React.useState(contactos[0]?.id || null);
  const [messages, setMessages] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [content, setContent] = React.useState('');
  const selectedContact = contactos.find((contacto) => Number(contacto.id) === Number(selectedContactId)) || contactos[0] || null;

  React.useEffect(() => {
    let active = true;

    async function loadConversation() {
      if (!selectedContact) {
        setMessages([]);
        return;
      }
      setLoading(true);
      try {
        const conversation = await tidApi.getConversacion(session.id, selectedContact.id);
        if (active) setMessages(conversation);
      } catch (error) {
        toast.error(error.message || 'No se pudo cargar la conversación');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadConversation();
    return () => {
      active = false;
    };
  }, [selectedContact, session.id]);

  const handleSend = async () => {
    if (!selectedContact || !content.trim()) return;

      setSending(true);
    try {
      const message = await tidApi.enviarMensaje({
        senderId: Number(session.id),
        receiverId: Number(selectedContact.id),
        content: content.trim(),
      });
      setMessages((prev) => [...prev, message]);
      setContent('');
    } catch (error) {
      toast.error(error.message || 'No se pudo enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  if (!contactos.length) {
    return <EmptyState title="Sin contactos" subtitle="No hay otros usuarios registrados para mostrar." />;
  }

  return (
    <div className="grid-2" style={{ alignItems: 'stretch' }}>
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontWeight: 700, fontSize: 15 }}>Contactos</h3>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {contactos.map((contacto) => (
            <button
              key={contacto.id}
              className={`btn ${selectedContact?.id === contacto.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedContactId(contacto.id)}
              style={{ justifyContent: 'flex-start' }}
            >
              {contacto.nombre} · {contacto.rol}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 style={{ fontWeight: 700, fontSize: 15 }}>{selectedContact ? `Chat con ${selectedContact.nombre}` : 'Selecciona un contacto'}</h3>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 360 }}>
          {loading ? (
            <Spinner text="Cargando conversación..." />
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {!messages.length ? (
                <EmptyState title="Sin mensajes" subtitle="Inicia la conversación." />
              ) : (
                messages.map((message) => {
                  const mine = Number(message.senderId) === Number(session.id);
                  return (
                    <div
                      key={message.id}
                      style={{
                        alignSelf: mine ? 'flex-end' : 'flex-start',
                        background: mine ? COLORS.accent : COLORS.surface2,
                        color: mine ? '#fff' : COLORS.textSecondary,
                        borderRadius: 12,
                        padding: '9px 12px',
                        maxWidth: '78%',
                      }}
                    >
                      <p style={{ fontSize: 13 }}>{message.contenido}</p>
                      <span style={{ display: 'block', fontSize: 10, opacity: 0.75, marginTop: 4 }}>{message.fecha}</span>
                    </div>
                  );
                })
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="form-input"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Escribe un mensaje..."
              disabled={!selectedContact || sending}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleSend();
                }
              }}
            />
            <button className="btn btn-primary" onClick={handleSend} disabled={!selectedContact || sending || !content.trim()}>
              <Send size={16} /> Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
