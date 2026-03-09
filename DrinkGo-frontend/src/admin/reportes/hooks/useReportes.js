/**
 * useReportes.js
 * ──────────────
 * Hooks de TanStack Query para el módulo de Reportes (Admin).
 * Consume reportesService y expone datos listos para las tabs.
 */
import { useQuery } from '@tanstack/react-query';
import { reportesService } from '../services/reportesService';
import { useAdminAuthStore } from '@/stores/adminAuthStore';

/* ─── Ventas del negocio ─── */
export const useReporteVentas = () => {
  const negocioId = useAdminAuthStore((s) => s.negocio?.id);

  return useQuery({
    queryKey: ['reportes', 'ventas', negocioId],
    queryFn: () => reportesService.getVentasByNegocio(negocioId),
    enabled: !!negocioId,
    staleTime: 1000 * 60 * 5,
  });
};

/* ─── Stock inventario ─── */
export const useReporteStock = () => {
  return useQuery({
    queryKey: ['reportes', 'stock'],
    queryFn: () => reportesService.getStockInventario(),
    staleTime: 1000 * 60 * 5,
  });
};

/* ─── Lotes inventario ─── */
export const useReporteLotes = () => {
  return useQuery({
    queryKey: ['reportes', 'lotes'],
    queryFn: () => reportesService.getLotesInventario(),
    staleTime: 1000 * 60 * 5,
  });
};

/* ─── Órdenes de compra ─── */
export const useReporteCompras = () => {
  return useQuery({
    queryKey: ['reportes', 'compras'],
    queryFn: () => reportesService.getOrdenesCompra(),
    staleTime: 1000 * 60 * 5,
  });
};

/* ─── Gastos ─── */
export const useReporteGastos = () => {
  const negocioId = useAdminAuthStore((s) => s.negocio?.id);

  return useQuery({
    queryKey: ['reportes', 'gastos', negocioId],
    queryFn: () => reportesService.getGastos(negocioId),
    enabled: !!negocioId,
    staleTime: 1000 * 60 * 5,
  });
};

/* ─── Comprobantes (boletas y facturas) ─── */
export const useReporteComprobantes = () => {
  const negocioId = useAdminAuthStore((s) => s.negocio?.id);

  return useQuery({
    queryKey: ['reportes', 'comprobantes', negocioId],
    queryFn: () => reportesService.getComprobantes(negocioId),
    enabled: !!negocioId,
    staleTime: 1000 * 60 * 5,
  });
};

/* ─── Movimientos de inventario ─── */
export const useReporteMovimientos = () => {
  return useQuery({
    queryKey: ['reportes', 'movimientos'],
    queryFn: () => reportesService.getMovimientosInventario(),
    staleTime: 1000 * 60 * 5,
  });
};
