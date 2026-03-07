package DrinkGo.DrinkGo_backend.controller;

import DrinkGo.DrinkGo_backend.entity.Clientes;
import DrinkGo.DrinkGo_backend.entity.ConfiguracionTiendaOnline;
import DrinkGo.DrinkGo_backend.repository.ClientesRepository;
import DrinkGo.DrinkGo_backend.repository.ConfiguracionTiendaOnlineRepository;
import DrinkGo.DrinkGo_backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * Endpoints de autenticación del storefront.
 * Rutas habilitadas en SecurityConfig como permitAll:
 * POST /restful/tienda/auth/registro
 * POST /restful/tienda/auth/login
 */
@RestController
@RequestMapping("/restful/tienda/auth")
public class StorefrontAuthController {

    @Autowired
    private ConfiguracionTiendaOnlineRepository configRepo;

    @Autowired
    private ClientesRepository clientesRepo;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    /* ── Helper: buscar negocioId por slug ── */
    private Optional<Long> resolveNegocioId(String slug) {
        return configRepo.findBySlugTienda(slug)
                .map(c -> c.getNegocio() != null ? c.getNegocio().getId() : null);
    }

    /*
     * ══════════════════════════════════════════════
     * POST /restful/tienda/auth/registro
     * Body: { slug, email, password, nombres, apellidos,
     * tipoDocumento, numeroDocumento, telefono, direccion }
     * ══════════════════════════════════════════════
     */
    @PostMapping("/registro")
    public ResponseEntity<?> registro(@RequestBody Map<String, String> body) {
        String slug = body.get("slug");
        String email = body.get("email");
        String password = body.get("password");

        if (slug == null || email == null || password == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "slug, email y password son requeridos"));
        }

        Optional<Long> negocioIdOpt = resolveNegocioId(slug);
        if (negocioIdOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Tienda no encontrada: " + slug));
        }
        Long negocioId = negocioIdOpt.get();

        // Verificar si el email ya está registrado en este negocio
        Optional<Clientes> existing = clientesRepo.findFirstByEmailAndNegocioId(email, negocioId);
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "El email ya está registrado en esta tienda"));
        }

        // Buscar la entidad Negocio para asignarlo
        Optional<ConfiguracionTiendaOnline> configOpt = configRepo.findBySlugTienda(slug);
        if (configOpt.isEmpty() || configOpt.get().getNegocio() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Negocio no encontrado"));
        }

        Clientes cliente = new Clientes();
        cliente.setNegocio(configOpt.get().getNegocio());
        cliente.setEmail(email);
        cliente.setPasswordHash(passwordEncoder.encode(password));
        cliente.setNombres(body.getOrDefault("nombres", ""));
        cliente.setApellidos(body.getOrDefault("apellidos", ""));
        cliente.setTelefono(body.get("telefono"));
        cliente.setDireccion(body.get("direccion"));

        String tipoDocStr = body.get("tipoDocumento");
        if (tipoDocStr != null) {
            try {
                cliente.setTipoDocumento(Clientes.TipoDocumento.valueOf(tipoDocStr));
            } catch (IllegalArgumentException ignored) {
            }
        }
        cliente.setNumeroDocumento(body.get("numeroDocumento"));
        cliente.setEstaActivo(true);

        clientesRepo.save(cliente);

        String token = jwtUtil.generarToken(String.valueOf(cliente.getId()));

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "token", token,
                "cliente", buildClienteResponse(cliente)));
    }

    /*
     * ══════════════════════════════════════════════
     * POST /restful/tienda/auth/login
     * Body: { slug, email, password }
     * ══════════════════════════════════════════════
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String slug = body.get("slug");
        String email = body.get("email");
        String password = body.get("password");

        if (slug == null || email == null || password == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "slug, email y password son requeridos"));
        }

        Optional<Long> negocioIdOpt = resolveNegocioId(slug);
        if (negocioIdOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Tienda no encontrada: " + slug));
        }
        Long negocioId = negocioIdOpt.get();

        Optional<Clientes> clienteOpt = clientesRepo.findFirstByEmailAndNegocioId(email, negocioId);
        if (clienteOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Credenciales inválidas"));
        }

        Clientes cliente = clienteOpt.get();

        if (cliente.getPasswordHash() == null || !passwordEncoder.matches(password, cliente.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Credenciales inválidas"));
        }

        if (!Boolean.TRUE.equals(cliente.getEstaActivo())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Cuenta desactivada"));
        }

        String token = jwtUtil.generarToken(String.valueOf(cliente.getId()));

        return ResponseEntity.ok(Map.of(
                "token", token,
                "cliente", buildClienteResponse(cliente)));
    }

    /* ── Build cliente response (sin passwordHash) ── */
    private Map<String, Object> buildClienteResponse(Clientes c) {
        return Map.of(
                "id", c.getId(),
                "nombres", c.getNombres() != null ? c.getNombres() : "",
                "apellidos", c.getApellidos() != null ? c.getApellidos() : "",
                "email", c.getEmail() != null ? c.getEmail() : "",
                "telefono", c.getTelefono() != null ? c.getTelefono() : "",
                "direccion", c.getDireccion() != null ? c.getDireccion() : "");
    }
}
