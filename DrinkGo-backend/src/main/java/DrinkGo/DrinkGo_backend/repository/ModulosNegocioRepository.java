package DrinkGo.DrinkGo_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import DrinkGo.DrinkGo_backend.entity.ModulosNegocio;
import java.util.List;

public interface ModulosNegocioRepository extends JpaRepository<ModulosNegocio, Long> {

    /**
     * Devuelve los módulos habilitados para un negocio, cargando el ModulosSistema
     * para evitar LazyInitializationException.
     */
    @Query("SELECT mn FROM ModulosNegocio mn JOIN FETCH mn.modulo WHERE mn.negocio.id = :negocioId")
    List<ModulosNegocio> findByNegocioId(@Param("negocioId") Long negocioId);
}
