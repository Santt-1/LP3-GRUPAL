package DrinkGo.DrinkGo_backend.service.jpa;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import DrinkGo.DrinkGo_backend.dto.RecepcionOrdenRequest;
import DrinkGo.DrinkGo_backend.dto.RecepcionOrdenRequest.ItemRecepcion;
import DrinkGo.DrinkGo_backend.entity.DetalleOrdenesCompra;
import DrinkGo.DrinkGo_backend.entity.OrdenesCompra;
import DrinkGo.DrinkGo_backend.repository.DetalleOrdenesCompraRepository;
import DrinkGo.DrinkGo_backend.repository.OrdenesCompraRepository;
import DrinkGo.DrinkGo_backend.service.IOrdenesCompraService;
import DrinkGo.DrinkGo_backend.service.InventarioTransaccionalService;

@Service
public class OrdenesCompraService implements IOrdenesCompraService {
    @Autowired
    private OrdenesCompraRepository repoOrdenesCompra;

    @Autowired
    private DetalleOrdenesCompraRepository repoDetalles;

    @Autowired
    private InventarioTransaccionalService inventarioService;

    public List<OrdenesCompra> buscarTodos() {
        return repoOrdenesCompra.findAll();
    }

    public void guardar(OrdenesCompra ordenesCompra) {
        repoOrdenesCompra.save(ordenesCompra);
    }

    public void modificar(OrdenesCompra ordenesCompra) {
        repoOrdenesCompra.save(ordenesCompra);
    }

    public Optional<OrdenesCompra> buscarId(Long id) {
        return repoOrdenesCompra.findById(id);
    }

    public void eliminar(Long id) {
        repoOrdenesCompra.deleteById(id);
    }

    /**
     * Recibe una orden de compra de forma transaccional:
     * 1. Valida que la orden exista, esté pendiente y tenga almacén asignado.
     * 2. Por cada ítem recibido: actualiza cantidadRecibida en el detalle
     *    y llama a InventarioTransaccionalService.registrarEntrada() que crea
     *    el lote y actualiza el stock con CPP automático.
     * 3. Cambia el estado de la orden a "recibida".
     * Todo en una sola transacción — si algo falla, se revierte todo.
     */
    @Transactional
    public OrdenesCompra recibirOrden(Long ordenId, RecepcionOrdenRequest request) {
        // 1. Cargar la orden
        OrdenesCompra orden = repoOrdenesCompra.findById(ordenId)
            .orElseThrow(() -> new IllegalArgumentException("Orden de compra no encontrada con ID: " + ordenId));

        if (orden.getEstado() != OrdenesCompra.Estado.pendiente) {
            throw new IllegalStateException("Solo se puede recibir una orden en estado pendiente. Estado actual: " + orden.getEstado());
        }
        if (orden.getAlmacen() == null) {
            throw new IllegalStateException("La orden no tiene almacén asignado");
        }
        if (orden.getNegocio() == null) {
            throw new IllegalStateException("La orden no tiene negocio asignado");
        }
        if (request.getUsuarioId() == null) {
            throw new IllegalArgumentException("El usuarioId es obligatorio para registrar la recepción");
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Debe incluir al menos un ítem en la recepción");
        }

        Long negocioId = orden.getNegocio().getId();
        Long almacenId = orden.getAlmacen().getId();
        Long usuarioId = request.getUsuarioId();

        // 2. Procesar cada ítem
        for (ItemRecepcion item : request.getItems()) {
            if (item.getDetalleId() == null) continue;
            BigDecimal cantidad = item.getCantidadRecibida();
            if (cantidad == null || cantidad.compareTo(BigDecimal.ZERO) <= 0) continue;

            // Actualizar cantidadRecibida en el detalle
            DetalleOrdenesCompra detalle = repoDetalles.findById(item.getDetalleId())
                .orElseThrow(() -> new IllegalArgumentException("Detalle no encontrado: " + item.getDetalleId()));

            detalle.setCantidadRecibida(cantidad);
            repoDetalles.save(detalle);

            // Registrar entrada en inventario (crea lote + actualiza stock con CPP)
            String numeroLote = (item.getNumeroLote() != null && !item.getNumeroLote().isBlank())
                ? item.getNumeroLote().trim()
                : "LOTE-" + orden.getNumeroOrden() + "-" + detalle.getProducto().getId();

            inventarioService.registrarEntrada(
                negocioId,
                detalle.getProducto().getId(),
                almacenId,
                numeroLote,
                cantidad,
                detalle.getPrecioUnitario(),
                item.getFechaVencimiento(),
                usuarioId,
                "Recepción orden de compra " + orden.getNumeroOrden(),
                orden.getNumeroOrden()
            );

            System.out.println("✅ Recepción: producto " + detalle.getProducto().getId()
                + " x" + cantidad + " → lote " + numeroLote);
        }

        // 3. Marcar orden como recibida
        orden.setEstado(OrdenesCompra.Estado.recibida);
        repoOrdenesCompra.save(orden);

        System.out.println("✅ Orden " + orden.getNumeroOrden() + " marcada como RECIBIDA");
        return orden;
    }
}
