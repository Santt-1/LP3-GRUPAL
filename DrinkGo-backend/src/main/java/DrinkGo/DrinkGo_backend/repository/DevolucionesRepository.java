package DrinkGo.DrinkGo_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import DrinkGo.DrinkGo_backend.entity.Devoluciones;

public interface DevolucionesRepository extends JpaRepository<Devoluciones, Long> {

    @org.springframework.data.jpa.repository.Query("SELECT d FROM Devoluciones d WHERE d.cliente.id = :clienteId ORDER BY d.solicitadoEn DESC")
    java.util.List<Devoluciones> findByClienteId(Long clienteId);

}
