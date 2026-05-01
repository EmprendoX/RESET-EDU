/**
 * Títulos de sección del panel admin según la ruta (solo UI).
 */
export function getAdminSectionTitle(pathname: string): string {
  if (pathname === '/admin' || pathname === '/admin/') {
    return 'Resumen';
  }
  if (pathname === '/admin/cursos') {
    return 'Cursos';
  }
  if (pathname === '/admin/cursos/nuevo') {
    return 'Nuevo curso';
  }
  if (pathname.includes('/lecciones/')) {
    return 'Editor de lección';
  }
  if (pathname.includes('/builder')) {
    return 'Constructor';
  }
  if (/^\/admin\/cursos\/[^/]+$/.test(pathname)) {
    return 'Datos del curso';
  }
  if (pathname === '/admin/media') {
    return 'Biblioteca de archivos';
  }
  if (pathname === '/admin/usuarios') {
    return 'Usuarios';
  }
  if (pathname === '/admin/reportes') {
    return 'Reportes';
  }
  if (pathname === '/admin/logs') {
    return 'Logs';
  }
  return 'Administración';
}
