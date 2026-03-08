import { useQuery } from '@tanstack/react-query';
import { storefrontService } from '../services/storefrontService';

export const useStorefrontCombos = (slug, sedeId) => {
  const query = useQuery({
    queryKey: ['storefront-combos', slug, sedeId],
    queryFn: () => storefrontService.getCombosBySlug(slug, sedeId),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  return {
    combos: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
