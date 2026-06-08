// El dueño siempre es administrador (acceso instantáneo, sin depender del servidor).
export const SUPER_ADMIN = 'rimapaivan@gmail.com';

// Los demás administradores se gestionan desde el Panel Admin (se guardan en la base de datos).
export const esSuperAdmin = (email) =>
  !!email && email.toLowerCase() === SUPER_ADMIN.toLowerCase();
