import React from 'react';
import { useNavigate, useRouteLoaderData } from 'react-router-dom';
import { EmptyState, FormField, Modal, Spinner } from '../../components/components.jsx';
import { COLORS } from '../../components/theme.js';
import { toast } from '../../helpers/alerts.js';
import { tidApi } from '../../services/tid.js';
import { ArrowLeft, BriefcaseBusiness, CreditCard, Edit3, GraduationCap, Lock, Mail, Phone, User } from 'lucide-react';

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const splitName = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts.shift() || '',
    lastName: parts.join(' '),
  };
};

const profileToForm = (profile = {}) => {
  const names = splitName(profile.nombre);

  return {
    firstName: profile.firstName || names.firstName || '',
    lastName: profile.lastName || names.lastName || '',
    phone: profile.telefono || '',
    document: profile.documento || '',
    address: profile.direccion || '',
    role: profile.rol || 'Estudiante',
  };
};

function DetailItem({ icon, label, value }) {
  return (
    <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 16, background: COLORS.surface }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, color: COLORS.textMuted }}>
        <span style={{ display: 'inline-flex' }}>{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.textPrimary, overflowWrap: 'anywhere' }}>{value || 'Sin registrar'}</div>
    </div>
  );
}

export default function ContributorProfileDetailsPage() {
  const { session } = useRouteLoaderData('root');
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [savingPassword, setSavingPassword] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [passwordOpen, setPasswordOpen] = React.useState(false);
  const [perfil, setPerfil] = React.useState(session);
  const [form, setForm] = React.useState(profileToForm(session));
  const [passwordForm, setPasswordForm] = React.useState({ actual: '', nueva: '', confirmar: '' });

  React.useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      try {
        const perfilActual = await tidApi.getPerfil(session.id);
        if (active) {
          setPerfil(perfilActual);
          setForm(profileToForm(perfilActual));
        }
      } catch (error) {
        toast.error(error.message || 'No fue posible cargar los datos del colaborador');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, [session.id]);

  if (!session) {
    return <EmptyState icon={<User size={44} color={COLORS.textMuted} />} title="Acceso requerido" subtitle="Inicia sesion para ver tus datos" />;
  }

  if (loading) return <Spinner text="Cargando datos del colaborador..." />;

  const handleOpenEdit = () => {
    setForm(profileToForm(perfil));
    setEditOpen(true);
  };

  const handleOpenPassword = () => {
    setPasswordForm({ actual: '', nueva: '', confirmar: '' });
    setPasswordOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.warning('Completa nombres y apellidos.', 'Campos requeridos');
      return;
    }

    setSaving(true);
    try {
      const updated = await tidApi.updatePerfil(perfil.id, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        telefono: form.phone.trim(),
        documento: form.document.trim(),
        direccion: form.address.trim(),
        rol: form.role,
      });
      setPerfil(updated);
      setForm(profileToForm(updated));
      setEditOpen(false);
      toast.success('Datos del colaborador actualizados');
    } catch (error) {
      toast.error(error.message || 'No se pudieron actualizar los datos');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (!passwordForm.actual || !passwordForm.nueva || !passwordForm.confirmar) {
      toast.warning('Completa todos los campos de contrasena.', 'Campos requeridos');
      return;
    }
    if (passwordForm.nueva.length < 6) {
      toast.warning('La nueva contrasena debe tener minimo 6 caracteres.');
      return;
    }
    if (passwordForm.nueva !== passwordForm.confirmar) {
      toast.warning('La confirmacion no coincide con la nueva contrasena.');
      return;
    }

    setSavingPassword(true);
    try {
      await tidApi.updatePassword(perfil.id, passwordForm.actual, passwordForm.nueva);
      setPasswordOpen(false);
      toast.success('Contrasena actualizada');
    } catch (error) {
      toast.error(error.message || 'No se pudo actualizar la contrasena');
    } finally {
      setSavingPassword(false);
    }
  };

  const personalData = [
    { label: 'Nombres', value: perfil.firstName || splitName(perfil.nombre).firstName, icon: <User size={17} /> },
    { label: 'Apellidos', value: perfil.lastName || splitName(perfil.nombre).lastName, icon: <User size={17} /> },
    { label: 'Correo', value: perfil.email, icon: <Mail size={17} /> },
    { label: 'Telefono', value: perfil.telefono, icon: <Phone size={17} /> },
    { label: 'Documento', value: perfil.documento, icon: <CreditCard size={17} /> },
    { label: 'Nivel academico', value: perfil.direccion, icon: <GraduationCap size={17} /> },
    { label: 'Rol', value: perfil.rol, icon: <BriefcaseBusiness size={17} /> },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div className="page-header" style={{ margin: 0 }}>
          <h2>Datos del colaborador</h2>
          <p>Informacion registrada en el backend de Campus TID</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/contributor-profile')}>
          <ArrowLeft size={16} /> Volver al perfil
        </button>
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${COLORS.accent}, #0f766e)`,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'DM Sans',
                fontSize: 24,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {getInitials(perfil.nombre)}
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2, overflowWrap: 'anywhere' }}>{perfil.nombre}</h3>
              <p style={{ color: COLORS.textSecondary, marginTop: 4 }}>
                {perfil.rol || 'Estudiante'}
              </p>
            </div>
          </div>

          <button className="btn btn-primary" type="button" onClick={handleOpenPassword}>
            <Lock size={16} /> Modificar contrasena
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <h3 style={{ fontWeight: 700, fontSize: 15 }}>Informacion personal</h3>
          <button className="btn btn-secondary btn-sm" onClick={handleOpenEdit}>
            <Edit3 size={14} /> Editar datos
          </button>
        </div>
        <div className="card-body">
          <div className="grid-2">
            {personalData.map((item) => (
              <DetailItem key={item.label} icon={item.icon} label={item.label} value={item.value} />
            ))}
          </div>
        </div>
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Editar datos del colaborador"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setEditOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSaveProfile} disabled={saving}>
              {saving ? (
                <>
                  <div className="spinner" style={{ width: 14, height: 14 }}></div> Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="grid-2">
            <FormField label="Nombres">
              <input className="form-input" value={form.firstName} onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))} />
            </FormField>
            <FormField label="Apellidos">
              <input className="form-input" value={form.lastName} onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))} />
            </FormField>
          </div>

          <FormField label="Correo">
            <input className="form-input" type="email" value={perfil.email || ''} disabled />
          </FormField>

          <div className="grid-2">
            <FormField label="Telefono">
              <input className="form-input" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
            </FormField>
            <FormField label="Documento">
              <input className="form-input" value={form.document} onChange={(e) => setForm((prev) => ({ ...prev, document: e.target.value }))} />
            </FormField>
          </div>

          <FormField label="Nivel academico">
            <input className="form-input" value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
          </FormField>

          <FormField label="Rol">
            <select className="form-input" value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}>
              <option value="STUDENT">Estudiante</option>
              <option value="INSTRUCTOR">Instructor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </FormField>
        </div>
      </Modal>

      <Modal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        title="Modificar contrasena"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setPasswordOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSavePassword} disabled={savingPassword}>
              {savingPassword ? (
                <>
                  <div className="spinner" style={{ width: 14, height: 14 }}></div> Guardando...
                </>
              ) : (
                'Actualizar contrasena'
              )}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormField label="Contrasena actual">
            <input
              className="form-input"
              type="password"
              value={passwordForm.actual}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, actual: e.target.value }))}
            />
          </FormField>
          <FormField label="Nueva contrasena">
            <input
              className="form-input"
              type="password"
              value={passwordForm.nueva}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, nueva: e.target.value }))}
            />
          </FormField>
          <FormField label="Confirmar nueva contrasena">
            <input
              className="form-input"
              type="password"
              value={passwordForm.confirmar}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmar: e.target.value }))}
            />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}
