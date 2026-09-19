export const environment = {
  production: true,
  // Vacío = rutas relativas (/api/..., /uploads/..., /oauth2/...): el frontend llama al mismo dominio desde el que
  // se sirve y el nginx del servidor reparte cada ruta. Así el mismo build vale para cualquier dominio.
  apiUrl: ''
};
