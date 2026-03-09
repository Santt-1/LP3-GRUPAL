package DrinkGo.DrinkGo_backend.service.jpa;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import DrinkGo.DrinkGo_backend.entity.Devoluciones;
import DrinkGo.DrinkGo_backend.entity.Devoluciones.EstadoDevolucion;
import DrinkGo.DrinkGo_backend.entity.Usuarios;
import DrinkGo.DrinkGo_backend.repository.DevolucionesRepository;
import DrinkGo.DrinkGo_backend.repository.UsuariosRepository;
import DrinkGo.DrinkGo_backend.service.IDevolucionesService;

@Service
public class DevolucionesService implements IDevolucionesService {
    @Autowired
    private DevolucionesRepository repoDevoluciones;

    @Autowired
    private UsuariosRepository repoUsuarios;

    public List<Devoluciones> buscarTodos() {
        return repoDevoluciones.findAll();
    }

    public List<Devoluciones> buscarPorNegocio(Long negocioId) {
        return repoDevoluciones.findByNegocioIdOrderBySolicitadoEnDesc(negocioId);
    }

    public void guardar(Devoluciones devoluciones) {
        if (devoluciones.getNumeroDevolucion() == null || devoluciones.getNumeroDevolucion().isBlank()) {
            Long negocioId = devoluciones.getNegocio().getId();
            devoluciones.setNumeroDevolucion(generarNumeroDevolucion(negocioId));
        }
        repoDevoluciones.save(devoluciones);
    }

    public void modificar(Devoluciones devoluciones) {
        repoDevoluciones.save(devoluciones);
    }

    public Optional<Devoluciones> buscarId(Long id) {
        return repoDevoluciones.findById(id);
    }

    public void eliminar(Long id) {
        repoDevoluciones.deleteById(id);
    }

    @Transactional
    public Devoluciones aprobar(Long devolucionId, Long usuarioId) {
        Devoluciones dev = repoDevoluciones.findById(devolucionId)
                .orElseThrow(() -> new IllegalArgumentException("Devolución no encontrada con id: " + devolucionId));

        if (dev.getEstado() != EstadoDevolucion.solicitada) {
            throw new IllegalArgumentException("Solo se pueden aprobar devoluciones en estado 'solicitada'. Estado actual: " + dev.getEstado());
        }

        Usuarios usuario = repoUsuarios.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con id: " + usuarioId));

        dev.setEstado(EstadoDevolucion.aprobada);
        dev.setAprobadoPor(usuario);
        dev.setAprobadoEn(LocalDateTime.now());
        return repoDevoluciones.save(dev);
    }

    @Transactional
    public Devoluciones rechazar(Long devolucionId, Long usuarioId, String razon) {
        Devoluciones dev = repoDevoluciones.findById(devolucionId)
                .orElseThrow(() -> new IllegalArgumentException("Devolución no encontrada con id: " + devolucionId));

        if (dev.getEstado() != EstadoDevolucion.solicitada && dev.getEstado() != EstadoDevolucion.aprobada) {
            throw new IllegalArgumentException("Solo se pueden rechazar devoluciones en estado 'solicitada' o 'aprobada'. Estado actual: " + dev.getEstado());
        }

        Usuarios usuario = repoUsuarios.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con id: " + usuarioId));

        dev.setEstado(EstadoDevolucion.rechazada);
        dev.setProcesadoPor(usuario);
        dev.setRechazadoEn(LocalDateTime.now());
        dev.setRazonRechazo(razon);
        return repoDevoluciones.save(dev);
    }

    public String generarNumeroDevolucion(Long negocioId) {
        Long maxNum = repoDevoluciones.findMaxNumeroByNegocioId(negocioId);
        long next = (maxNum != null ? maxNum : 0) + 1;
        return String.format("DEV-%06d", next);
    }
}
