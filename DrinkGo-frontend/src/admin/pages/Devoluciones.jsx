/**
 * Devoluciones.jsx
 * ────────────────
 * Página principal del módulo Devoluciones.
 * Contiene dos pestañas: Clientes y Proveedores.
 */
import { useState } from 'react';
import { User, Truck } from 'lucide-react';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import { DevolucionesClientesTab } from '@/admin/devoluciones/components/tabs/DevolucionesClientesTab';
import { DevolucionesProveedoresTab } from '@/admin/devoluciones/components/tabs/DevolucionesProveedoresTab';

const TABS = [
  { key: 'clientes', label: 'Clientes', icon: User },
  { key: 'proveedores', label: 'Proveedores', icon: Truck },
];

export const Devoluciones = () => {
  const negocio = useAdminAuthStore((s) => s.negocio);
  const negocioId = negocio?.id;
  const [activeTab, setActiveTab] = useState('clientes');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Devoluciones</h1>
        <p className="text-gray-600 mt-1">Gestión de devoluciones de clientes y proveedores</p>
      </div>

      {/* Pestañas */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 -mb-px">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-green-600 text-green-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de la pestaña activa */}
      {activeTab === 'clientes' && <DevolucionesClientesTab negocioId={negocioId} />}
      {activeTab === 'proveedores' && <DevolucionesProveedoresTab negocioId={negocioId} />}
    </div>
  );
};
