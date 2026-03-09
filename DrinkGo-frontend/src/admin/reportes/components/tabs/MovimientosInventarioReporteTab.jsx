/**
 * MovimientosInventarioReporteTab.jsx
 * ────────────────────────────────────
 * RF-ECO-021: Trazabilidad de movimientos de inventario
 * Pestañas: Lista de movimientos | Por tipo
 */
import { useState, useMemo } from 'react';
import {
  ArrowDownCircle, ArrowUpCircle, RefreshCw, Trash2,
  Search, Calendar, Download, List, BarChart2,
} from 'lucide-react';
import { Card }     from '@/admin/components/ui/Card';
import { StatCard } from '@/admin/components/ui/StatCard';
import { Badge }    from '@/admin/components/ui/Badge';
import { Table }    from '@/admin/components/ui/Table';
import { Button }   from '@/admin/components/ui/Button';
import { useReporteMovimientos } from '../../hooks/useReportes';
import { formatDateTime } from '@/shared/utils/formatters';
import { useDebounce }    from '@/shared/hooks/useDebounce';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';

/* ── Normalización del tipo de movimiento ── */
const normTipo = (m) => {
  const raw = ((m.tipo || m.tipoMovimiento || m.tipomovimiento || '')).toUpperCase();
  if (raw.includes('ENT'))  return 'ENTRADA';
  if (raw.includes('SAL'))  return 'SALIDA';
  if (raw.includes('AJU'))  return 'AJUSTE';
  if (raw.includes('MER'))  return 'MERMA';
  return raw || 'OTRO';
};

const getProducto    = (m) => m.producto?.nombre || m.productoNombre || m.nombreProducto || '—';
const getCantidad    = (m) => m.cantidad ?? m.cantidadMovimiento ?? 0;
const getResponsable = (m) => m.responsable || m.usuario?.nombre || m.usuarioNombre || '—';
const getMotivo      = (m) => m.motivo || m.descripcion || m.observacion || '—';
const getFecha       = (m) => m.fecha || m.creadoEn || m.fechaMovimiento || '';

const TIPO_CONFIG = {
  ENTRADA: { label: 'Entrada',  variant: 'success', icon: ArrowDownCircle, bg: 'bg-green-50',  text: 'text-green-700'  },
  SALIDA:  { label: 'Salida',   variant: 'error',   icon: ArrowUpCircle,   bg: 'bg-red-50',    text: 'text-red-700'    },
  AJUSTE:  { label: 'Ajuste',   variant: 'info',    icon: RefreshCw,       bg: 'bg-blue-50',   text: 'text-blue-700'   },
  MERMA:   { label: 'Merma',    variant: 'warning', icon: Trash2,          bg: 'bg-yellow-50', text: 'text-yellow-700' },
};

const INNER_TABS = [
  { key: 'lista',    label: 'Lista de movimientos', icon: List      },
  { key: 'por_tipo', label: 'Por tipo',             icon: BarChart2 },
];

const DateBar = ({ fechaDesde, onDesde, fechaHasta, onHasta, onCSV, onPDF }) => (
  <div className="flex flex-wrap items-center gap-3">
    <div className="flex items-center gap-2">
      <Calendar size={15} className="text-gray-400" />
      <input type="date" value={fechaDesde} onChange={(e) => onDesde(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
      <span className="text-gray-400 text-sm">–</span>
      <input type="date" value={fechaHasta} onChange={(e) => onHasta(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
    </div>
    {onCSV && <Button variant="outline" size="sm" onClick={onCSV}><Download size={14} /> CSV</Button>}
    {onPDF && <Button variant="outline" size="sm" onClick={onPDF}><Download size={14} /> PDF</Button>}
  </div>
);

export const MovimientosInventarioReporteTab = () => {
  const { data: movimientos = [], isLoading } = useReporteMovimientos();
  const [activeTab,   setActiveTab]   = useState('lista');
  const [fechaDesde,  setFechaDesde]  = useState('');
  const [fechaHasta,  setFechaHasta]  = useState('');
  const [searchTerm,  setSearchTerm]  = useState('');
  const [filterTipo,  setFilterTipo]  = useState('ALL');
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  /* Filtrado por fecha */
  const byDate = useMemo(() => {
    let r = movimientos;
    if (fechaDesde) r = r.filter((m) => new Date(getFecha(m)) >= new Date(fechaDesde));
    if (fechaHasta) {
      const h = new Date(fechaHasta); h.setHours(23, 59, 59, 999);
      r = r.filter((m) => new Date(getFecha(m)) <= h);
    }
    return r;
  }, [movimientos, fechaDesde, fechaHasta]);

  /* Stats globales */
  const stats = useMemo(() => ({
    entradas: byDate.filter((m) => normTipo(m) === 'ENTRADA').length,
    salidas:  byDate.filter((m) => normTipo(m) === 'SALIDA').length,
    ajustes:  byDate.filter((m) => normTipo(m) === 'AJUSTE').length,
    mermas:   byDate.filter((m) => normTipo(m) === 'MERMA').length,
  }), [byDate]);

  /* Filtrado para tab Lista */
  const filtered = useMemo(() => {
    let r = byDate;
    if (filterTipo !== 'ALL') r = r.filter((m) => normTipo(m) === filterTipo);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      r = r.filter((m) =>
        getProducto(m).toLowerCase().includes(q) ||
        getMotivo(m).toLowerCase().includes(q) ||
        getResponsable(m).toLowerCase().includes(q),
      );
    }
    return r;
  }, [byDate, filterTipo, debouncedSearch]);

  /* Resumen por tipo para tab Por tipo */
  const resumenPorTipo = useMemo(() => {
    const g = {};
    byDate.forEach((m) => {
      const tipo = normTipo(m);
      if (!g[tipo]) g[tipo] = { tipo, cantidad: 0, unidades: 0, motivoConteos: {} };
      g[tipo].cantidad++;
      g[tipo].unidades += getCantidad(m);
      const motivo = getMotivo(m);
      g[tipo].motivoConteos[motivo] = (g[tipo].motivoConteos[motivo] || 0) + 1;
    });
    return Object.values(g).map((r) => {
      const topMotivo = Object.entries(r.motivoConteos).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
      return { ...r, topMotivo };
    }).sort((a, b) => b.cantidad - a.cantidad);
  }, [byDate]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* Columnas tabla lista */
  const cols = [
    { key:'#',  title:'#', width:'50px', render:(_,__,i) => (page-1)*PAGE_SIZE + i + 1 },
    { key:'t',  title:'Tipo', render:(_,m) => {
      const cfg = TIPO_CONFIG[normTipo(m)] || { label: normTipo(m), variant:'info' };
      return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
    }},
    { key:'p',  title:'Producto',    render:(_,m) => getProducto(m)    },
    { key:'c',  title:'Cantidad',    render:(_,m) => getCantidad(m)    },
    { key:'f',  title:'Fecha',       render:(_,m) => formatDateTime(getFecha(m)) },
    { key:'r',  title:'Responsable', render:(_,m) => getResponsable(m) },
    { key:'mo', title:'Motivo',      render:(_,m) => (
      <span className="text-sm text-gray-600">{getMotivo(m)}</span>
    )},
  ];

  const resumenCols = [
    { key:'t',  title:'Tipo',      render:(_,r) => {
      const cfg = TIPO_CONFIG[r.tipo] || { label: r.tipo, variant:'info' };
      return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
    }},
    { key:'c',  title:'Cant. movimientos', dataIndex:'cantidad'  },
    { key:'u',  title:'Unidades totales',  dataIndex:'unidades'  },
    { key:'m',  title:'Motivo más común',  dataIndex:'topMotivo' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Movimientos de Inventario</h1>
        <p className="text-gray-600 mt-1">Trazabilidad completa de entradas, salidas, ajustes y mermas</p>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Entradas"  value={stats.entradas} icon={ArrowDownCircle} />
        <StatCard title="Salidas"   value={stats.salidas}  icon={ArrowUpCircle}   />
        <StatCard title="Ajustes"   value={stats.ajustes}  icon={RefreshCw}       />
        <StatCard title="Mermas"    value={stats.mermas}   icon={Trash2}          />
      </div>

      {/* Pestañas internas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {INNER_TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setPage(1); }}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                  active
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── TAB: Lista de movimientos ── */}
      {activeTab === 'lista' && (
        <div className="space-y-4">
          <DateBar
            fechaDesde={fechaDesde} onDesde={setFechaDesde}
            fechaHasta={fechaHasta} onHasta={setFechaHasta}
            onCSV={() => exportToCSV(filtered.map((m) => ({
              Tipo: TIPO_CONFIG[normTipo(m)]?.label || normTipo(m),
              Producto:    getProducto(m),
              Cantidad:    getCantidad(m),
              Fecha:       formatDateTime(getFecha(m)),
              Responsable: getResponsable(m),
              Motivo:      getMotivo(m),
            })), 'reporte_movimientos')}
            onPDF={() => exportToPDF('Movimientos de Inventario', filtered.map((m) => ({
              Tipo:        TIPO_CONFIG[normTipo(m)]?.label || normTipo(m),
              Producto:    getProducto(m),
              Cantidad:    String(getCantidad(m)),
              Fecha:       formatDateTime(getFecha(m)),
              Responsable: getResponsable(m),
            })))}
          />

          <Card>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  placeholder="Buscar producto, motivo, responsable..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <select
                value={filterTipo}
                onChange={(e) => { setFilterTipo(e.target.value); setPage(1); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="ALL">Todos los tipos</option>
                {Object.entries(TIPO_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <Table
              columns={cols} data={paginated} loading={isLoading}
              emptyText="Sin movimientos en el período"
              pagination={{ current: page, pageSize: PAGE_SIZE, total: filtered.length, onChange: setPage }}
            />
          </Card>
        </div>
      )}

      {/* ── TAB: Por tipo ── */}
      {activeTab === 'por_tipo' && (
        <div className="space-y-4">
          <DateBar
            fechaDesde={fechaDesde} onDesde={setFechaDesde}
            fechaHasta={fechaHasta} onHasta={setFechaHasta}
            onCSV={() => exportToCSV(resumenPorTipo.map((r) => ({
              Tipo: TIPO_CONFIG[r.tipo]?.label || r.tipo,
              'Cant. movimientos': r.cantidad,
              'Unidades totales':  r.unidades,
              'Motivo más común':  r.topMotivo,
            })), 'resumen_movimientos_tipo')}
          />

          {/* Tarjetas de resumen por tipo */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(TIPO_CONFIG).map(([key, cfg]) => {
              const r = resumenPorTipo.find((rr) => rr.tipo === key);
              const Icon = cfg.icon;
              return (
                <div key={key} className={`${cfg.bg} rounded-xl p-4 border border-transparent`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={18} className={cfg.text} />
                    <span className={`text-sm font-semibold ${cfg.text}`}>{cfg.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{r?.cantidad ?? 0}</p>
                  <p className="text-xs text-gray-500 mt-1">{r?.unidades ?? 0} unidades</p>
                </div>
              );
            })}
          </div>

          <Card>
            <h2 className="text-base font-semibold text-gray-800 mb-4">Resumen por tipo de movimiento</h2>
            <Table
              columns={resumenCols} data={resumenPorTipo} loading={isLoading}
              emptyText="Sin movimientos en el período seleccionado"
            />
          </Card>
        </div>
      )}
    </div>
  );
};
