-- Migration: Add comprobante fields to pedidos table
-- Date: 2025
-- Purpose: Store comprobante (invoice) data from storefront customer orders

ALTER TABLE pedidos
    ADD COLUMN tipo_comprobante VARCHAR(20) NULL DEFAULT 'boleta' COMMENT 'boleta | factura',
    ADD COLUMN doc_cliente_numero VARCHAR(20) NULL COMMENT 'DNI or RUC for comprobante',
    ADD COLUMN doc_cliente_nombre VARCHAR(200) NULL COMMENT 'Customer name or razon social',
    ADD COLUMN doc_cliente_direccion TEXT NULL COMMENT 'Fiscal address (for factura only)';
