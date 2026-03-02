/**
 * useNegocioConfig.js
 * ───────────────────
 * Hook de React Query para leer y actualizar datos del negocio actual.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { negocioService } from '../services/configuracionService';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import { message } from '@/shared/utils/notifications';

export const useNegocioConfig = (negocioId) => {
  const queryClient = useQueryClient();

  const negocioQuery = useQuery({
    queryKey: ['negocio-config', negocioId],
    queryFn: () => negocioService.getById(negocioId),
    enabled: !!negocioId,
    staleTime: 1000 * 60 * 5,
  });

  const updateNegocio = useMutation({
    mutationFn: negocioService.update,
    onSuccess: (updatedNegocio) => {
      queryClient.invalidateQueries({ queryKey: ['negocio-config'] });
      // Sincronizar el store global para que POS y otros módulos vean los cambios
      if (updatedNegocio) {
        useAdminAuthStore.getState().setNegocio(updatedNegocio);
      }
      message.success('Datos del negocio actualizados exitosamente');
    },
    onError: (err) => {
      message.error(err.response?.data?.message || 'Error al actualizar negocio');
    },
  });

  return {
    negocio: negocioQuery.data || null,
    isLoading: negocioQuery.isLoading,
    isError: negocioQuery.isError,
    error: negocioQuery.error,
    refetch: negocioQuery.refetch,

    updateNegocio: updateNegocio.mutateAsync,
    isUpdating: updateNegocio.isPending,
  };
};
