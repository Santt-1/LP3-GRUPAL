import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Lock, Save, Loader2, Eye, EyeOff } from 'lucide-react';
import { useStorefrontAuthStore } from '../stores/storefrontAuthStore';
import { storefrontService } from '../services/storefrontService';
import toast from 'react-hot-toast';

export const StorefrontProfile = () => {
  const { slug } = useOutletContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { isAuthenticated, login, customer, token } = useStorefrontAuthStore();

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    navigate(`/tienda/${slug}/login`, { replace: true });
    return null;
  }

  return <ProfileContent slug={slug} customer={customer} token={token} login={login} queryClient={queryClient} />;
};

const ProfileContent = ({ slug, customer, login, queryClient }) => {
  const [profileForm, setProfileForm] = useState({
    nombres: customer?.nombres || '',
    apellidos: customer?.apellidos || '',
    telefono: customer?.telefono || '',
    direccion: customer?.direccion || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  // Fetch current profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['storefront-profile', slug],
    queryFn: () => storefrontService.getProfile(slug),
    onSuccess: (data) => {
      setProfileForm({
        nombres: data.nombres || '',
        apellidos: data.apellidos || '',
        telefono: data.telefono || '',
        direccion: data.direccion || '',
      });
    },
    staleTime: 1000 * 60 * 5,
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: (data) => storefrontService.updateProfile(slug, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['storefront-profile', slug] });
      // Update Zustand store with new customer data
      const config = null; // config no disponible aquí pero no es necesario para login update
      toast.success('Perfil actualizado exitosamente');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Error al actualizar el perfil');
    },
  });

  // Change password mutation
  const passwordMutation = useMutation({
    mutationFn: (data) => storefrontService.changePassword(slug, data),
    onSuccess: () => {
      toast.success('Contraseña actualizada exitosamente');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Error al cambiar la contraseña');
    },
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!profileForm.nombres.trim() || !profileForm.apellidos.trim()) {
      toast.error('Nombre y apellidos son requeridos');
      return;
    }
    updateMutation.mutate(profileForm);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      toast.error('Ingresa tu contraseña actual');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }
    passwordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 size={32} className="animate-spin text-amber-500" />
      </div>
    );
  }

  const displayData = profile || customer;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-500 text-sm mt-1">
          Gestiona tus datos personales y contraseña
        </p>
      </div>

      {/* Info display */}
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-lg">
          {(displayData?.nombres || '?').charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900">
            {displayData?.nombres} {displayData?.apellidos}
          </p>
          <p className="text-sm text-gray-500">{displayData?.email}</p>
        </div>
      </div>

      {/* Personal data form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <User size={20} className="text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-800">Datos Personales</h2>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombres <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profileForm.nombres}
                onChange={(e) => setProfileForm((p) => ({ ...p, nombres: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellidos <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profileForm.apellidos}
                onChange={(e) => setProfileForm((p) => ({ ...p, apellidos: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                value={profileForm.telefono}
                onChange={(e) => setProfileForm((p) => ({ ...p, telefono: e.target.value }))}
                placeholder="987654321"
                maxLength={9}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input
                type="text"
                value={profileForm.direccion}
                onChange={(e) => setProfileForm((p) => ({ ...p, direccion: e.target.value }))}
                placeholder="Av. Los Álamos 123"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-medium rounded-xl transition-colors text-sm"
            >
              {updateMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>

      {/* Change password form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={20} className="text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-800">Cambiar Contraseña</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña Actual <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrentPwd ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nueva Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPwd ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Nueva <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={passwordMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors text-sm"
            >
              {passwordMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Lock size={16} />
              )}
              Cambiar Contraseña
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
