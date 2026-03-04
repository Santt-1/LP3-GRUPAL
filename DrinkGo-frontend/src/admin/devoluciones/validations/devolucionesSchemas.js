/**
 * devolucionesSchemas.js
 * ──────────────────────
 * Esquemas de validación Zod para el módulo Devoluciones.
 */
import { z } from 'zod';

export const devolucionSchema = z.object({
  tipoDevolucion: z.enum(['total', 'parcial'], {
    required_error: 'Seleccione el tipo de devolución',
  }),
  categoriaMotivo: z.enum(
    ['defectuoso', 'articulo_incorrecto', 'cambio_cliente', 'vencido', 'danado', 'otro'],
    { required_error: 'Seleccione la categoría del motivo' }
  ),
  detalleMotivo: z
    .string()
    .min(5, 'El detalle del motivo debe tener al menos 5 caracteres')
    .max(1000, 'El detalle del motivo no puede exceder 1000 caracteres'),
  metodoReembolso: z.enum(
    ['efectivo', 'pago_original', 'credito_tienda', 'transferencia_bancaria'],
    { required_error: 'Seleccione el método de reembolso' }
  ),
  notas: z.string().max(1000).optional().or(z.literal('')),
});
