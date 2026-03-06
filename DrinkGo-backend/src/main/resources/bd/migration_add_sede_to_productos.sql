-- ============================================================
-- MIGRACIÓN: Agregar sede_id a la tabla productos
-- Permite asociar productos a una sede específica del negocio.
-- NULL = producto visible en todas las sedes del negocio.
-- ============================================================

USE drinkgo_db;

-- Agregar columna sede_id (nullable) si no existe
SET @col_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'productos'
      AND COLUMN_NAME = 'sede_id'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE productos ADD COLUMN sede_id BIGINT UNSIGNED NULL COMMENT ''Sede a la que pertenece el producto. NULL = visible en todas las sedes del negocio'' AFTER negocio_id',
    'SELECT ''Columna sede_id ya existe en productos''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar FK si no existe
SET @fk_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'productos'
      AND CONSTRAINT_NAME = 'fk_prod_sede'
);

SET @sql2 = IF(@fk_exists = 0,
    'ALTER TABLE productos ADD CONSTRAINT fk_prod_sede FOREIGN KEY (sede_id) REFERENCES sedes(id) ON DELETE SET NULL',
    'SELECT ''FK fk_prod_sede ya existe''');
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- Agregar índice si no existe
SET @idx_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'productos'
      AND INDEX_NAME = 'idx_prod_sede'
);

SET @sql3 = IF(@idx_exists = 0,
    'ALTER TABLE productos ADD INDEX idx_prod_sede (sede_id)',
    'SELECT ''Índice idx_prod_sede ya existe''');
PREPARE stmt3 FROM @sql3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

-- Actualizar productos existentes: asignarlos a la sede principal de su negocio
UPDATE productos p
INNER JOIN sedes s ON s.negocio_id = p.negocio_id AND s.es_principal = 1
SET p.sede_id = s.id
WHERE p.sede_id IS NULL;
