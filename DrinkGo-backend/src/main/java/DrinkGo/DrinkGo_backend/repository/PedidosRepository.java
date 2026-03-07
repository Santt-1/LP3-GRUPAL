package DrinkGo.DrinkGo_backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import DrinkGo.DrinkGo_backend.entity.Pedidos;

public interface PedidosRepository extends JpaRepository<Pedidos, Long> {

    @Query("SELECT p.numeroPedido FROM Pedidos p ORDER BY p.id DESC")
    Page<String> findTopNumeroPedido(Pageable pageable);

    @Query("SELECT p FROM Pedidos p WHERE p.cliente.id = :clienteId ORDER BY p.creadoEn DESC")
    java.util.List<Pedidos> findByClienteId(Long clienteId);

}
