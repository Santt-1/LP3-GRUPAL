package DrinkGo.DrinkGo_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import DrinkGo.DrinkGo_backend.entity.DetalleDevoluciones;

public interface DetalleDevolucionesRepository extends JpaRepository<DetalleDevoluciones, Long> {

    List<DetalleDevoluciones> findByDevolucionId(Long devolucionId);
}
