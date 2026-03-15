import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

export default function CartDrawer() {
  const { isCartOpen, toggleCart, items, removeFromCart, updateQuantity } = useCartStore();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    toggleCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay fondo oscuro */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={toggleCart} 
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-nyblack h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-800">
          <div className="flex items-center gap-2 text-white">
            <ShoppingBag size={24} className="text-nyred" />
            <h2 className="text-xl font-black uppercase tracking-tight">Tu Orden</h2>
          </div>
          <button 
            onClick={toggleCart}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 no-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <ShoppingBag size={64} className="mb-4 text-gray-600" />
              <p className="text-lg font-bold text-gray-400">Tu carrito está vacío</p>
              <p className="text-sm text-gray-500">¡Agrega unas pizzas estilo NY!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex gap-4 pb-6 border-b border-gray-800/50 last:border-0">
                  {/* Item Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-800">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Item Info */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-white text-sm sm:text-base leading-tight">{item.name}</h3>
                      <button 
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-gray-500 hover:text-nyred transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    {item.size && (
                      <span className="text-xs text-nygold font-black uppercase tracking-wider mb-1">
                        Tamaño: {item.size}
                      </span>
                    )}

                    {item.removedIngredients.length > 0 && (
                      <span className="text-[10px] text-gray-500 line-through mb-2">
                        Sin: {item.removedIngredients.join(', ')}
                      </span>
                    )}
                    
                    <div className="mt-auto flex items-center justify-between">
                      <span className="font-bold text-white">
                        ${(item.price * item.quantity).toLocaleString('es-AR')}
                      </span>
                      
                      {/* Quantity Controls Compact */}
                      <div className="flex items-center gap-3 bg-gray-900 rounded-lg p-1 border border-gray-800">
                        <button 
                          onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                          className="text-gray-400 hover:text-white"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Checkout */}
        {items.length > 0 && (
          <div className="p-5 sm:p-6 bg-nyblack border-t border-gray-800 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 font-bold uppercase tracking-wider text-sm">Total a Pagar</span>
              <span className="text-2xl font-black text-white">${total.toLocaleString('es-AR')}</span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 bg-nyred text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-nyred/90 transition-colors shadow-[0_5px_20px_rgba(210,38,48,0.4)]"
            >
              Confirmar Pedido <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
