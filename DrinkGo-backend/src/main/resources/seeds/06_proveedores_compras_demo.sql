-- ============================================================
-- SEED 06: PROVEEDORES Y COMPRAS DEMO
-- Solo para: DON PEPE LICORES - Sede Principal
-- Idempotente: usa WHERE NOT EXISTS para no duplicar al reiniciar
-- Dependencia: 03_negocios_demo.sql, 04_catalogo_demo.sql,
--              05_inventario_demo.sql  (almacenes)
-- ============================================================

USE drinkgo_db;

-- ============================================================
-- REFERENCIAS
-- ============================================================
SET @n_donpepe    = (SELECT id FROM negocios WHERE ruc = '20123456789' LIMIT 1);
SET @sede_donpepe = (SELECT id FROM sedes WHERE codigo = 'SEDE-PRINCIPAL' AND negocio_id = @n_donpepe LIMIT 1);
SET @alm_dp_principal = (SELECT id FROM almacenes WHERE negocio_id = @n_donpepe AND codigo = 'DP-ALM-PRINCIPAL' LIMIT 1);

-- Productos DON PEPE
SET @dp_ron = (SELECT id FROM productos WHERE negocio_id = @n_donpepe AND sku = 'DP-RON-001' LIMIT 1);
SET @dp_cer = (SELECT id FROM productos WHERE negocio_id = @n_donpepe AND sku = 'DP-CER-001' LIMIT 1);
SET @dp_vin = (SELECT id FROM productos WHERE negocio_id = @n_donpepe AND sku = 'DP-VIN-001' LIMIT 1);
SET @dp_snk = (SELECT id FROM productos WHERE negocio_id = @n_donpepe AND sku = 'DP-SNK-001' LIMIT 1);
SET @dp_gas = (SELECT id FROM productos WHERE negocio_id = @n_donpepe AND sku = 'DP-GAS-001' LIMIT 1);

-- Usuario admin
SET @usr_donpepe = (SELECT id FROM usuarios WHERE negocio_id = @n_donpepe AND email = 'admin@donpepe.com' LIMIT 1);


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  1. PROVEEDORES  (3 para Don Pepe Licores)                  â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- â”€â”€ DON PEPE â”€â”€
INSERT INTO proveedores (negocio_id, razon_social, nombre_comercial, tipo_documento, numero_documento,
    direccion, telefono, email, contacto_principal, telefono_contacto, email_contacto,
    dias_credito, limite_credito, observaciones, esta_activo, creado_en)
SELECT @n_donpepe, 'DestilerÃ­a Cartavio S.A.C.', 'Cartavio', 'RUC', '20481076370',
    'Av. Industrial 2450, La Libertad', '044-432100', 'ventas@cartavio.com.pe',
    'Carlos Mendoza', '944-123456', 'cmendoza@cartavio.com.pe',
    30, '50000.00', 'Proveedor principal de rones y destilados', 1, '2026-01-05 10:00:00'
WHERE NOT EXISTS (SELECT 1 FROM proveedores WHERE negocio_id = @n_donpepe AND numero_documento = '20481076370');

INSERT INTO proveedores (negocio_id, razon_social, nombre_comercial, tipo_documento, numero_documento,
    direccion, telefono, email, contacto_principal, telefono_contacto, email_contacto,
    dias_credito, limite_credito, observaciones, esta_activo, creado_en)
SELECT @n_donpepe, 'Backus y Johnston S.A.A.', 'Backus', 'RUC', '20100113610',
    'Jr. Chiclayo 594, RÃ­mac, Lima', '01-4611000', 'distribuidores@backus.com.pe',
    'MartÃ­n Rojas', '951-234567', 'mrojas@backus.com.pe',
    15, '80000.00', 'Proveedor principal de cervezas', 1, '2026-01-05 10:30:00'
WHERE NOT EXISTS (SELECT 1 FROM proveedores WHERE negocio_id = @n_donpepe AND numero_documento = '20100113610');

INSERT INTO proveedores (negocio_id, razon_social, nombre_comercial, tipo_documento, numero_documento,
    direccion, telefono, email, contacto_principal, telefono_contacto, email_contacto,
    dias_credito, limite_credito, observaciones, esta_activo, creado_en)
SELECT @n_donpepe, 'Distribuidora ViÃ±as del Sur E.I.R.L.', 'ViÃ±as del Sur', 'RUC', '20556677889',
    'Calle Las Uvas 180, Ica', '056-221100', 'pedidos@vinasdelsur.pe',
    'Ana Torres', '962-345678', 'atorres@vinasdelsur.pe',
    45, '30000.00', 'Importador de vinos chilenos y argentinos', 1, '2026-01-06 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM proveedores WHERE negocio_id = @n_donpepe AND numero_documento = '20556677889');

-- Variables de proveedores
SET @prov_dp_cartavio = (SELECT id FROM proveedores WHERE negocio_id = @n_donpepe AND numero_documento = '20481076370' LIMIT 1);
SET @prov_dp_backus   = (SELECT id FROM proveedores WHERE negocio_id = @n_donpepe AND numero_documento = '20100113610' LIMIT 1);
SET @prov_dp_vinas    = (SELECT id FROM proveedores WHERE negocio_id = @n_donpepe AND numero_documento = '20556677889' LIMIT 1);


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  2. PRODUCTOS PROVEEDOR                                     â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- â”€â”€ DON PEPE â”€â”€
INSERT INTO productos_proveedor (negocio_id, producto_id, proveedor_id, sku_proveedor, precio_compra,
    tiempo_entrega_dias, es_predeterminado, esta_activo, creado_en)
SELECT @n_donpepe, @dp_ron, @prov_dp_cartavio, 'CART-RON-BLK-750', 28.50, 3, 1, 1, '2026-01-05 10:10:00'
WHERE NOT EXISTS (SELECT 1 FROM productos_proveedor WHERE negocio_id = @n_donpepe AND producto_id = @dp_ron AND proveedor_id = @prov_dp_cartavio);

INSERT INTO productos_proveedor (negocio_id, producto_id, proveedor_id, sku_proveedor, precio_compra,
    tiempo_entrega_dias, es_predeterminado, esta_activo, creado_en)
SELECT @n_donpepe, @dp_cer, @prov_dp_backus, 'BCK-PIL-630', 3.80, 1, 1, 1, '2026-01-05 10:20:00'
WHERE NOT EXISTS (SELECT 1 FROM productos_proveedor WHERE negocio_id = @n_donpepe AND producto_id = @dp_cer AND proveedor_id = @prov_dp_backus);

INSERT INTO productos_proveedor (negocio_id, producto_id, proveedor_id, sku_proveedor, precio_compra,
    tiempo_entrega_dias, es_predeterminado, esta_activo, creado_en)
SELECT @n_donpepe, @dp_vin, @prov_dp_vinas, 'VS-CSLL-750', 38.00, 7, 1, 1, '2026-01-06 09:10:00'
WHERE NOT EXISTS (SELECT 1 FROM productos_proveedor WHERE negocio_id = @n_donpepe AND producto_id = @dp_vin AND proveedor_id = @prov_dp_vinas);

INSERT INTO productos_proveedor (negocio_id, producto_id, proveedor_id, sku_proveedor, precio_compra,
    tiempo_entrega_dias, es_predeterminado, esta_activo, creado_en)
SELECT @n_donpepe, @dp_gas, @prov_dp_backus, 'BCK-GAS-1500', 3.50, 1, 1, 1, '2026-01-05 10:30:00'
WHERE NOT EXISTS (SELECT 1 FROM productos_proveedor WHERE negocio_id = @n_donpepe AND producto_id = @dp_gas AND proveedor_id = @prov_dp_backus);

-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  3. Ã“RDENES DE COMPRA                                       â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- â”€â”€ DON PEPE â”€â”€
INSERT INTO ordenes_compra (negocio_id, numero_orden, proveedor_id, sede_id, almacen_id,
    estado, subtotal, impuestos, total, notas, fecha_orden, usuario_id, creado_por, creado_en)
SELECT @n_donpepe, 'OC-DP-2026-001', @prov_dp_cartavio, @sede_donpepe, @alm_dp_principal,
    'recibida', 3420.00, 615.60, 4035.60, 'Compra inicial de Ron Cartavio Black 750ml - 120 unidades',
    '2026-01-10 09:00:00', @usr_donpepe, @usr_donpepe, '2026-01-08 14:00:00'
WHERE NOT EXISTS (SELECT 1 FROM ordenes_compra WHERE numero_orden = 'OC-DP-2026-001');

INSERT INTO ordenes_compra (negocio_id, numero_orden, proveedor_id, sede_id, almacen_id,
    estado, subtotal, impuestos, total, notas, fecha_orden, usuario_id, creado_por, creado_en)
SELECT @n_donpepe, 'OC-DP-2026-002', @prov_dp_backus, @sede_donpepe, @alm_dp_principal,
    'recibida', 1284.00, 231.12, 1515.12, 'Compra Cerveza Pilsen 630ml y Gaseosa 1.5L',
    '2026-01-15 10:00:00', @usr_donpepe, @usr_donpepe, '2026-01-13 11:00:00'
WHERE NOT EXISTS (SELECT 1 FROM ordenes_compra WHERE numero_orden = 'OC-DP-2026-002');

INSERT INTO ordenes_compra (negocio_id, numero_orden, proveedor_id, sede_id, almacen_id,
    estado, subtotal, impuestos, total, notas, fecha_orden, usuario_id, creado_por, creado_en)
SELECT @n_donpepe, 'OC-DP-2026-003', @prov_dp_vinas, @sede_donpepe, @alm_dp_principal,
    'recibida', 1824.00, 328.32, 2152.32, 'Compra Vino Casillero del Diablo - 48 botellas',
    '2026-01-20 11:00:00', @usr_donpepe, @usr_donpepe, '2026-01-17 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM ordenes_compra WHERE numero_orden = 'OC-DP-2026-003');

INSERT INTO ordenes_compra (negocio_id, numero_orden, proveedor_id, sede_id, almacen_id,
    estado, subtotal, impuestos, total, notas, fecha_orden, usuario_id, creado_por, creado_en)
SELECT @n_donpepe, 'OC-DP-2026-008', @prov_dp_cartavio, @sede_donpepe, @alm_dp_principal,
    'recibida', 1740.00, 313.20, 2053.20, 'ReposiciÃ³n de Ron Cartavio - 60 unidades',
    '2026-02-20 10:00:00', @usr_donpepe, @usr_donpepe, '2026-02-18 15:00:00'
WHERE NOT EXISTS (SELECT 1 FROM ordenes_compra WHERE numero_orden = 'OC-DP-2026-008');

-- Orden pendiente Don Pepe
INSERT INTO ordenes_compra (negocio_id, numero_orden, proveedor_id, sede_id, almacen_id,
    estado, subtotal, impuestos, total, notas, fecha_orden, usuario_id, creado_por, creado_en)
SELECT @n_donpepe, 'OC-DP-2026-012', @prov_dp_backus, @sede_donpepe, @alm_dp_principal,
    'pendiente', 1520.00, 273.60, 1793.60, 'ReposiciÃ³n cerveza y gaseosas - Marzo',
    '2026-03-01 08:00:00', @usr_donpepe, @usr_donpepe, '2026-02-28 16:00:00'
WHERE NOT EXISTS (SELECT 1 FROM ordenes_compra WHERE numero_orden = 'OC-DP-2026-012');

-- Variables de Ã³rdenes
SET @oc_dp_001 = (SELECT id FROM ordenes_compra WHERE numero_orden = 'OC-DP-2026-001' LIMIT 1);
SET @oc_dp_002 = (SELECT id FROM ordenes_compra WHERE numero_orden = 'OC-DP-2026-002' LIMIT 1);
SET @oc_dp_003 = (SELECT id FROM ordenes_compra WHERE numero_orden = 'OC-DP-2026-003' LIMIT 1);
SET @oc_dp_008 = (SELECT id FROM ordenes_compra WHERE numero_orden = 'OC-DP-2026-008' LIMIT 1);
SET @oc_dp_012 = (SELECT id FROM ordenes_compra WHERE numero_orden = 'OC-DP-2026-012' LIMIT 1);


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  4. DETALLE Ã“RDENES DE COMPRA                               â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- OC-DP-2026-001 (Ron Cartavio, recibida)
INSERT INTO detalle_ordenes_compra (orden_compra_id, producto_id, cantidad_solicitada, cantidad_recibida,
    precio_unitario, subtotal, impuesto, total, esta_activo, creado_en)
SELECT @oc_dp_001, @dp_ron, 120.00, 120.00, 28.50, 3420.00, 615.60, 4035.60, 1, '2026-01-08 14:05:00'
WHERE @oc_dp_001 IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM detalle_ordenes_compra WHERE orden_compra_id = @oc_dp_001 AND producto_id = @dp_ron);

-- OC-DP-2026-002 (Cerveza + Gaseosa, recibida)
INSERT INTO detalle_ordenes_compra (orden_compra_id, producto_id, cantidad_solicitada, cantidad_recibida,
    precio_unitario, subtotal, impuesto, total, esta_activo, creado_en)
SELECT @oc_dp_002, @dp_cer, 240.00, 240.00, 3.80, 912.00, 164.16, 1076.16, 1, '2026-01-13 11:05:00'
WHERE @oc_dp_002 IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM detalle_ordenes_compra WHERE orden_compra_id = @oc_dp_002 AND producto_id = @dp_cer);

INSERT INTO detalle_ordenes_compra (orden_compra_id, producto_id, cantidad_solicitada, cantidad_recibida,
    precio_unitario, subtotal, impuesto, total, esta_activo, creado_en)
SELECT @oc_dp_002, @dp_gas, 60.00, 60.00, 3.50, 210.00, 37.80, 247.80, 1, '2026-01-13 11:06:00'
WHERE @oc_dp_002 IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM detalle_ordenes_compra WHERE orden_compra_id = @oc_dp_002 AND producto_id = @dp_gas);

INSERT INTO detalle_ordenes_compra (orden_compra_id, producto_id, cantidad_solicitada, cantidad_recibida,
    precio_unitario, subtotal, impuesto, total, esta_activo, creado_en)
SELECT @oc_dp_002, @dp_snk, 100.00, 100.00, 4.20, 420.00, 75.60, 495.60, 1, '2026-01-13 11:07:00'
WHERE @oc_dp_002 IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM detalle_ordenes_compra WHERE orden_compra_id = @oc_dp_002 AND producto_id = @dp_snk);

-- OC-DP-2026-003 (Vino, recibida)
INSERT INTO detalle_ordenes_compra (orden_compra_id, producto_id, cantidad_solicitada, cantidad_recibida,
    precio_unitario, subtotal, impuesto, total, esta_activo, creado_en)
SELECT @oc_dp_003, @dp_vin, 48.00, 48.00, 38.00, 1824.00, 328.32, 2152.32, 1, '2026-01-17 09:05:00'
WHERE @oc_dp_003 IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM detalle_ordenes_compra WHERE orden_compra_id = @oc_dp_003 AND producto_id = @dp_vin);

-- OC-DP-2026-008 (ReposiciÃ³n ron, recibida)
INSERT INTO detalle_ordenes_compra (orden_compra_id, producto_id, cantidad_solicitada, cantidad_recibida,
    precio_unitario, subtotal, impuesto, total, esta_activo, creado_en)
SELECT @oc_dp_008, @dp_ron, 60.00, 60.00, 29.00, 1740.00, 313.20, 2053.20, 1, '2026-02-18 15:05:00'
WHERE @oc_dp_008 IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM detalle_ordenes_compra WHERE orden_compra_id = @oc_dp_008 AND producto_id = @dp_ron);

-- OC-DP-2026-012 (Pendiente, no recibida aÃºn)
INSERT INTO detalle_ordenes_compra (orden_compra_id, producto_id, cantidad_solicitada, cantidad_recibida,
    precio_unitario, subtotal, impuesto, total, esta_activo, creado_en)
SELECT @oc_dp_012, @dp_cer, 300.00, 0.00, 3.80, 1140.00, 205.20, 1345.20, 1, '2026-02-28 16:05:00'
WHERE @oc_dp_012 IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM detalle_ordenes_compra WHERE orden_compra_id = @oc_dp_012 AND producto_id = @dp_cer);

INSERT INTO detalle_ordenes_compra (orden_compra_id, producto_id, cantidad_solicitada, cantidad_recibida,
    precio_unitario, subtotal, impuesto, total, esta_activo, creado_en)
SELECT @oc_dp_012, @dp_gas, 50.00, 0.00, 3.50, 175.00, 31.50, 206.50, 1, '2026-02-28 16:06:00'
WHERE @oc_dp_012 IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM detalle_ordenes_compra WHERE orden_compra_id = @oc_dp_012 AND producto_id = @dp_gas);
