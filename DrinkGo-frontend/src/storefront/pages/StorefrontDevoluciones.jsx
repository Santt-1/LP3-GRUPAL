import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RotateCcw, Loader2, PackageX } from 'lucide-react';
import { useStorefrontAuthStore } from '../stores/storefrontAuthStore';
import { storefrontService } from '../services/storefrontService';

const ESTADO_COLORS = {
  solicitada: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  aprobada: 'bg-blue-100 text-blue-700 border-blue-300',
  rechazada: 'bg-red-100 text-red-700 border-red-300',
  completada: 'bg-green-100 text-green-700 border-green-300',
};

const ESTADO_LABELS = {
  solicitada: 'Solicitada',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  completada: 'Completada',
};

const TIPO_LABELS = {
  producto_defectuoso: 'Producto Defectuoso',
  producto_incorrecto: 'Producto Incorrecto',
  cambio_talla_color: 'Cambio de Talla/Color',
  insatisfaccion: 'Insatisfacción',
  otro: 'Otro',
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCurrency = (amount) => {
  if (amount == null) return '-';
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
};

export const StorefrontDevoluciones = () => {
  const { slug } = useOutletContext();
  const navigate = useNavigate();
  const { isAuthenticated } = useStorefrontAuthStore();

  if (!isAuthenticated()) {
    navigate(`/tienda/${slug}/login`, { replace: true });
    return null;
  }

  return <DevolucionesContent slug={slug} />;
};

const DevolucionesContent = ({ slug }) => {
  const { data: devoluciones = [], isLoading, isError } = useQuery({
    queryKey: ['storefront-devoluciones', slug],
    queryFn: () => storefrontService.getMisDevoluciones(slug),
    staleTime: 1000 * 60 * 2,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 size={32} className="animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Devoluciones</h1>
        <p className="text-gray-500 text-sm mt-1">
          Historial de solicitudes de devolución
        </p>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          No se pudieron cargar las devoluciones. Intente más tarde.
        </div>
      )}

      {devoluciones.length === 0 && !isError ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PackageX size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Sin devoluciones</h3>
          <p className="text-gray-500 text-sm">No tienes solicitudes de devolución registradas.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {devoluciones.map((devolucion) => {
            const estado = devolucion.estado?.toString().toLowerCase();
            const colorClass = ESTADO_COLORS[estado] || 'bg-gray-100 text-gray-700 border-gray-300';
            const estadoLabel = ESTADO_LABELS[estado] || devolucion.estado || '-';
            const tipoLabel = TIPO_LABELS[devolucion.tipoDevolucion] || devolucion.tipoDevolucion || '-';

            return (
              <div
                key={devolucion.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                      <RotateCcw size={18} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {devolucion.numeroDevolucion || `#DEV-${devolucion.id}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(devolucion.solicitadoEn)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
                  >
                    {estadoLabel}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Tipo de Devolución</p>
                    <p className="text-sm font-medium text-gray-700">{tipoLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Categoría</p>
                    <p className="text-sm font-medium text-gray-700">
                      {devolucion.categoriaMotivo || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Total</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(devolucion.total)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Método Reembolso</p>
                    <p className="text-sm font-medium text-gray-700">
                      {devolucion.metodoReembolso || '-'}
                    </p>
                  </div>
                </div>

                {devolucion.motivoCliente && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">Motivo</p>
                    <p className="text-sm text-gray-600">{devolucion.motivoCliente}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
