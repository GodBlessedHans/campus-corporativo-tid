import { EmptyState } from '../../../components/components.jsx';

export default function SeccionForos({ foros = [] }) {
  if (!foros.length) {
    return <EmptyState title="Sin foros" subtitle="El backend actual todavía no expone foros de discusión." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {foros.map((foro) => (
        <div key={foro.id} className="card">
          <div className="card-header">
            <h3 style={{ fontWeight: 700 }}>{foro.titulo}</h3>
          </div>
          <div className="card-body">{foro.contenido}</div>
        </div>
      ))}
    </div>
  );
}
