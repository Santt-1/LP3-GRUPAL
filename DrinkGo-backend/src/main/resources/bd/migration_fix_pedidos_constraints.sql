-- Fix: sede_id is optional for online orders
ALTER TABLE pedidos
    MODIFY COLUMN sede_id BIGINT UNSIGNED NULL;

-- Fix: nombre_producto and sku_producto are not set by the Java entity
-- (entity uses a JOIN to productos table instead)
ALTER TABLE detalle_pedidos
    MODIFY COLUMN nombre_producto VARCHAR(250) NULL,
    MODIFY COLUMN sku_producto VARCHAR(50) NULL;
