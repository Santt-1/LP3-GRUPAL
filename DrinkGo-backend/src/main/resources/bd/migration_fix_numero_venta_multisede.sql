-- =====================================================================
-- MIGRACIÓN: Fix numero_venta para multitenancy multi-sede
-- Problema: numero_venta tenía constraint UNIQUE global → dos sedes del
--           mismo negocio generaban VTA-YYYYMMDD-0001 simultáneamente.
-- Solución: unique compuesto (numero_venta, sede_id) para que cada sede
--           tenga su propia secuencia independiente.
-- =====================================================================

-- 1. Eliminar el constraint único simple que genera el conflicto
--    (nombre generado por Hibernate: UKsb0bn5xgym5jnwmw7fnbkyqq6)
ALTER TABLE ventas DROP INDEX UKsb0bn5xgym5jnwmw7fnbkyqq6;

-- 2. Crear el nuevo constraint único compuesto por sede
ALTER TABLE ventas
    ADD CONSTRAINT uq_ventas_numero_sede UNIQUE (numero_venta, sede_id);

-- =====================================================================
-- Resultado: Sede A y Sede B pueden tener ambas VTA-20260304-0001
-- sin conflicto, porque pertenecen a sedes distintas.
-- =====================================================================
