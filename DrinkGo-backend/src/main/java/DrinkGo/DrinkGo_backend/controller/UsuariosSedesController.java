package DrinkGo.DrinkGo_backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import DrinkGo.DrinkGo_backend.entity.UsuariosSedes;
import DrinkGo.DrinkGo_backend.repository.UsuariosSedesRepository;
import DrinkGo.DrinkGo_backend.service.IUsuariosSedesService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/restful")
public class UsuariosSedesController {
    @Autowired
    private IUsuariosSedesService service;

    @Autowired
    private UsuariosSedesRepository usuariosSedesRepo;

    @GetMapping("/usuarios-sedes")
    public List<UsuariosSedes> buscarTodos() {
        return service.buscarTodos();
    }

    /**
     * GET /usuarios-sedes/por-negocio/{negocioId}
     * Devuelve lista slim: [{ id, usuarioId, sedeId, sedeNombre, esPredeterminado
     * }]
     */
    @GetMapping("/usuarios-sedes/por-negocio/{negocioId}")
    public List<Map<String, Object>> buscarPorNegocio(@PathVariable("negocioId") Long negocioId) {
        List<UsuariosSedes> list = usuariosSedesRepo.findByNegocioId(negocioId);
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (UsuariosSedes us : list) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", us.getId());
            m.put("usuarioId", us.getUsuario().getId());
            m.put("sedeId", us.getSede().getId());
            m.put("sedeNombre", us.getSede().getNombre());
            m.put("sedeCodigo", us.getSede().getCodigo());
            m.put("esPredeterminado", Boolean.TRUE.equals(us.getEsPredeterminado()));
            result.add(m);
        }
        return result;
    }

    @PostMapping("/usuarios-sedes")
    public Map<String, Object> guardar(@RequestBody UsuariosSedes entity) {
        service.guardar(entity);
        Map<String, Object> resp = new HashMap<>();
        resp.put("id", entity.getId());
        resp.put("usuarioId", entity.getUsuario() != null ? entity.getUsuario().getId() : null);
        resp.put("sedeId", entity.getSede() != null ? entity.getSede().getId() : null);
        resp.put("esPredeterminado", Boolean.TRUE.equals(entity.getEsPredeterminado()));
        return resp;
    }

    @PutMapping("/usuarios-sedes")
    public Map<String, Object> modificar(@RequestBody UsuariosSedes entity) {
        service.modificar(entity);
        Map<String, Object> resp = new HashMap<>();
        resp.put("id", entity.getId());
        resp.put("usuarioId", entity.getUsuario() != null ? entity.getUsuario().getId() : null);
        resp.put("sedeId", entity.getSede() != null ? entity.getSede().getId() : null);
        resp.put("esPredeterminado", Boolean.TRUE.equals(entity.getEsPredeterminado()));
        return resp;
    }

    @GetMapping("/usuarios-sedes/{id}")
    public Optional<UsuariosSedes> buscarId(@PathVariable("id") Long id) {
        return service.buscarId(id);
    }

    @DeleteMapping("/usuarios-sedes/{id}")
    public String eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return "Registro eliminado";
    }
}
