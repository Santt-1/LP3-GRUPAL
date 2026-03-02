import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wine, MapPin, ArrowRight, LogOut } from 'lucide-react';
import { useAdminAuthStore } from '@/stores/adminAuthStore';

export const SeleccionSede = () => {
  const navigate = useNavigate();
  const { sedes, sede, setSede, logout, user, negocio } = useAdminAuthStore();

  // Si ya hay una sede seleccionada, redirigir al dashboard
  useEffect(() => {
    if (sede) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [sede, navigate]);

  // Si no hay sedes disponibles redirigir al login
  useEffect(() => {
    if (!sedes || sedes.length === 0) {
      navigate('/admin/login', { replace: true });
    }
  }, [sedes, navigate]);

  const handleSeleccionarSede = (sedeElegida) => {
    setSede(sedeElegida);
    navigate('/admin/dashboard', { replace: true });
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4">
            <Wine size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">DrinkGo</h1>
          {negocio && (
            <p className="text-sm font-medium text-gray-700 mt-1">{negocio.razonSocial || negocio.nombre}</p>
          )}
          {user && (
            <p className="text-xs text-gray-500 mt-0.5">
              Bienvenido, {user.nombres}
            </p>
          )}
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Selecciona una sede</h2>
            <p className="text-sm text-gray-500 mt-1">
              Tienes acceso a {sedes.length} sede{sedes.length !== 1 ? 's' : ''}. Elige en cuál trabajarás.
            </p>
          </div>

          <div className="space-y-3">
            {sedes.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSeleccionarSede(s)}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors">
                    <MapPin size={20} className="text-green-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{s.nombre}</span>
                      {s.esPrincipal && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          Principal
                        </span>
                      )}
                      {s.esPredeterminado && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Predeterminado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {s.codigo}
                      {s.ciudad ? ` · ${s.ciudad}` : ''}
                      {s.departamento ? `, ${s.departamento}` : ''}
                    </p>
                    {s.direccion && (
                      <p className="text-xs text-gray-400 mt-0.5">{s.direccion}</p>
                    )}
                    {(s.deliveryHabilitado || s.recojoHabilitado) && (
                      <div className="flex gap-1.5 mt-1.5">
                        {s.deliveryHabilitado && (
                          <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-medium">
                            Delivery
                          </span>
                        )}
                        {s.recojoHabilitado && (
                          <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-medium">
                            Recojo
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <ArrowRight size={18} className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Cerrar sesión */}
        <div className="mt-4 text-center">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          © 2026 DrinkGo — Panel Admin
        </p>
      </div>
    </div>
  );
};
