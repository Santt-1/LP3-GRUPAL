-- ============================================================
-- SEED 05: INVENTARIO DEMO (ALMACENES, STOCK, LOTES, MOVIMIENTOS)
-- Solo para: DON PEPE LICORES - Sede Principal
-- Idempotente: usa WHERE NOT EXISTS para no duplicar al reiniciar backend
-- Dependencia: 03_negocios_demo.sql, 04_catalogo_demo.sql
-- ============================================================

USE drinkgo_db;

-- ============================================================
-- REFERENCIAS
-- ============================================================
SET @n_donpepe    = (SELECT id FROM negocios WHERE ruc = '20123456789' LIMIT 1);
SET @sede_donpepe = (SELECT id FROM sedes WHERE codigo = 'SEDE-PRINCIPAL' AND negocio_id = @n_donpepe LIMIT 1);

-- Productos DON PEPE
SET @dp_ron = (SELECT id FROM productos WHERE negocio_id = @n_donpepe AND sku = 'DP-RON-001' LIMIT 1);
SET @dp_cer = (SELECT id FROM productos WHERE negocio_id = @n_donpepe AND sku = 'DP-CER-001' LIMIT 1);
SET @dp_vin = (SELECT id FROM productos WHERE negocio_id = @n_donpepe AND sku = 'DP-VIN-001' LIMIT 1);
SET @dp_snk = (SELECT id FROM productos WHERE negocio_id = @n_donpepe AND sku = 'DP-SNK-001' LIMIT 1);
SET @dp_gas = (SELECT id FROM productos WHERE negocio_id = @n_donpepe AND sku = 'DP-GAS-001' LIMIT 1);

-- Usuario admin
SET @usr_donpepe = (SELECT id FROM usuarios WHERE negocio_id = @n_donpepe AND email = 'admin@donpepe.com' LIMIT 1);


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  1. ALMACENES  (Sede Principal Don Pepe Licores)            ║
-- ╚══════════════════════════════════════════════════════════════╝

INSERT INTO almacenes (negocio_id, sede_id, codigo, nombre, descripcion, es_predeterminado, esta_activo)
SELECT @n_donpepe, @sede_donpepe, 'DP-ALM-PRINCIPAL', 'Almacén Principal',
    'Almacén principal para productos de alta rotación', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM almacenes WHERE negocio_id = @n_donpepe AND codigo = 'DP-ALM-PRINCIPAL');

INSERT INTO almacenes (negocio_id, sede_id, codigo, nombre, descripcion, es_predeterminado, esta_activo)
SELECT @n_donpepe, @sede_donpepe, 'DP-ALM-FRIO', 'Almacén Refrigerado',
    'Espacio refrigerado para cervezas y bebidas frías', 0, 1
WHERE NOT EXISTS (SELECT 1 FROM almacenes WHERE negocio_id = @n_donpepe AND codigo = 'DP-ALM-FRIO');

-- Variables de almacenes
SET @alm_dp_principal = (SELECT id FROM almacenes WHERE negocio_id = @n_donpepe AND codigo = 'DP-ALM-PRINCIPAL' LIMIT 1);
SET @alm_dp_frio      = (SELECT id FROM almacenes WHERE negocio_id = @n_donpepe AND codigo = 'DP-ALM-FRIO'      LIMIT 1);


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  2. LOTES DE INVENTARIO                                     ║
-- ╚══════════════════════════════════════════════════════════════╝

INSERT INTO lotes_inventario (negocio_id, producto_id, almacen_id, numero_lote,
    fecha_ingreso, fecha_vencimiento, cantidad_inicial, cantidad_actual, costo_unitario, esta_activo, creado_en)
SELECT @n_donpepe, @dp_ron, @alm_dp_principal, 'DP-LT-2026-001',
    '2026-01-10', '2028-06-10', 120.00, 95.00, 28.50, 1, '2026-01-10 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM lotes_inventario WHERE negocio_id = @n_donpepe AND numero_lote = 'DP-LT-2026-001');

INSERT INTO lotes_inventario (negocio_id, producto_id, almacen_id, numero_lote,
    fecha_ingreso, fecha_vencimiento, cantidad_inicial, cantidad_actual, costo_unitario, esta_activo, creado_en)
SELECT @n_donpepe, @dp_cer, @alm_dp_frio, 'DP-LT-2026-002',
    '2026-01-15', '2026-07-15', 240.00, 180.00, 3.80, 1, '2026-01-15 10:00:00'
WHERE NOT EXISTS (SELECT 1 FROM lotes_inventario WHERE negocio_id = @n_donpepe AND numero_lote = 'DP-LT-2026-002');

INSERT INTO lotes_inventario (negocio_id, producto_id, almacen_id, numero_lote,
    fecha_ingreso, fecha_vencimiento, cantidad_inicial, cantidad_actual, costo_unitario, esta_activo, creado_en)
SELECT @n_donpepe, @dp_vin, @alm_dp_principal, 'DP-LT-2026-003',
    '2026-01-20', '2029-12-31', 48.00, 42.00, 38.00, 1, '2026-01-20 11:00:00'
WHERE NOT EXISTS (SELECT 1 FROM lotes_inventario WHERE negocio_id = @n_donpepe AND numero_lote = 'DP-LT-2026-003');

INSERT INTO lotes_inventario (negocio_id, producto_id, almacen_id, numero_lote,
    fecha_ingreso, fecha_vencimiento, cantidad_inicial, cantidad_actual, costo_unitario, esta_activo, creado_en)
SELECT @n_donpepe, @dp_snk, @alm_dp_principal, 'DP-LT-2026-004',
    '2026-02-01', '2026-08-01', 100.00, 72.00, 4.20, 1, '2026-02-01 08:30:00'
WHERE NOT EXISTS (SELECT 1 FROM lotes_inventario WHERE negocio_id = @n_donpepe AND numero_lote = 'DP-LT-2026-004');

INSERT INTO lotes_inventario (negocio_id, producto_id, almacen_id, numero_lote,
    fecha_ingreso, fecha_vencimiento, cantidad_inicial, cantidad_actual, costo_unitario, esta_activo, creado_en)
SELECT @n_donpepe, @dp_gas, @alm_dp_frio, 'DP-LT-2026-005',
    '2026-02-05', '2026-12-05', 60.00, 45.00, 3.50, 1, '2026-02-05 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM lotes_inventario WHERE negocio_id = @n_donpepe AND numero_lote = 'DP-LT-2026-005');

-- Segundo lote de ron (reposición reciente)
INSERT INTO lotes_inventario (negocio_id, producto_id, almacen_id, numero_lote,
    fecha_ingreso, fecha_vencimiento, cantidad_inicial, cantidad_actual, costo_unitario, esta_activo, creado_en)
SELECT @n_donpepe, @dp_ron, @alm_dp_principal, 'DP-LT-2026-006',
    '2026-02-20', '2028-08-20', 60.00, 60.00, 29.00, 1, '2026-02-20 10:00:00'
WHERE NOT EXISTS (SELECT 1 FROM lotes_inventario WHERE negocio_id = @n_donpepe AND numero_lote = 'DP-LT-2026-006');

-- ╔══════════════════════════════════════════════════════════════╗
-- ║  3. STOCK INVENTARIO (cantidad consolidada por producto)    ║
-- ║  Columnas: negocio_id, producto_id, almacen_id,             ║
-- ║            cantidad_actual, cantidad_disponible,             ║
-- ║            cantidad_reservada, costo_promedio               ║
-- ╚══════════════════════════════════════════════════════════════╝

INSERT INTO stock_inventario (negocio_id, producto_id, almacen_id, cantidad_actual, cantidad_disponible, cantidad_reservada, costo_promedio, esta_activo, creado_en)
SELECT @n_donpepe, @dp_ron, @alm_dp_principal, 155.00, 150.00, 5.00, 28.67, 1, '2026-01-10 09:05:00'
WHERE NOT EXISTS (SELECT 1 FROM stock_inventario WHERE negocio_id = @n_donpepe AND producto_id = @dp_ron AND almacen_id = @alm_dp_principal);

INSERT INTO stock_inventario (negocio_id, producto_id, almacen_id, cantidad_actual, cantidad_disponible, cantidad_reservada, costo_promedio, esta_activo, creado_en)
SELECT @n_donpepe, @dp_cer, @alm_dp_frio, 180.00, 175.00, 5.00, 3.80, 1, '2026-01-15 10:05:00'
WHERE NOT EXISTS (SELECT 1 FROM stock_inventario WHERE negocio_id = @n_donpepe AND producto_id = @dp_cer AND almacen_id = @alm_dp_frio);

INSERT INTO stock_inventario (negocio_id, producto_id, almacen_id, cantidad_actual, cantidad_disponible, cantidad_reservada, costo_promedio, esta_activo, creado_en)
SELECT @n_donpepe, @dp_vin, @alm_dp_principal, 42.00, 42.00, 0.00, 38.00, 1, '2026-01-20 11:05:00'
WHERE NOT EXISTS (SELECT 1 FROM stock_inventario WHERE negocio_id = @n_donpepe AND producto_id = @dp_vin AND almacen_id = @alm_dp_principal);

INSERT INTO stock_inventario (negocio_id, producto_id, almacen_id, cantidad_actual, cantidad_disponible, cantidad_reservada, costo_promedio, esta_activo, creado_en)
SELECT @n_donpepe, @dp_snk, @alm_dp_principal, 72.00, 72.00, 0.00, 4.20, 1, '2026-02-01 08:35:00'
WHERE NOT EXISTS (SELECT 1 FROM stock_inventario WHERE negocio_id = @n_donpepe AND producto_id = @dp_snk AND almacen_id = @alm_dp_principal);

INSERT INTO stock_inventario (negocio_id, producto_id, almacen_id, cantidad_actual, cantidad_disponible, cantidad_reservada, costo_promedio, esta_activo, creado_en)
SELECT @n_donpepe, @dp_gas, @alm_dp_frio, 45.00, 45.00, 0.00, 3.50, 1, '2026-02-05 09:05:00'
WHERE NOT EXISTS (SELECT 1 FROM stock_inventario WHERE negocio_id = @n_donpepe AND producto_id = @dp_gas AND almacen_id = @alm_dp_frio);

-- ╔══════════════════════════════════════════════════════════════╗
-- ║  4. MOVIMIENTOS DE INVENTARIO                               ║
-- ║  Enum: entrada|salida|transferencia|ajuste_positivo|        ║
-- ║        ajuste_negativo|devolucion|merma                     ║
-- ╚══════════════════════════════════════════════════════════════╝

-- Variables de lotes
SET @lt_dp_001 = (SELECT id FROM lotes_inventario WHERE negocio_id = @n_donpepe AND numero_lote = 'DP-LT-2026-001' LIMIT 1);
SET @lt_dp_002 = (SELECT id FROM lotes_inventario WHERE negocio_id = @n_donpepe AND numero_lote = 'DP-LT-2026-002' LIMIT 1);
SET @lt_dp_003 = (SELECT id FROM lotes_inventario WHERE negocio_id = @n_donpepe AND numero_lote = 'DP-LT-2026-003' LIMIT 1);
SET @lt_dp_004 = (SELECT id FROM lotes_inventario WHERE negocio_id = @n_donpepe AND numero_lote = 'DP-LT-2026-004' LIMIT 1);
SET @lt_dp_005 = (SELECT id FROM lotes_inventario WHERE negocio_id = @n_donpepe AND numero_lote = 'DP-LT-2026-005' LIMIT 1);
SET @lt_dp_006 = (SELECT id FROM lotes_inventario WHERE negocio_id = @n_donpepe AND numero_lote = 'DP-LT-2026-006' LIMIT 1);

INSERT INTO movimientos_inventario (negocio_id, producto_id, almacen_origen_id, tipo_movimiento,
    cantidad, costo_unitario, monto_total, motivo_movimiento, referencia_documento,
    usuario_id, fecha_movimiento, lote_id, esta_activo, creado_en)
SELECT @n_donpepe, @dp_ron, @alm_dp_principal, 'entrada',
    120.00, 28.50, 3420.00, 'Compra inicial de Ron Cartavio Black 750ml', 'OC-DP-2026-001',
    @usr_donpepe, '2026-01-10 09:00:00', @lt_dp_001, 1, '2026-01-10 09:05:00'
WHERE NOT EXISTS (SELECT 1 FROM movimientos_inventario WHERE negocio_id = @n_donpepe AND referencia_documento = 'OC-DP-2026-001');

INSERT INTO movimientos_inventario (negocio_id, producto_id, almacen_origen_id, tipo_movimiento,
    cantidad, costo_unitario, monto_total, motivo_movimiento, referencia_documento,
    usuario_id, fecha_movimiento, lote_id, esta_activo, creado_en)
SELECT @n_donpepe, @dp_cer, @alm_dp_frio, 'entrada',
    240.00, 3.80, 912.00, 'Compra de Cerveza Pilsen Callao 630ml', 'OC-DP-2026-002',
    @usr_donpepe, '2026-01-15 10:00:00', @lt_dp_002, 1, '2026-01-15 10:05:00'
WHERE NOT EXISTS (SELECT 1 FROM movimientos_inventario WHERE negocio_id = @n_donpepe AND referencia_documento = 'OC-DP-2026-002');

INSERT INTO movimientos_inventario (negocio_id, producto_id, almacen_origen_id, tipo_movimiento,
    cantidad, costo_unitario, monto_total, motivo_movimiento, referencia_documento,
    usuario_id, fecha_movimiento, lote_id, esta_activo, creado_en)
SELECT @n_donpepe, @dp_vin, @alm_dp_principal, 'entrada',
    48.00, 38.00, 1824.00, 'Compra de Vino Casillero del Diablo', 'OC-DP-2026-003',
    @usr_donpepe, '2026-01-20 11:00:00', @lt_dp_003, 1, '2026-01-20 11:05:00'
WHERE NOT EXISTS (SELECT 1 FROM movimientos_inventario WHERE negocio_id = @n_donpepe AND referencia_documento = 'OC-DP-2026-003');

-- Don Pepe: Ventas (salidas)
INSERT INTO movimientos_inventario (negocio_id, producto_id, almacen_origen_id, tipo_movimiento,
    cantidad, costo_unitario, monto_total, motivo_movimiento, referencia_documento,
    usuario_id, fecha_movimiento, lote_id, esta_activo, creado_en)
SELECT @n_donpepe, @dp_ron, @alm_dp_principal, 'salida',
    25.00, 28.50, 712.50, 'Venta al público - Enero', 'VTA-DP-2026-015',
    @usr_donpepe, '2026-01-25 16:00:00', @lt_dp_001, 1, '2026-01-25 16:05:00'
WHERE NOT EXISTS (SELECT 1 FROM movimientos_inventario WHERE negocio_id = @n_donpepe AND referencia_documento = 'VTA-DP-2026-015');

INSERT INTO movimientos_inventario (negocio_id, producto_id, almacen_origen_id, tipo_movimiento,
    cantidad, costo_unitario, monto_total, motivo_movimiento, referencia_documento,
    usuario_id, fecha_movimiento, lote_id, esta_activo, creado_en)
SELECT @n_donpepe, @dp_cer, @alm_dp_frio, 'salida',
    60.00, 3.80, 228.00, 'Venta al público - Febrero', 'VTA-DP-2026-042',
    @usr_donpepe, '2026-02-10 18:00:00', @lt_dp_002, 1, '2026-02-10 18:05:00'
WHERE NOT EXISTS (SELECT 1 FROM movimientos_inventario WHERE negocio_id = @n_donpepe AND referencia_documento = 'VTA-DP-2026-042');

-- Don Pepe: Reposición
INSERT INTO movimientos_inventario (negocio_id, producto_id, almacen_origen_id, tipo_movimiento,
    cantidad, costo_unitario, monto_total, motivo_movimiento, referencia_documento,
    usuario_id, fecha_movimiento, lote_id, esta_activo, creado_en)
SELECT @n_donpepe, @dp_ron, @alm_dp_principal, 'entrada',
    60.00, 29.00, 1740.00, 'Reposición de Ron Cartavio - Lote nuevo', 'OC-DP-2026-008',
    @usr_donpepe, '2026-02-20 10:00:00', @lt_dp_006, 1, '2026-02-20 10:05:00'
WHERE NOT EXISTS (SELECT 1 FROM movimientos_inventario WHERE negocio_id = @n_donpepe AND referencia_documento = 'OC-DP-2026-008');

-- Don Pepe: Merma
INSERT INTO movimientos_inventario (negocio_id, producto_id, almacen_origen_id, tipo_movimiento,
    cantidad, costo_unitario, monto_total, motivo_movimiento, referencia_documento,
    usuario_id, fecha_movimiento, lote_id, esta_activo, creado_en)
SELECT @n_donpepe, @dp_snk, @alm_dp_principal, 'merma',
    3.00, 4.20, 12.60, 'Productos dañados durante almacenamiento', 'MRM-DP-2026-001',
    @usr_donpepe, '2026-02-18 14:00:00', @lt_dp_004, 1, '2026-02-18 14:05:00'
WHERE NOT EXISTS (SELECT 1 FROM movimientos_inventario WHERE negocio_id = @n_donpepe AND referencia_documento = 'MRM-DP-2026-001');


