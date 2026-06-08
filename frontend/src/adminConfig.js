// Solo estos correos pueden entrar al Panel Admin.
// Agrega aquí tu correo (con el que inicias sesión) para ser el único administrador.
export const ADMIN_EMAILS = [
  'rimapaivan@gmail.com',
];

export const esAdmin = (email) =>
  !!email && ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase());
