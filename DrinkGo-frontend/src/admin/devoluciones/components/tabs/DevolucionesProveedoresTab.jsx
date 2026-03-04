/**
 * DevolucionesProveedoresTab.jsx
 * ──────────────────────────────
 * Pestaña de devoluciones a proveedores: listado, registro y detalle.
 * Muestra las devoluciones que se realizan hacia proveedores
 * (productos recibidos con defectos, errores, etc.)
 */
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Search,
  Plus,
  Eye,
  Trash2,
  RotateCcw,
  Loader2,
  AlertCircle,
  PackageX,
  Truck,
} from 'lucide-react';
import { useDevoluciones } from '../../hooks/useDevoluciones';
import { devolucionSchema } from '../../validations/devolucionesSchemas';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { formatDateTime, formatCurrency } from '@/shared/utils/formatters';
import { Card } from '@/admin/components/ui/Card';
import { Table } from '@/admin/components/ui/Table';
import { Badge } from '@/admin/components/ui/Badge';
import { StatCard } from '@/admin/components/ui/StatCard';
import { Modal } from '@/admin/components/ui/Modal';
import { Select } from '@/admin/components/ui/Select';
import { Textarea } from '@/admin/components/ui/Textarea';
import { Button } from '@/admin/components/ui/Button';

/* ─── Opciones de selects ─── */
const TIPO_DEVOLUCION_OPTIONS = [
  { value: 'total', label: 'Total' },
  { value: 'parcial', label: 'Parcial' },
];

const CATEGORIA_MOTIVO_OPTIONS = [
  { value: 'defectuoso', label: 'Producto defectuoso' },
  { value: 'articulo_incorrecto', label: 'Artículo incorrecto' },
  { value: 'vencido', label: 'Producto vencido' },
  { value: 'danado', label: 'Producto dañado en transporte' },
  { value: 'otro', label: 'Otro' },
];

const METODO_REEMBOLSO_OPTIONS = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'pago_original', label: 'Método de pago original' },
  { value: 'credito_tienda', label: 'Crédito / Nota de crédito' },
  { value: 'transferencia_bancaria', label: 'Transferencia bancaria' },
];

const ESTADO_COLORS = {
  solicitada: 'warning',
  aprobada: 'info',
  procesando: 'info',
  completada: 'success',
  rechazada: 'error',
};

const ESTADO_LABELS = {
  solicitada: 'Solicitada',
  aprobada: 'Aprobada',
  procesando: 'Procesando',
  completada: 'Completada',
  rechazada: 'Rechazada',
};

const MOTIVO_LABELS = {
  defectuoso: 'Producto defectuoso',
  articulo_incorrecto: 'Artículo incorrecto',
  cambio_cliente: 'Cambio de cliente',
  vencido: 'Producto vencido',
  danado: 'Producto dañado',
  otro: 'Otro',
};

export const DevolucionesProveedoresTab = ({ negocioId }) => {
  /* ─── State ─── */
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [filterEstado, setFilterEstado] = useState('todos');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  /* ─── Data ─── */
  const {
    devoluciones,
    isLoading,
    isError,
    createDevolucion,
    isCreating,
    deleteDevolucion,
    isDeleting,
  } = useDevoluciones(negocioId, 'proveedores');

  /* ─── Form ─── */
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(devolucionSchema),
    defaultValues: {
      tipoDevolucion: 'parcial',
      categoriaMotivo: '',
      detalleMotivo: '',
      metodoReembolso: 'pago_original',
      notas: '',
    },
  });

  /* ─── Filtrado ─── */
  const filtered = useMemo(() => {
    let result = devoluciones;

    if (filterEstado !== 'todos') {
      result = result.filter((d) => d.estado === filterEstado);
    }

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (d) =>
          (d.numeroDevolucion || '').toLowerCase().includes(q) ||
          (d.detalleMotivo || '').toLowerCase().includes(q) ||
          (d.categoriaMotivo || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [devoluciones, filterEstado, debouncedSearch]);

  /* ─── Stats ─── */
  const stats = useMemo(() => {
    const total = devoluciones.length;
    const solicitadas = devoluciones.filter((d) => d.estado === 'solicitada').length;
    const completadas = devoluciones.filter((d) => d.estado === 'completada').length;
    const rechazadas = devoluciones.filter((d) => d.estado === 'rechazada').length;
    return { total, solicitadas, completadas, rechazadas };
  }, [devoluciones]);

  /* ─── Handlers ─── */
  const handleOpenCreate = () => {
    reset({
      tipoDevolucion: 'parcial',
      categoriaMotivo: '',
      detalleMotivo: '',
      metodoReembolso: 'pago_original',
      notas: '',
    });
    setIsFormOpen(true);
  };

  const handleCreate = async (formData) => {
    await createDevolucion({
      negocio: { id: negocioId },
      tipoDevolucion: formData.tipoDevolucion,
      categoriaMotivo: formData.categoriaMotivo,
      detalleMotivo: formData.detalleMotivo,
      metodoReembolso: formData.metodoReembolso,
      notas: formData.notas || null,
      estado: 'solicitada',
      subtotal: 0,
      montoImpuesto: 0,
      total: 0,
    });
    setIsFormOpen(false);
  };

  const handleView = (item) => {
    setSelected(item);
    setIsDetailOpen(true);
  };

  const handleDeleteConfirm = (item) => {
    setSelected(item);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (selected) {
      await deleteDevolucion(selected.id);
      setIsDeleteOpen(false);
      setSelected(null);
    }
  };

  /* ─── Columnas de la tabla ─── */
  const columns = [
    {
      key: 'index',
      title: '#',
      width: '50px',
      render: (_, __, index) => index + 1,
    },
    {
      key: 'numeroDevolucion',
      title: 'N° Devolución',
      dataIndex: 'numeroDevolucion',
      render: (val) => val || '—',
    },
    {
      key: 'tipoDevolucion',
      title: 'Tipo',
      dataIndex: 'tipoDevolucion',
      render: (val) => (
        <Badge variant={val === 'total' ? 'error' : 'warning'}>
          {val === 'total' ? 'Total' : 'Parcial'}
        </Badge>
      ),
    },
    {
      key: 'categoriaMotivo',
      title: 'Motivo',
      dataIndex: 'categoriaMotivo',
      render: (val) => MOTIVO_LABELS[val] || val || '—',
    },
    {
      key: 'total',
      title: 'Monto',
      dataIndex: 'total',
      render: (val) => formatCurrency(val),
    },
    {
      key: 'estado',
      title: 'Estado',
      dataIndex: 'estado',
      render: (val) => (
        <Badge variant={ESTADO_COLORS[val] || 'default'}>
          {ESTADO_LABELS[val] || val}
        </Badge>
      ),
    },
    {
      key: 'creadoEn',
      title: 'Fecha',
      dataIndex: 'creadoEn',
      render: (val) => formatDateTime(val),
    },
    {
      key: 'actions',
      title: 'Acciones',
      width: '100px',
      align: 'center',
      render: (_, record) => (
        <div className="flex justify-center gap-1">
          <button
            onClick={() => handleView(record)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Ver detalle"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleDeleteConfirm(record)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  /* ─── Render ─── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Devoluciones a Proveedores</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona las devoluciones de productos recibidos de proveedores
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus size={18} />
          Nueva Devolución
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total" value={stats.total} icon={RotateCcw} color="blue" />
        <StatCard title="Solicitadas" value={stats.solicitadas} icon={AlertCircle} color="yellow" />
        <StatCard title="Completadas" value={stats.completadas} icon={PackageX} color="green" />
        <StatCard title="Rechazadas" value={stats.rechazadas} icon={AlertCircle} color="red" />
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3 p-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número, motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          >
            <option value="todos">Todos los estados</option>
            <option value="solicitada">Solicitada</option>
            <option value="aprobada">Aprobada</option>
            <option value="procesando">Procesando</option>
            <option value="completada">Completada</option>
            <option value="rechazada">Rechazada</option>
          </select>
        </div>
      </Card>

      {/* Tabla */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-green-600" />
            <span className="ml-2 text-gray-500">Cargando devoluciones...</span>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-12 text-red-500">
            <AlertCircle size={20} className="mr-2" />
            Error al cargar las devoluciones
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Truck size={40} className="mb-3" />
            <p className="font-medium">No se encontraron devoluciones a proveedores</p>
            <p className="text-sm mt-1">Las devoluciones registradas aparecerán aquí</p>
          </div>
        ) : (
          <Table columns={columns} data={filtered} />
        )}
      </Card>

      {/* Modal: Nueva devolución */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Registrar Devolución a Proveedor"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Devolución <span className="text-red-500">*</span>
              </label>
              <Select {...register('tipoDevolucion')} options={TIPO_DEVOLUCION_OPTIONS} />
              {errors.tipoDevolucion && (
                <p className="text-sm text-red-500 mt-1">{errors.tipoDevolucion.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Reembolso <span className="text-red-500">*</span>
              </label>
              <Select {...register('metodoReembolso')} options={METODO_REEMBOLSO_OPTIONS} />
              {errors.metodoReembolso && (
                <p className="text-sm text-red-500 mt-1">{errors.metodoReembolso.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría del Motivo <span className="text-red-500">*</span>
            </label>
            <Select
              {...register('categoriaMotivo')}
              options={CATEGORIA_MOTIVO_OPTIONS}
              placeholder="Seleccione un motivo"
            />
            {errors.categoriaMotivo && (
              <p className="text-sm text-red-500 mt-1">{errors.categoriaMotivo.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Detalle del Motivo <span className="text-red-500">*</span>
            </label>
            <Textarea
              {...register('detalleMotivo')}
              placeholder="Describa detalladamente el motivo de la devolución al proveedor..."
              rows={3}
            />
            {errors.detalleMotivo && (
              <p className="text-sm text-red-500 mt-1">{errors.detalleMotivo.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas adicionales
            </label>
            <Textarea
              {...register('notas')}
              placeholder="Observaciones opcionales..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-1" />
                  Registrando...
                </>
              ) : (
                'Registrar Devolución'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Detalle */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Detalle de Devolución a Proveedor"
        maxWidth="lg"
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">N° Devolución</p>
                <p className="font-medium">{selected.numeroDevolucion || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Estado</p>
                <Badge variant={ESTADO_COLORS[selected.estado] || 'default'}>
                  {ESTADO_LABELS[selected.estado] || selected.estado}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Tipo</p>
                <p className="font-medium capitalize">{selected.tipoDevolucion || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Método de Reembolso</p>
                <p className="font-medium capitalize">
                  {(selected.metodoReembolso || '').replace(/_/g, ' ') || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Motivo</p>
                <p className="font-medium">
                  {MOTIVO_LABELS[selected.categoriaMotivo] || selected.categoriaMotivo || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Monto Total</p>
                <p className="font-medium">{formatCurrency(selected.total)}</p>
              </div>
            </div>

            {selected.detalleMotivo && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Detalle del Motivo</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selected.detalleMotivo}</p>
              </div>
            )}

            {selected.notas && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Notas</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selected.notas}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Fecha de Solicitud</p>
                <p className="text-sm">{formatDateTime(selected.solicitadoEn || selected.creadoEn)}</p>
              </div>
              {selected.aprobadoEn && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Fecha de Aprobación</p>
                  <p className="text-sm">{formatDateTime(selected.aprobadoEn)}</p>
                </div>
              )}
              {selected.completadoEn && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Fecha de Completado</p>
                  <p className="text-sm">{formatDateTime(selected.completadoEn)}</p>
                </div>
              )}
              {selected.rechazadoEn && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Fecha de Rechazo</p>
                  <p className="text-sm">{formatDateTime(selected.rechazadoEn)}</p>
                </div>
              )}
            </div>

            {selected.razonRechazo && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Razón de Rechazo</p>
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{selected.razonRechazo}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal: Confirmar eliminación */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirmar Eliminación"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Está seguro de eliminar la devolución{' '}
            <span className="font-semibold">{selected?.numeroDevolucion}</span>?
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-1" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
