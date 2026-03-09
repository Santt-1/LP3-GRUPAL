/**
 * Reportes.jsx
 * ────────────
 * Layout contenedor del módulo Reportes.
 * Las sub-páginas se renderizan vía <Outlet /> (react-router nested routes).
 * negocioId y sedeId se inyectan como contexto a cada sub-ruta.
 */
import { Outlet } from 'react-router-dom';
import { useAdminAuthStore } from '@/stores/adminAuthStore';

export const Reportes = () => {
  const negocio = useAdminAuthStore((s) => s.negocio);
  const sede = useAdminAuthStore((s) => s.sede);
  const negocioId = negocio?.id;
  const sedeId = sede?.id;

  return (
    <div className="space-y-6">
      <Outlet context={{ negocioId, sedeId }} />
    </div>
  );
};
