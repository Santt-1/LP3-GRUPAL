/**
 * VentasReporteTab.jsx
 * ────────────────────
 * RF-ECO-018: Reporte de Ventas
 * Muestra ventas por período con filtros de fecha, estadísticas
 * y tabla detallada. Permite ver datos por día/semana/mes.
 */
import { useState, useMemo } from 'react';
import {
  DollarSign, TrendingUp, ShoppingCart, XCircle,
  Search, Calendar, Download, MapPin, Trophy,
} from 'lucide-react';
import { Card } from '@/admin/components/ui/Card';
import { StatCard } from '@/admin/components/ui/StatCard';
import { Badge } from '@/admin/components/ui/Badge';
import { Table } from '@/admin/components/ui/Table';
import { Button } from '@/admin/components/ui/Button';
import { useReporteVentas } from '../../hooks/useReportes';
import { formatCurrency, formatDateTime } from '@/shared/utils/formatters';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';

const ESTADO_MAP = {
  completada: { label: 'Completada', variant: 'success' },
  pendiente: { label: 'Pendiente', variant: 'warning' },
  anulada: { label: 'Anulada', variant: 'error' },
  cancelada: { label: 'Cancelada', variant: 'error' },
  reembolsada: { label: 'Reembolsada', variant: 'info' },
};

const TIPO_MAP = {
  pos:          { label: 'POS',          className: 'bg-blue-100 text-blue-700'    },
  tienda_online:{ label: 'Tienda Online',className: 'bg-amber-100 text-amber-700'  },
  mesa:         { label: 'Mesa',         className: 'bg-purple-100 text-purple-700'},
  telefono:     { label: 'Teléfono',     className: 'bg-green-100 text-green-700'  },
};

const AGRUPACION = {
  dia: 'Día',
  semana: 'Semana',
  mes: 'Mes',
};

const getWeekKey = (dateStr) => {
  const d = new Date(dateStr);
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${d.getFullYear()}-S${String(weekNo).padStart(2, '0')}`;
};

const getMonthKey = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const getDayKey = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getSede = (v) => v.sede?.nombre || v.sedeNombre || v.nombreSede || 'Sin sede';

const INNER_TABS = [
  { key: 'temporal', label: 'Temporal', icon: Calendar },
  { key: 'sede',     label: 'Por Sede', icon: MapPin   },
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
    <Button variant="outline" size="sm" onClick={onCSV}><Download size={14} /> CSV</Button>
    <Button variant="outline" size="sm" onClick={onPDF}><Download size={14} /> PDF</Button>
  </div>
);

export const VentasReporteTab = () => {
  const { data: ventas = [], isLoading } = useReporteVentas();

  const [activeTab,  setActiveTab]  = useState('temporal');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [agrupacion, setAgrupacion] = useState('dia');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  /* Filtrado por fecha (compartido) */
  const byDate = useMemo(() => {
    let r = ventas;
    if (fechaDesde) r = r.filter((v) => new Date(v.creadoEn) >= new Date(fechaDesde));
    if (fechaHasta) {
      const h = new Date(fechaHasta); h.setHours(23, 59, 59, 999);
      r = r.filter((v) => new Date(v.creadoEn) <= h);
    }
    return r;
  }, [ventas, fechaDesde, fechaHasta]);

  /* Filtrado adicional por búsqueda (tab Temporal) */
  const filtered = useMemo(() => {
    if (!debouncedSearch) return byDate;
    const q = debouncedSearch.toLowerCase();
    return byDate.filter((v) =>
      (v.numeroVenta || '').toLowerCase().includes(q) ||
      (v.estado || '').toLowerCase().includes(q),
    );
  }, [byDate, debouncedSearch]);

  /* Estadísticas */
  const stats = useMemo(() => {
    const done  = byDate.filter((v) => v.estado === 'completada');
    const monto = done.reduce((acc, v) => acc + (v.total || 0), 0);
    return {
      total:    done.length,
      monto,
      ticket:   done.length ? monto / done.length : 0,
      anuladas: byDate.filter((v) => v.estado === 'anulada').length,
    };
  }, [byDate]);

  /* Agrupación temporal */
  const resumenTemporal = useMemo(() => {
    const done = byDate.filter((v) => v.estado === 'completada');
    const g = {};
    done.forEach((v) => {
      const key =
        agrupacion === 'dia'    ? getDayKey(v.creadoEn) :
        agrupacion === 'semana' ? getWeekKey(v.creadoEn) :
                                  getMonthKey(v.creadoEn);
      if (!g[key]) g[key] = { periodo: key, cant: 0, monto: 0 };
      g[key].cant++;
      g[key].monto += v.total || 0;
    });
    return Object.values(g).sort((a, b) => (a.periodo < b.periodo ? 1 : -1));
  }, [byDate, agrupacion]);

  /* Agrupación por sede */
  const resumenSedes = useMemo(() => {
    const done = byDate.filter((v) => v.estado === 'completada');
    const g = {};
    done.forEach((v) => {
      const s = getSede(v);
      if (!g[s]) g[s] = { sede: s, cant: 0, monto: 0 };
      g[s].cant++;
      g[s].monto += v.total || 0;
    });
    return Object.values(g).sort((a, b) => b.monto - a.monto);
  }, [byDate]);

  const mejorSede = resumenSedes[0];
  const maxMonto  = mejorSede?.monto || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCSV = () =>
    exportToCSV(filtered.map((v) => ({
      'N° Venta': v.numeroVenta || '',
      Fecha: formatDateTime(v.creadoEn),
      Tipo:  TIPO_MAP[v.tipoVenta]?.label || v.tipoVenta || '',
      Sede:  getSede(v),
      Total: v.total || 0,
      Estado: ESTADO_MAP[v.estado]?.label || v.estado || '',
    })), 'reporte_ventas');

  const handlePDF = () =>
    exportToPDF('Reporte de Ventas', filtered.map((v) => ({
      'N° Venta': v.numeroVenta || '',
      Fecha:  formatDateTime(v.creadoEn),
      Sede:   getSede(v),
      Total:  formatCurrency(v.total || 0),
      Estado: ESTADO_MAP[v.estado]?.label || v.estado || '',
    })));

  /* Columnas tabla detalle */
  const cols = [
    { key:'#', title:'#', width:'50px', render: (_,__,i) => (page-1)*PAGE_SIZE + i + 1 },
    { key:'n', title:'N° Venta', dataIndex: 'numeroVenta' },
    { key:'t', title:'Tipo', render: (_,r) => {
      const info = TIPO_MAP[r.tipoVenta] || { label: r.tipoVenta || '—', className: 'bg-gray-100 text-gray-600' };
      return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${info.className}`}>{info.label}</span>;
    }},
    { key:'s', title:'Sede',  render: (_,r) => <span className="text-sm text-gray-600">{getSede(r)}</span> },
    { key:'f', title:'Fecha', render: (_,r) => formatDateTime(r.creadoEn) },
    { key:'$', title:'Total', render: (_,r) => <span className="font-semibold">{formatCurrency(r.total)}</span> },
    { key:'e', title:'Estado', render: (_,r) => {
      const info = ESTADO_MAP[r.estado] || { label: r.estado, variant: 'info' };
      return <Badge variant={info.variant}>{info.label}</Badge>;
    }},
  ];

  const resumenCols = [
    { key:'p', title:'Período',         dataIndex: 'periodo' },
    { key:'c', title:'Ventas',          dataIndex: 'cant' },
    { key:'m', title:'Monto Total',     render: (_,r) => <span className="font-semibold">{formatCurrency(r.monto)}</span> },
    { key:'a', title:'Ticket Promedio', render: (_,r) => formatCurrency(r.cant > 0 ? r.monto / r.cant : 0) },
  ];

  const sedeCols = [
    { key:'r', title:'#',     width:'50px', render: (_,__,i) => i + 1 },
    { key:'s', title:'Sede',  dataIndex: 'sede' },
    { key:'c', title:'Ventas', dataIndex: 'cant' },
    { key:'m', title:'Monto Total', render: (_,r) => <span className="font-semibold">{formatCurrency(r.monto)}</span> },
    { key:'a', title:'Ticket Promedio', render: (_,r) => formatCurrency(r.cant > 0 ? r.monto / r.cant : 0) },
    { key:'b', title:'Participación', render: (_,r) => (
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-100 rounded-full h-2 min-w-[80px]">
          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.round((r.monto / maxMonto) * 100)}%` }} />
        </div>
        <span className="text-xs text-gray-500 w-9 text-right">{Math.round((r.monto / maxMonto) * 100)}%</span>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reporte de Ventas</h1>
        <p className="text-gray-600 mt-1">Análisis temporal y comparativa por sede de ventas completadas</p>
      </div>

      {/* Estadísticas globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Ventas completadas" value={stats.total}                icon={ShoppingCart} />
        <StatCard title="Monto total"        value={formatCurrency(stats.monto)} icon={DollarSign}  />
        <StatCard title="Ticket promedio"    value={formatCurrency(stats.ticket)}icon={TrendingUp}  />
        <StatCard title="Ventas anuladas"    value={stats.anuladas}              icon={XCircle}     />
      </div>

      {/* Navegación de pestañas internas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {INNER_TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
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

      {/* ── TAB: Temporal ── */}
      {activeTab === 'temporal' && (
        <div className="space-y-4">
          <DateBar
            fechaDesde={fechaDesde} onDesde={setFechaDesde}
            fechaHasta={fechaHasta} onHasta={setFechaHasta}
            onCSV={handleCSV} onPDF={handlePDF}
          />

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800">Resumen por período</h2>
              <div className="flex gap-2">
                {Object.entries(AGRUPACION).map(([k, l]) => (
                  <button
                    key={k} onClick={() => setAgrupacion(k)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      agrupacion === k ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <Table columns={resumenCols} data={resumenTemporal.slice(0, 10)} loading={isLoading} emptyText="Sin datos para el período" />
          </Card>

          <Card>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text" value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  placeholder="Buscar N° venta, estado..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <Table
              columns={cols} data={paginated} loading={isLoading} emptyText="Sin ventas en el período"
              pagination={{ current: page, pageSize: PAGE_SIZE, total: filtered.length, onChange: setPage }}
            />
          </Card>
        </div>
      )}

      {/* ── TAB: Por Sede ── */}
      {activeTab === 'sede' && (
        <div className="space-y-4">
          <DateBar
            fechaDesde={fechaDesde} onDesde={setFechaDesde}
            fechaHasta={fechaHasta} onHasta={setFechaHasta}
            onCSV={() => exportToCSV(resumenSedes.map((s) => ({
              Sede: s.sede, 'Cant. Ventas': s.cant,
              'Monto Total': s.monto,
              'Ticket Promedio': s.cant > 0 ? s.monto / s.cant : 0,
            })), 'reporte_ventas_sede')}
            onPDF={() => exportToPDF('Reporte de Ventas por Sede', resumenSedes.map((s) => ({
              Sede: s.sede, 'Cant. Ventas': s.cant,
              'Monto Total': formatCurrency(s.monto),
              'Ticket Promedio': formatCurrency(s.cant > 0 ? s.monto / s.cant : 0),
            })))}
          />

          {mejorSede && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center shrink-0">
                <Trophy size={24} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-yellow-700 font-medium uppercase tracking-wide">Sede con mejores ventas</p>
                <p className="text-xl font-bold text-gray-900">{mejorSede.sede}</p>
                <p className="text-sm text-gray-600">{mejorSede.cant} ventas · {formatCurrency(mejorSede.monto)}</p>
              </div>
            </div>
          )}

          <Card>
            <h2 className="text-base font-semibold text-gray-800 mb-4">Comparativa entre sedes</h2>
            <Table
              columns={sedeCols} data={resumenSedes} loading={isLoading}
              emptyText="Sin datos de sede en el período seleccionado"
            />
          </Card>
        </div>
      )}
    </div>
  );
};
