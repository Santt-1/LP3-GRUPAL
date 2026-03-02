package DrinkGo.DrinkGo_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import DrinkGo.DrinkGo_backend.entity.UsuariosSedes;
import java.util.List;

public interface UsuariosSedesRepository extends JpaRepository<UsuariosSedes, Long> {

    @Query("SELECT us FROM UsuariosSedes us JOIN FETCH us.sede s WHERE us.usuario.id = :usuarioId")
    List<UsuariosSedes> findByUsuarioId(@Param("usuarioId") Long usuarioId);

    /**
     * Devuelve todos los usuarios-sedes cuya sede pertenece al negocio dado.
     * Hace JOIN FETCH de sede y usuario para evitar LazyInitializationException al
     * serializar.
     */
    @Query("SELECT us FROM UsuariosSedes us JOIN FETCH us.sede se JOIN FETCH us.usuario u WHERE se.negocio.id = :negocioId")
    List<UsuariosSedes> findByNegocioId(@Param("negocioId") Long negocioId);
}
