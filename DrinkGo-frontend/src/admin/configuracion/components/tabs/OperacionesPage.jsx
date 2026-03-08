/**
 * OperacionesPage.jsx
 * ───────────────────
 * Sub-módulo que agrupa Métodos de Pago, Zonas de Delivery y Mesas
 * en pestañas internas. Por defecto muestra la pestaña Métodos de Pago.
 */
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CreditCard, Truck, LayoutGrid } from 'lucide-react';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import { MetodosPagoTab } from './MetodosPagoTab';
import { ZonasDeliveryTab } from './ZonasDeliveryTab';
import { MesasTab } from './MesasTab';

const TABS = [
  { key: 'metodos-pago',    label: 'Métodos de Pago', icon: CreditCard, permiso: 'm.configuracion.operaciones.metodos-pago' },
  { key: 'zonas-delivery', label: 'Zonas Delivery',   icon: Truck,      permiso: 'm.configuracion.operaciones.zonas-delivery' },
  { key: 'mesas',          label: 'Mesas',            icon: LayoutGrid, permiso: 'm.configuracion.operaciones.mesas' },
];

export const OperacionesPage = () => {
  const outletContext = useOutletContext();
  const hasPermiso = useAdminAuthStore((s) => s.hasPermiso);
  const visibleTabs = TABS.filter((t) => hasPermiso(t.permiso));
  const [activeTab, setActiveTab] = useState(() => visibleTabs[0]?.key ?? 'metodos-pago');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Operaciones</h1>
        <p className="text-gray-600 mt-1">
          Configuración de métodos de pago, zonas de delivery y mesas del negocio
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6" aria-label="Pestañas de operaciones">
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive
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

      {/* Tab Content */}
      <div>
        {activeTab === 'metodos-pago' && <MetodosPagoTab context={outletContext} />}
        {activeTab === 'zonas-delivery' && <ZonasDeliveryTab context={outletContext} />}
        {activeTab === 'mesas' && <MesasTab context={outletContext} />}
      </div>
    </div>
  );
};
