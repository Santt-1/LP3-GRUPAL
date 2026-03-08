/**
 * Selector de productos para pedido manual
 * Permite buscar y agregar productos al carrito
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBuscarProductosConStock } from '@/admin/hooks/useProductos';
import { combosService } from '@/admin/catalogo/services/catalogoService';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { message } from '@/shared/utils/notifications';
import { Search, Plus, Minus, Trash2, Package, Loader2, AlertTriangle, Gift } from 'lucide-react';

export function SelectorProductos({ items = [], onItemsChange, negocioId }) {
  const [busqueda, setBusqueda] = useState('');

  const debouncedSearch = useDebounce(busqueda, 400);
  const { data: productosEncontrados = [], isLoading: buscandoProductos } =
    useBuscarProductosConStock(negocioId, debouncedSearch, debouncedSearch.trim().length >= 2);

  const { data: todosLosCombos = [] } = useQuery({
    queryKey: ['combos-negocio', negocioId],
    queryFn: () => combosService.getByNegocio(negocioId),
    enabled: !!negocioId,
    staleTime: 5 * 60 * 1000,
  });

  const combosEncontrados = debouncedSearch.trim().length >= 2
    ? todosLosCombos.filter((c) =>
        c.nombre?.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : [];
  
  const stockDeProducto = (producto) => {
    const s = producto.stock;
    if (s === null || s === undefined) return null;
    return typeof s === 'object' ? parseFloat(s) : Number(s);
  };

  const agregarProducto = (producto) => {
    const stockDisponible = stockDeProducto(producto);

    // Verificar si ya existe en el carrito
    const existente = items.find(item => item.productoId === producto.id && !item.comboId);

    if (existente) {
      const nuevaCantidad = existente.cantidad + 1;
      if (existente.stock !== null && existente.stock !== undefined && nuevaCantidad > existente.stock) {
        message.warning(`Stock insuficiente. Solo quedan ${existente.stock} unidades disponibles de "${existente.nombreProducto}".`);
        return;
      }
      onItemsChange(
        items.map(item =>
          item.productoId === producto.id
            ? { ...item, cantidad: nuevaCantidad }
            : item
        )
      );
    } else {
      if (stockDisponible !== null && stockDisponible <= 0) {
        message.warning(`"${producto.nombre}" no tiene stock disponible.`);
        return;
      }
      onItemsChange([
        ...items,
        {
          productoId: producto.id,
          nombreProducto: producto.nombre,
          skuProducto: producto.sku,
          cantidad: 1,
          precioUnitario: parseFloat(producto.precioVenta || 0),
          stock: stockDisponible,
        },
      ]);
    }

    setBusqueda('');
  };
  
  const cambiarCantidad = (itemKey, nuevaCantidad, esCombo = false) => {
    if (nuevaCantidad <= 0) {
      eliminarItem(itemKey, esCombo);
      return;
    }

    if (!esCombo) {
      const item = items.find(i => i.productoId === itemKey);
      if (item?.stock !== null && item?.stock !== undefined && nuevaCantidad > item.stock) {
        message.warning(`Stock insuficiente. Solo hay ${item.stock} unidades disponibles de "${item.nombreProducto}".`);
        return;
      }
    }

    onItemsChange(
      items.map(i =>
        (esCombo ? i.comboId === itemKey : i.productoId === itemKey)
          ? { ...i, cantidad: nuevaCantidad }
          : i
      )
    );
  };
  
  const eliminarItem = (itemKey, esCombo = false) => {
    onItemsChange(items.filter(i => esCombo ? i.comboId !== itemKey : i.productoId !== itemKey));
  };

  const agregarCombo = (combo) => {
    const itemKey = `combo-${combo.id}`;
    const existente = items.find(item => item.comboId === combo.id);
    if (existente) {
      onItemsChange(
        items.map(item =>
          item.comboId === combo.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      );
    } else {
      onItemsChange([
        ...items,
        {
          comboId: combo.id,
          nombreProducto: combo.nombre,
          skuProducto: null,
          cantidad: 1,
          precioUnitario: parseFloat(combo.precioCombo || 0),
          stock: null,
        },
      ]);
    }
    setBusqueda('');
  };
  
  const calcularSubtotal = (item) => {
    return item.precioUnitario * item.cantidad;
  };
  
  const calcularTotal = () => {
    return items.reduce((total, item) => total + calcularSubtotal(item), 0);
  };
  
  return (
    <div className="space-y-4">
      {/* Buscador de productos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Buscar Producto *
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {buscandoProductos && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
          )}
        </div>
        
        {/* Resultados de búsqueda */}
        {debouncedSearch.trim().length >= 2 && (productosEncontrados.length > 0 || combosEncontrados.length > 0) && (
          <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {combosEncontrados.map((combo) => (
              <button
                key={`combo-${combo.id}`}
                type="button"
                onClick={() => agregarCombo(combo)}
                className="w-full text-left px-4 py-3 hover:bg-purple-50 border-b border-gray-100 last:border-b-0 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-purple-600" />
                    <p className="font-medium text-gray-900">{combo.nombre}</p>
                    <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">Combo</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                    {combo.precioRegular && <span className="line-through text-gray-400">S/ {parseFloat(combo.precioRegular).toFixed(2)}</span>}
                    <span className="font-semibold text-purple-600">S/ {parseFloat(combo.precioCombo || 0).toFixed(2)}</span>
                  </div>
                </div>
                <Plus className="w-5 h-5 text-purple-600" />
              </button>
            ))}
            {productosEncontrados.map((producto) => (
              <button
                key={producto.id}
                type="button"
                onClick={() => agregarProducto(producto)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">{producto.nombre}</p>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                    <span className="font-semibold text-blue-600">S/ {parseFloat(producto.precioVenta || 0).toFixed(2)}</span>
                    <span>• SKU: {producto.sku}</span>
                    {producto.stock !== null && producto.stock !== undefined && (
                      <span className={producto.stock > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        • Stock: {producto.stock}
                      </span>
                    )}
                  </div>
                </div>
                <Plus className="w-5 h-5 text-blue-600" />
              </button>
            ))}
          </div>
        )}
        
        {/* Sin resultados */}
        {debouncedSearch.trim().length >= 2 && 
         !buscandoProductos && 
         productosEncontrados.length === 0 &&
         combosEncontrados.length === 0 && (
          <p className="mt-2 text-sm text-gray-500">
            No se encontraron productos
          </p>
        )}
      </div>
      
      {/* Lista de productos seleccionados (Carrito) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Productos Seleccionados
          </label>
          <span className="text-sm text-gray-500">
            {items.length} {items.length === 1 ? 'producto' : 'productos'}
          </span>
        </div>
        
        {items.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No hay productos agregados</p>
            <p className="text-sm text-gray-500 mt-1">
              Busca y agrega productos arriba
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
            {items.map((item) => (
              <div key={item.comboId ? `combo-${item.comboId}` : item.productoId} className="p-4 flex items-center gap-4">
                {/* Info del producto */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {item.comboId && <Gift className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
                    <p className="font-medium text-gray-900 truncate">
                      {item.nombreProducto}
                    </p>
                    {item.comboId && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full shrink-0">Combo</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 flex-wrap">
                    <span>S/ {item.precioUnitario.toFixed(2)}</span>
                    {item.skuProducto && <><span>•</span><span>SKU: {item.skuProducto}</span></>}
                    {item.stock !== null && item.stock !== undefined && (
                      <>
                        <span>•</span>
                        <span className={`inline-flex items-center gap-1 font-medium ${
                          item.cantidad > item.stock
                            ? 'text-red-600'
                            : item.stock <= 5
                              ? 'text-orange-500'
                              : 'text-green-600'
                        }`}>
                          {item.cantidad > item.stock && <AlertTriangle className="w-3.5 h-3.5" />}
                          Stock disponible: {item.stock}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Controlador de cantidad */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => cambiarCantidad(item.comboId ?? item.productoId, item.cantidad - 1, !!item.comboId)}
                    className="p-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  
                  <input
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) => cambiarCantidad(item.comboId ?? item.productoId, parseInt(e.target.value) || 1, !!item.comboId)}
                    className="w-16 px-2 py-1.5 text-center border border-gray-300 rounded-lg"
                  />
                  
                  <button
                    type="button"
                    onClick={() => cambiarCantidad(item.comboId ?? item.productoId, item.cantidad + 1, !!item.comboId)}
                    disabled={!item.comboId && item.stock !== null && item.stock !== undefined && item.cantidad >= item.stock}
                    className="p-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    title={!item.comboId && item.stock !== null && item.cantidad >= item.stock ? `Stock máximo alcanzado (${item.stock})` : undefined}
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                
                {/* Subtotal */}
                <div className="text-right min-w-[80px]">
                  <p className="font-semibold text-gray-900">
                    S/ {calcularSubtotal(item).toFixed(2)}
                  </p>
                </div>
                
                {/* Botón eliminar */}
                <button
                  type="button"
                  onClick={() => eliminarItem(item.comboId ?? item.productoId, !!item.comboId)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {/* Total de items */}
            <div className="p-4 bg-blue-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Subtotal ({items.length} {items.length === 1 ? 'producto' : 'productos'})
                </span>
                <span className="text-lg font-bold text-gray-900">
                  S/ {calcularTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Advertencia global de stock */}
      {items.some(item => item.stock !== null && item.stock !== undefined && item.cantidad > item.stock) && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">
            <strong>Atención:</strong> hay productos que superan el stock disponible. Reduce las cantidades antes de guardar.
          </p>
        </div>
      )}
    </div>
  );
}
