import { EmptyState } from '../../../components/components.jsx';
import { COLORS } from '../../../components/theme.js';

export default function SeccionMensajesDirectos({ contactos = [] }) {
  if (!contactos.length) {
    return <EmptyState title="Sin contactos" subtitle="No hay otros usuarios registrados para mostrar." />;
  }

  return (
    <div className="grid-2">
      {contactos.map((contacto) => (
        <div key={contacto.id} className="card">
          <div className="card-body">
            <h3 style={{ fontWeight: 800, fontSize: 15 }}>{contacto.nombre}</h3>
            <p style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 4 }}>{contacto.email}</p>
            <span className="badge badge-gray" style={{ marginTop: 10 }}>{contacto.rol}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
