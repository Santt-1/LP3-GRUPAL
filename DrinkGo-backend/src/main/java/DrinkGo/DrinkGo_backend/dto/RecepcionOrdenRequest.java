package DrinkGo.DrinkGo_backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO para la recepción de una orden de compra.
 * Enviado por el frontend al endpoint POST /ordenes-compra/{id}/recibir.
 */
public class RecepcionOrdenRequest {

    /** ID del usuario que registra la recepción (obligatorio). */
    private Long usuarioId;

    /** Lista de ítems recibidos. */
    private List<ItemRecepcion> items;

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public List<ItemRecepcion> getItems() { return items; }
    public void setItems(List<ItemRecepcion> items) { this.items = items; }

    // ─── Inner class ────────────────────────────────────────────────

    public static class ItemRecepcion {
        /** ID del detalle de la orden de compra. */
        private Long detalleId;

        /** Cantidad efectivamente recibida. */
        private BigDecimal cantidadRecibida;

        /** Número de lote asignado a esta partida. */
        private String numeroLote;

        /** Fecha de vencimiento (opcional, útil para bebidas). */
        private LocalDate fechaVencimiento;

        public Long getDetalleId() { return detalleId; }
        public void setDetalleId(Long detalleId) { this.detalleId = detalleId; }

        public BigDecimal getCantidadRecibida() { return cantidadRecibida; }
        public void setCantidadRecibida(BigDecimal cantidadRecibida) { this.cantidadRecibida = cantidadRecibida; }

        public String getNumeroLote() { return numeroLote; }
        public void setNumeroLote(String numeroLote) { this.numeroLote = numeroLote; }

        public LocalDate getFechaVencimiento() { return fechaVencimiento; }
        public void setFechaVencimiento(LocalDate fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }
    }
}
