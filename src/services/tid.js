const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const TID_MOCK = {};

export const tidStorage = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem('tid_' + key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, val) {
    try {
      localStorage.setItem('tid_' + key, JSON.stringify(val));
    } catch {
      return;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem('tid_' + key);
    } catch {
      return;
    }
  },
};

const categoryColors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];

const buildUrl = (path, params) => {
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });
  return url.toString();
};

const request = async (path, { method = 'GET', params, body } = {}) => {
  const response = await fetch(buildUrl(path, params), {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return true;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const fieldErrors = data?.fieldErrors ? Object.values(data.fieldErrors).join(' ') : '';
    throw new Error([data?.message, fieldErrors].filter(Boolean).join(' ') || 'No se pudo completar la solicitud.');
  }

  return data;
};

const toDate = (value) => (value ? String(value).slice(0, 10) : new Date().toISOString().slice(0, 10));

const roleLabel = (role) =>
  ({
    ADMIN: 'Admin',
    INSTRUCTOR: 'Instructor',
    TEACHER: 'Instructor',
    PROFESSOR: 'Instructor',
    STUDENT: 'Estudiante',
  })[role] || role;

const roleValue = (role) =>
  ({
    Admin: 'ADMIN',
    Administrador: 'ADMIN',
    Instructor: 'INSTRUCTOR',
    TEACHER: 'INSTRUCTOR',
    PROFESSOR: 'INSTRUCTOR',
    Estudiante: 'STUDENT',
  })[role] || role;

const enrollmentStatusLabel = (status) =>
  ({
    INSCRITO: 'Activo',
    COMPLETADO: 'Completado',
    CANCELADO: 'Cancelado',
  })[status] || status;

const attendanceStatusLabel = (status) =>
  ({
    PRESENTE: 'Presente',
    AUSENTE: 'Ausente',
    TARDANZA: 'Tardanza',
  })[status] || status;

const mapUser = (user) => ({
  ...user,
  nombre: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
  rol: roleLabel(user.role),
  telefono: user.phone,
  documento: user.document,
  direccion: user.address,
  area: roleLabel(user.role),
});

const normalizeSession = (session) => {
  if (!session) return session;
  if (session.firstName) return mapUser(session);
  const [firstName = '', ...lastNameParts] = (session.nombre || '').split(' ');
  return mapUser({
    ...session,
    firstName,
    lastName: lastNameParts.join(' '),
    phone: session.telefono,
    role: roleValue(session.rol),
  });
};

const mapCategory = (category, index = 0) => ({
  id: category.id,
  nombre: category.name,
  name: category.name,
  color: categoryColors[index % categoryColors.length],
  totalCursos: category.courseCount || 0,
});

const parseDurationHours = (duration) => {
  const match = String(duration || '').match(/\d+/);
  return match ? Number(match[0]) : null;
};

const mapCourse = (course, enrollments = []) => ({
  id: course.id,
  titulo: course.titulo || course.title,
  title: course.title || course.titulo,
  descripcion: course.descripcion || course.description,
  description: course.description || course.descripcion,
  categoria_id: course.categoriaId || course.categoryId,
  categoryId: course.categoryId || course.categoriaId,
  categoryName: course.categoriaNombre || course.categoryName,
  instructor_id: course.instructorId || course.instructor_id,
  instructor: course.instructor || course.categoriaNombre || course.categoryName || 'Campus TID',
  duracion: course.duracion || course.duration || (course.startDate && course.endDate ? `${course.startDate} - ${course.endDate}` : 'Por definir'),
  durationHours: course.durationHours || course.duracionHoras || parseDurationHours(course.duracion || course.duration),
  nivel: course.nivel || course.level || (course.active ? 'Basico' : 'Inactivo'),
  inscritos: Number(course.inscritos ?? course.enrolledCount ?? enrollments.filter((enrollment) => enrollment.courseId === course.id && enrollment.status !== 'CANCELADO').length),
  max: course.max || course.cuposMaximos || course.capacity || 0,
  capacity: course.capacity || course.max || course.cuposMaximos,
  startDate: course.startDate,
  endDate: course.endDate,
  active: course.active,
  imagen: course.imagen || course.imageUrl || null,
});

const toNumberOrNull = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

const coursePayload = (data) => ({
  title: data.title || data.titulo,
  description: data.description || data.descripcion,
  categoryId: Number(data.categoryId || data.categoria_id),
  instructorId: toNumberOrNull(data.instructorId || data.instructor_id),
  durationHours: toNumberOrNull(data.durationHours || data.duracionHoras || data.duracion),
  capacity: data.capacity ?? data.max ?? null,
  active: data.active ?? data.nivel !== 'Inactivo',
});

const userUpdatePayload = (data) => ({
  firstName: data.firstName,
  lastName: data.lastName,
  phone: data.phone ?? data.telefono,
  document: data.document ?? data.documento,
  address: data.address ?? data.direccion,
  role: roleValue(data.role ?? data.rol),
});

const mapEnrollment = (enrollment) => ({
  id: enrollment.id,
  usuario_id: enrollment.userId,
  userId: enrollment.userId,
  curso_id: enrollment.courseId,
  courseId: enrollment.courseId,
  cursoTitulo: enrollment.courseTitle,
  fecha: toDate(enrollment.enrolledAt),
  estado: enrollmentStatusLabel(enrollment.status),
  status: enrollment.status,
  progreso: enrollment.status === 'COMPLETADO' ? 100 : 0,
});

const mapGrade = (grade) => ({
  id: grade.id,
  usuario_id: grade.userId,
  userId: grade.userId,
  curso_id: grade.courseId,
  courseId: grade.courseId,
  actividad: grade.note || grade.courseTitle || 'Evaluación',
  nota: Math.round(grade.score || 0),
  fecha: toDate(grade.date),
  tipo: 'Evaluación',
});

const mapAttendance = (attendance) => ({
  id: attendance.id,
  usuario_id: attendance.userId,
  userId: attendance.userId,
  curso_id: attendance.courseId,
  courseId: attendance.courseId,
  fecha: toDate(attendance.date),
  estado: attendanceStatusLabel(attendance.status),
  status: attendance.status,
  sesion: attendance.courseTitle || 'Sesión',
});

const mapAnnouncement = (announcement) => ({
  id: announcement.id,
  titulo: announcement.title,
  contenido: announcement.content,
  fecha: toDate(announcement.date || announcement.createdAt),
  autor: 'Campus TID',
  prioridad: 'Media',
});

const mapForum = (forum) => ({
  id: forum.id,
  titulo: forum.title,
  title: forum.title,
  categoria: forum.category,
  category: forum.category,
  contenido: forum.content || '',
  authorId: forum.authorId,
  autor: forum.authorName,
  votos: forum.votes || 0,
  respuestas: forum.repliesCount || 0,
  fecha: toDate(forum.createdAt),
  comentarios: (forum.comments || []).map((comment) => ({
    id: comment.id,
    authorId: comment.authorId,
    autor: comment.authorName,
    contenido: comment.content,
    fecha: toDate(comment.createdAt),
  })),
});

const mapDirectMessage = (message) => ({
  id: message.id,
  senderId: message.senderId,
  receiverId: message.receiverId,
  contenido: message.content,
  content: message.content,
  fecha: toDate(message.sentAt),
  sentAt: message.sentAt,
});

export const tidApi = {
  API_BASE,

  async login(email, password) {
    const data = await request('/auth/login', { params: { email, password } });
    const session = mapUser(data.user);
    tidStorage.set('session', session);
    return session;
  },

  async registro(data) {
    const user = await request('/users', { method: 'POST', body: data });
    return mapUser(user);
  },

  async recuperar(email) {
    return request('/auth/recover', { method: 'POST', body: { email } });
  },

  async resetPasswordByEmail(email, newPassword, confirmNewPassword) {
    return request('/auth/reset-password', {
      method: 'POST',
      body: { email, newPassword, confirmNewPassword },
    });
  },

  getSession() {
    return normalizeSession(tidStorage.get('session', null));
  },

  logout() {
    tidStorage.remove('session');
  },

  async getCursos() {
    const [courses, enrollments] = await Promise.all([request('/courses'), request('/enrollments').catch(() => [])]);
    return courses.map((course) => mapCourse(course, enrollments));
  },

  async getCurso(id) {
    const [course, enrollments] = await Promise.all([
      request(`/courses/${id}`),
      request('/enrollments').catch(() => []),
    ]);
    return mapCourse(course, enrollments);
  },

  async createCurso(data) {
    return mapCourse(await request('/courses', { method: 'POST', body: coursePayload(data) }));
  },

  async updateCurso(id, data) {
    return mapCourse(await request(`/courses/${id}`, { method: 'PUT', body: coursePayload(data) }));
  },

  async deleteCurso(id) {
    return request(`/courses/${id}`, { method: 'DELETE' });
  },

  async getCategorias() {
    const categories = await request('/categories', { params: { withCounts: true } });
    return categories.map(mapCategory);
  },

  async getInscripciones(usuario_id) {
    const enrollments = await request('/enrollments', { params: { userId: usuario_id } });
    return enrollments.map(mapEnrollment);
  },

  async createInscripcion(data) {
    const enrollment = await request('/enrollments', {
      method: 'POST',
      body: { userId: data.userId || data.usuario_id, courseId: data.courseId || data.curso_id },
    });
    return mapEnrollment(enrollment);
  },

  async deleteInscripcion(id) {
    return request(`/enrollments/${id}`, { method: 'DELETE' });
  },

  async getCalificaciones(usuario_id) {
    const grades = await request('/grades', { params: { userId: usuario_id } });
    return grades.map(mapGrade);
  },

  async getAsistencias(usuario_id) {
    const attendance = await request('/attendance', { params: { userId: usuario_id } });
    return attendance.map(mapAttendance);
  },

  async getPerfil(id) {
    return mapUser(await request(`/users/${id}`));
  },

  async getUsuarios() {
    const users = await request('/users');
    return users.map(mapUser);
  },

  async getForos() {
    const forums = await request('/forums');
    return forums.map(mapForum);
  },

  async createForo(data) {
    const forum = await request('/forums', {
      method: 'POST',
      body: {
        title: data.title || data.titulo,
        category: data.category || data.categoria,
        content: data.content || data.contenido,
        authorId: toNumberOrNull(data.authorId || data.autorId),
      },
    });
    return mapForum(forum);
  },

  async votarForo(id) {
    return mapForum(await request(`/forums/${id}/vote`, { method: 'POST' }));
  },

  async comentarForo(id, data) {
    const forum = await request(`/forums/${id}/comments`, {
      method: 'POST',
      body: {
        authorId: toNumberOrNull(data.authorId || data.autorId),
        content: data.content || data.contenido,
      },
    });
    return mapForum(forum);
  },

  async getContactos(userId) {
    const users = await request('/direct-messages/contacts', { params: { userId } });
    return users.map(mapUser);
  },

  async getConversacion(userId, contactId) {
    const messages = await request('/direct-messages', { params: { userId, contactId } });
    return messages.map(mapDirectMessage);
  },

  async enviarMensaje(data) {
    const message = await request('/direct-messages', {
      method: 'POST',
      body: {
        senderId: toNumberOrNull(data.senderId || data.emisorId),
        receiverId: toNumberOrNull(data.receiverId || data.receptorId),
        content: data.content || data.contenido,
      },
    });
    return mapDirectMessage(message);
  },

  async updatePerfil(id, data) {
    const user = mapUser(await request(`/users/${id}`, { method: 'PATCH', body: userUpdatePayload(data) }));
    const session = tidStorage.get('session', null);
    if (session && session.id === id) tidStorage.set('session', user);
    return user;
  },

  async updatePassword(id, actual, nueva) {
    await request(`/users/${id}/change-password`, {
      method: 'POST',
      body: { currentPassword: actual, newPassword: nueva, confirmNewPassword: nueva },
    });
    return true;
  },

  async getAnuncios() {
    const announcements = await request('/announcements');
    return announcements.map(mapAnnouncement);
  },

  async createAnuncio(data) {
    const announcement = await request('/announcements', {
      method: 'POST',
      body: { title: data.titulo, content: data.contenido, date: data.fecha },
    });
    return mapAnnouncement(announcement);
  },

  async deleteAnuncio(id) {
    return request(`/announcements/${id}`, { method: 'DELETE' });
  },

  async getDashboardMetrics() {
    const [metrics, cursos, inscripciones, categorias] = await Promise.all([
      request('/dashboard/metrics'),
      tidApi.getCursos(),
      request('/enrollments').then((items) => items.map(mapEnrollment)),
      tidApi.getCategorias(),
    ]);

    return {
      totalUsuarios: metrics.totalUsers,
      totalCursos: metrics.totalCourses,
      totalInscripciones: metrics.totalEnrollments,
      inscripcionesActivas: inscripciones.filter((i) => i.status === 'INSCRITO').length,
      inscripcionesCompletadas: inscripciones.filter((i) => i.status === 'COMPLETADO').length,
      categorias: categorias.map((cat) => ({
        ...cat,
        totalCursos: cursos.filter((c) => c.categoria_id === cat.id).length,
        totalInscritos: inscripciones.filter((i) => cursos.find((c) => c.id === i.curso_id && c.categoria_id === cat.id)).length,
      })),
      cursosMasInscritos: cursos.map((curso) => ({
        ...curso,
        inscritos: inscripciones.filter((i) => i.curso_id === curso.id).length,
      })).sort((a, b) => b.inscritos - a.inscritos).slice(0, 5),
    };
  },
};
