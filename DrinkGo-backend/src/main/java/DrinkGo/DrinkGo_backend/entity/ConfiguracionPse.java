package DrinkGo.DrinkGo_backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

/**
 * Configuración del Proveedor de Servicios Electrónicos (PSE) por negocio.
 * <p>
 * Almacena las credenciales y configuración de conexión con el PSE
 * seleccionado (Nubefact, Efact, Bizlinks, Simulador, etc.).
 * <p>
 * Tabla: configuracion_pse (creada por ddl-auto=update).
 */
@Entity
@Table(name = "configuracion_pse")
public class ConfiguracionPse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "negocio_id", nullable = false)
    private Negocios negocio;

    /** Nombre del proveedor: SIMULADOR, NUBEFACT, EFACT, BIZLINKS */
    @Column(name = "proveedor", length = 50)
    private String proveedor = "SIMULADOR";

    /** Entorno: SANDBOX, PRODUCCION */
    @Column(name = "entorno", length = 20)
    private String entorno = "SANDBOX";

    /** Token o API key del PSE */
    @Column(name = "api_token", length = 500)
    private String apiToken;

    /** URL base del servicio PSE */
    @Column(name = "url_servicio", length = 500)
    private String urlServicio;

    /** RUC del emisor para el PSE */
    @Column(name = "ruc_emisor", length = 11)
    private String rucEmisor;

    /** Indica si la conexión PSE está activa */
    @Column(name = "esta_activo")
    private Boolean estaActivo = false;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;

    @PrePersist
    protected void onCreate() {
        creadoEn = LocalDateTime.now();
        actualizadoEn = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        actualizadoEn = LocalDateTime.now();
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Negocios getNegocio() {
        return negocio;
    }

    public void setNegocio(Negocios negocio) {
        this.negocio = negocio;
    }

    public String getProveedor() {
        return proveedor;
    }

    public void setProveedor(String proveedor) {
        this.proveedor = proveedor;
    }

    public String getEntorno() {
        return entorno;
    }

    public void setEntorno(String entorno) {
        this.entorno = entorno;
    }

    public String getApiToken() {
        return apiToken;
    }

    public void setApiToken(String apiToken) {
        this.apiToken = apiToken;
    }

    public String getUrlServicio() {
        return urlServicio;
    }

    public void setUrlServicio(String urlServicio) {
        this.urlServicio = urlServicio;
    }

    public String getRucEmisor() {
        return rucEmisor;
    }

    public void setRucEmisor(String rucEmisor) {
        this.rucEmisor = rucEmisor;
    }

    public Boolean getEstaActivo() {
        return estaActivo;
    }

    public void setEstaActivo(Boolean estaActivo) {
        this.estaActivo = estaActivo;
    }

    public LocalDateTime getCreadoEn() {
        return creadoEn;
    }

    public void setCreadoEn(LocalDateTime creadoEn) {
        this.creadoEn = creadoEn;
    }

    public LocalDateTime getActualizadoEn() {
        return actualizadoEn;
    }

    public void setActualizadoEn(LocalDateTime actualizadoEn) {
        this.actualizadoEn = actualizadoEn;
    }
}
