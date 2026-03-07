package DrinkGo.DrinkGo_backend.controller;

import DrinkGo.DrinkGo_backend.entity.Clientes;
import DrinkGo.DrinkGo_backend.entity.DetallePedidos;
import DrinkGo.DrinkGo_backend.entity.Devoluciones;
import DrinkGo.DrinkGo_backend.entity.MetodosPago;
import DrinkGo.DrinkGo_backend.entity.Pedidos;
import DrinkGo.DrinkGo_backend.entity.Productos;
import DrinkGo.DrinkGo_backend.entity.Sedes;
import DrinkGo.DrinkGo_backend.entity.ZonasDelivery;
import DrinkGo.DrinkGo_backend.repository.ClientesRepository;
import DrinkGo.DrinkGo_backend.repository.ConfiguracionTiendaOnlineRepository;
import DrinkGo.DrinkGo_backend.repository.DevolucionesRepository;
import DrinkGo.DrinkGo_backend.repository.MetodosPagoRepository;
import DrinkGo.DrinkGo_backend.repository.PedidosRepository;
import DrinkGo.DrinkGo_backend.repository.ProductosRepository;
import DrinkGo.DrinkGo_backend.repository.SedesRepository;
import DrinkGo.DrinkGo_backend.repository.ZonasDeliveryRepository;
import DrinkGo.DrinkGo_backend.service.IPedidosService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Endpoints de cliente autenticado del storefront.
 * Requieren JWT del cliente en el header Authorization.
 * Rutas: /restful/tienda/{slug}/...
 */
@RestController
@RequestMapping("/restful/tienda/{slug}")
public class StorefrontCustomerController {

    @Autowired
    private ClientesRepository clientesRepo;

    @Autowired
    private PedidosRepository pedidosRepo;

    @Autowired
    private DevolucionesRepository devolucionesRepo;

    @Autowired
    private IPedidosService pedidosService;

    @Autowired
    private ConfiguracionTiendaOnlineRepository configRepo;

    @Autowired
    private SedesRepository sedesRepo;

    @Autowired
    private ProductosRepository productosRepo;

    @Autowired
    private MetodosPagoRepository metodosPagoRepo;

    @Autowired
    private ZonasDeliveryRepository zonasDeliveryRepo;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    /* ── Helper: obtener clienteId del JWT ── */
    private Long getClienteId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return Long.parseLong(principal.toString());
    }

    /* ── Helper: build response without passwordHash ── */
    private Map<String, Object> buildClienteResponse(Clientes c) {
        return Map.of(
                "id", c.getId(),
                "nombres", c.getNombres() != null ? c.getNombres() : "",
                "apellidos", c.getApellidos() != null ? c.getApellidos() : "",
                "email", c.getEmail() != null ? c.getEmail() : "",
                "telefono", c.getTelefono() != null ? c.getTelefono() : "",
                "direccion", c.getDireccion() != null ? c.getDireccion() : "",
                "tipoDocumento", c.getTipoDocumento() != null ? c.getTipoDocumento().name() : "",
                "numeroDocumento", c.getNumeroDocumento() != null ? c.getNumeroDocumento() : "");
    }

    /*
     * ══════════════════════════════════════════════
     * GET /restful/tienda/{slug}/mi-perfil
     * ══════════════════════════════════════════════
     */
    @GetMapping("/mi-perfil")
    public ResponseEntity<?> getMiPerfil(@PathVariable String slug) {
        Long clienteId = getClienteId();
        Optional<Clientes> clienteOpt = clientesRepo.findById(clienteId);
        if (clienteOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Cliente no encontrado"));
        }
        return ResponseEntity.ok(buildClienteResponse(clienteOpt.get()));
    }

    /*
     * ══════════════════════════════════════════════
     * PUT /restful/tienda/{slug}/mi-perfil
     * Body: { nombres, apellidos, telefono, direccion }
     * ══════════════════════════════════════════════
     */
    @PutMapping("/mi-perfil")
    public ResponseEntity<?> updateMiPerfil(
            @PathVariable String slug,
            @RequestBody Map<String, String> body) {

        Long clienteId = getClienteId();
        Optional<Clientes> clienteOpt = clientesRepo.findById(clienteId);
        if (clienteOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Cliente no encontrado"));
        }

        Clientes cliente = clienteOpt.get();

        if (body.containsKey("nombres"))
            cliente.setNombres(body.get("nombres"));
        if (body.containsKey("apellidos"))
            cliente.setApellidos(body.get("apellidos"));
        if (body.containsKey("telefono"))
            cliente.setTelefono(body.get("telefono"));
        if (body.containsKey("direccion"))
            cliente.setDireccion(body.get("direccion"));

        clientesRepo.save(cliente);

        return ResponseEntity.ok(buildClienteResponse(cliente));
    }

    /*
     * ══════════════════════════════════════════════
     * PUT /restful/tienda/{slug}/mi-perfil/password
     * Body: { currentPassword, newPassword }
     * ══════════════════════════════════════════════
     */
    @PutMapping("/mi-perfil/password")
    public ResponseEntity<?> changePassword(
            @PathVariable String slug,
            @RequestBody Map<String, String> body) {

        Long clienteId = getClienteId();
        Optional<Clientes> clienteOpt = clientesRepo.findById(clienteId);
        if (clienteOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Cliente no encontrado"));
        }

        Clientes cliente = clienteOpt.get();
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "currentPassword y newPassword son requeridos"));
        }

        if (cliente.getPasswordHash() == null ||
                !passwordEncoder.matches(currentPassword, cliente.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "La contraseña actual es incorrecta"));
        }

        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "La nueva contraseña debe tener al menos 6 caracteres"));
        }

        cliente.setPasswordHash(passwordEncoder.encode(newPassword));
        clientesRepo.save(cliente);

        return ResponseEntity.ok(Map.of("message", "Contraseña actualizada exitosamente"));
    }

    /*
     * ══════════════════════════════════════════════
     * POST /restful/tienda/{slug}/pedidos
     * Body: { sedeId?, tipoPedido, origenPedido, metodoPagoId?,
     * observaciones?, direccionEntrega?, departamento?, provincia?,
     * distrito?, referencia?, zonaDeliveryId?,
     * tipoComprobante?, docClienteNumero?, docClienteNombre?, docClienteDireccion?,
     * detalles: [{ productoId, cantidad, precioUnitario }] }
     * ══════════════════════════════════════════════
     */
    @PostMapping("/pedidos")
    public ResponseEntity<?> crearPedido(
            @PathVariable String slug,
            @RequestBody Map<String, Object> body) {

        Long clienteId = getClienteId();

        // 1. Resolver negocio desde el slug
        var configOpt = configRepo.findBySlugTienda(slug);
        if (configOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Tienda no encontrada"));
        }
        var negocio = configOpt.get().getNegocio();
        if (negocio == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "La tienda no tiene un negocio asociado"));
        }

        // 2. Cliente autenticado
        Optional<Clientes> clienteOpt = clientesRepo.findById(clienteId);
        if (clienteOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Cliente no encontrado"));
        }

        // 3. Construir el pedido
        Pedidos pedido = new Pedidos();
        pedido.setNegocio(negocio);
        pedido.setCliente(clienteOpt.get());
        pedido.setOrigenPedido(Pedidos.OrigenPedido.tienda_online);

        // 4. Sede (opcional)
        Object sedeIdRaw = body.get("sedeId");
        if (sedeIdRaw != null) {
            try {
                Long sedeId = Long.parseLong(sedeIdRaw.toString());
                sedesRepo.findById(sedeId).ifPresent(pedido::setSede);
            } catch (NumberFormatException ignored) {
            }
        }

        // 5. Tipo de pedido
        String tipoPedidoStr = (String) body.getOrDefault("tipoPedido", "recojo_tienda");
        try {
            pedido.setTipoPedido(Pedidos.TipoPedido.valueOf(tipoPedidoStr));
        } catch (IllegalArgumentException e) {
            pedido.setTipoPedido(Pedidos.TipoPedido.recojo_tienda);
        }

        // 6. Método de pago → guardar nombre como String
        Object metodoPagoIdRaw = body.get("metodoPagoId");
        if (metodoPagoIdRaw != null) {
            try {
                Long metodoPagoId = Long.parseLong(metodoPagoIdRaw.toString());
                Optional<MetodosPago> metodoOpt = metodosPagoRepo.findById(metodoPagoId);
                metodoOpt.ifPresent(m -> pedido.setMetodoPago(m.getNombre()));
            } catch (NumberFormatException ignored) {
            }
        }

        // 7. Campos de dirección
        if (body.get("direccionEntrega") != null)
            pedido.setDireccionEntrega(body.get("direccionEntrega").toString());
        if (body.get("departamento") != null)
            pedido.setDepartamento(body.get("departamento").toString());
        if (body.get("provincia") != null)
            pedido.setProvincia(body.get("provincia").toString());
        if (body.get("distrito") != null)
            pedido.setDistrito(body.get("distrito").toString());
        if (body.get("referencia") != null)
            pedido.setReferencia(body.get("referencia").toString());
        if (body.get("observaciones") != null)
            pedido.setObservaciones(body.get("observaciones").toString());

        // 8. Zona de delivery
        BigDecimal costoDelivery = BigDecimal.ZERO;
        Object zonaIdRaw = body.get("zonaDeliveryId");
        if (zonaIdRaw != null) {
            try {
                Long zonaId = Long.parseLong(zonaIdRaw.toString());
                Optional<ZonasDelivery> zonaOpt = zonasDeliveryRepo.findById(zonaId);
                if (zonaOpt.isPresent()) {
                    pedido.setZonaDelivery(zonaOpt.get());
                    costoDelivery = zonaOpt.get().getTarifaDelivery() != null
                            ? zonaOpt.get().getTarifaDelivery()
                            : BigDecimal.ZERO;
                }
            } catch (NumberFormatException ignored) {
            }
        }
        pedido.setCostoDelivery(costoDelivery);

        // 9. Comprobante
        String tipoComprobante = body.containsKey("tipoComprobante")
                ? body.get("tipoComprobante").toString()
                : "boleta";
        pedido.setTipoComprobante(tipoComprobante);
        if (body.get("docClienteNumero") != null)
            pedido.setDocClienteNumero(body.get("docClienteNumero").toString());
        if (body.get("docClienteNombre") != null)
            pedido.setDocClienteNombre(body.get("docClienteNombre").toString());
        if ("factura".equals(tipoComprobante) && body.get("docClienteDireccion") != null)
            pedido.setDocClienteDireccion(body.get("docClienteDireccion").toString());

        // 10. Detalles del pedido
        Object detallesRaw = body.get("detalles");
        if (!(detallesRaw instanceof List<?> detallesList) || detallesList.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "El pedido debe tener al menos un producto"));
        }

        List<DetallePedidos> detalles = new ArrayList<>();
        BigDecimal subtotalPedido = BigDecimal.ZERO;

        for (Object itemRaw : detallesList) {
            if (!(itemRaw instanceof Map<?, ?> item))
                continue;

            Object productoIdRaw = item.get("productoId");
            if (productoIdRaw == null)
                continue;

            Long productoId;
            try {
                productoId = Long.parseLong(productoIdRaw.toString());
            } catch (NumberFormatException e) {
                continue;
            }

            Optional<Productos> productoOpt = productosRepo.findById(productoId);
            if (productoOpt.isEmpty())
                continue;

            Productos producto = productoOpt.get();

            BigDecimal cantidad;
            try {
                Object cantidadRaw = item.get("cantidad");
                cantidad = new BigDecimal(cantidadRaw != null ? cantidadRaw.toString() : "1");
            } catch (Exception e) {
                cantidad = BigDecimal.ONE;
            }

            BigDecimal precioUnitario;
            try {
                precioUnitario = new BigDecimal(item.get("precioUnitario").toString());
            } catch (Exception e) {
                precioUnitario = producto.getPrecioVenta() != null
                        ? producto.getPrecioVenta()
                        : BigDecimal.ZERO;
            }

            BigDecimal subtotalDetalle = precioUnitario.multiply(cantidad);

            DetallePedidos detalle = new DetallePedidos();
            detalle.setProducto(producto);
            detalle.setCantidad(cantidad);
            detalle.setPrecioUnitario(precioUnitario);
            detalle.setSubtotal(subtotalDetalle);
            detalle.setTotal(subtotalDetalle);

            detalles.add(detalle);
            subtotalPedido = subtotalPedido.add(subtotalDetalle);
        }

        if (detalles.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "No se pudo procesar ningún producto del pedido"));
        }

        pedido.setDetalles(detalles);
        pedido.setSubtotal(subtotalPedido);
        pedido.setTotal(subtotalPedido.add(costoDelivery));

        // 11. Persistir (genera numeroPedido automáticamente)
        try {
            pedidosService.guardar(pedido);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error al crear el pedido: " + e.getMessage()));
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", pedido.getId(),
                "numeroPedido", pedido.getNumeroPedido(),
                "total", pedido.getTotal(),
                "estadoPedido", pedido.getEstadoPedido().name(),
                "tipoComprobante", pedido.getTipoComprobante(),
                "message", "Pedido creado exitosamente"));
    }

    /*
     * ══════════════════════════════════════════════
     * GET /restful/tienda/{slug}/mis-pedidos
     * ══════════════════════════════════════════════
     */
    @GetMapping("/mis-pedidos")
    public ResponseEntity<?> getMisPedidos(@PathVariable String slug) {
        Long clienteId = getClienteId();
        List<Pedidos> pedidos = pedidosRepo.findByClienteId(clienteId);
        return ResponseEntity.ok(pedidos);
    }

    /*
     * ══════════════════════════════════════════════
     * GET /restful/tienda/{slug}/mis-pedidos/{pedidoId}
     * ══════════════════════════════════════════════
     */
    @GetMapping("/mis-pedidos/{pedidoId}")
    public ResponseEntity<?> getMiPedido(
            @PathVariable String slug,
            @PathVariable Long pedidoId) {

        Long clienteId = getClienteId();
        Optional<Pedidos> pedidoOpt = pedidosRepo.findById(pedidoId);

        if (pedidoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Pedido no encontrado"));
        }

        Pedidos pedido = pedidoOpt.get();

        // Verificar que el pedido pertenece al cliente autenticado
        if (pedido.getCliente() == null || !clienteId.equals(pedido.getCliente().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "No tiene acceso a este pedido"));
        }

        return ResponseEntity.ok(pedido);
    }

    /*
     * ══════════════════════════════════════════════
     * GET /restful/tienda/{slug}/mis-devoluciones
     * ══════════════════════════════════════════════
     */
    @GetMapping("/mis-devoluciones")
    public ResponseEntity<?> getMisDevoluciones(@PathVariable String slug) {
        Long clienteId = getClienteId();
        List<Devoluciones> devoluciones = devolucionesRepo.findByClienteId(clienteId);
        return ResponseEntity.ok(devoluciones);
    }
}
