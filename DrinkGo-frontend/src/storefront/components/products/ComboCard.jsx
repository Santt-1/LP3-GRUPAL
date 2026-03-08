import { Gift, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/formatters';
import { useCartStore } from '../../stores/cartStore';
import toast from 'react-hot-toast';

export const ComboCard = ({ combo, slug }) => {
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = () => {
    // Normalizamos el combo para que sea compatible con el carrito
    const comboItem = {
      id: `combo-${combo.id}`,
      comboId: combo.id,
      isCombo: true,
      nombre: combo.nombre,
      descripcion: combo.descripcion,
      urlImagen: combo.urlImagen,
      precioVenta: combo.precioCombo,
    };
    addItem(comboItem, 1);
    toast.success('Combo agregado al carrito');
  };

  const descuento = combo.porcentajeDescuento
    ? Math.round(combo.porcentajeDescuento)
    : combo.precioRegular && combo.precioCombo
    ? Math.round(((combo.precioRegular - combo.precioCombo) / combo.precioRegular) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl border-2 border-amber-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative">
      {/* Badge descuento */}
      {descuento > 0 && (
        <div className="absolute top-2 left-2 z-10 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          -{descuento}%
        </div>
      )}

      {/* Badge combo */}
      <div className="absolute top-2 right-2 z-10 bg-purple-600 text-white text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
        <Gift size={10} />
        Combo
      </div>

      {/* Imagen */}
      <div className="aspect-square bg-amber-50 relative overflow-hidden">
        {combo.urlImagen ? (
          <img
            src={combo.urlImagen}
            alt={combo.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-amber-300">
            <Gift size={48} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight">
          {combo.nombre}
        </h3>
        {combo.descripcion && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{combo.descripcion}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div>
            {combo.precioRegular && combo.precioRegular > combo.precioCombo && (
              <span className="text-xs text-gray-400 line-through block">
                {formatCurrency(combo.precioRegular)}
              </span>
            )}
            <span className="text-lg font-bold text-amber-600">
              {formatCurrency(combo.precioCombo)}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            className="p-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
            title="Agregar combo al carrito"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
