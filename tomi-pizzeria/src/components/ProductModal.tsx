import { useState, useEffect } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export default function ProductModal() {
  const { isModalOpen, closeModal, selectedProduct, addToCart } = useCartStore();

  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<'Mediana' | 'Familiar'>('Mediana');
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);

  // Reset state when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setQuantity(1);
      setSize('Mediana');
      setRemovedIngredients([]);
    }
  }, [isModalOpen, selectedProduct]);

  if (!isModalOpen || !selectedProduct) return null;

  const isPizza = selectedProduct.categoryId === 'ny-style' || selectedProduct.categoryId === 'half-half';
  
  // Base price + familiar extra ($4000)
  const finalPrice = selectedProduct.price + (size === 'Familiar' ? 4000 : 0);

  const toggleIngredient = (ingredient: string) => {
    setRemovedIngredients(prev => 
      prev.includes(ingredient) 
        ? prev.filter(i => i !== ingredient) 
        : [...prev, ingredient]
    );
  };

  const handleAddToCart = () => {
    addToCart({
      cartItemId: `${selectedProduct.id}-${size}-${removedIngredients.join('-')}-${Date.now()}`,
      productId: selectedProduct.id,
      name: selectedProduct.name,
      price: finalPrice,
      size: isPizza ? size : undefined,
      removedIngredients,
      quantity,
      imageUrl: selectedProduct.imageUrl,
    });
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Overlay cierre */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeModal} />
      
      {/* Modal panel - flex column completo */}
      <div 
        className="relative w-full sm:max-w-lg bg-nyblack border-t sm:border border-gray-800 sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Image */}
        <div className="relative h-48 sm:h-56 w-full flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-nyblack via-transparent to-transparent z-10" />
          <img 
            src={selectedProduct.imageUrl} 
            alt={selectedProduct.name}
            className="w-full h-full object-cover"
          />
          <button 
            onClick={closeModal}
            className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-nyred text-white p-2 rounded-full backdrop-blur-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Scrollable - sin padding bottom extra, el footer es exterior */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-2">
            {selectedProduct.name}
          </h2>
          <p className="text-gray-400 text-sm mb-6 pb-6 border-b border-gray-800">
            {selectedProduct.description}
          </p>

          {isPizza && (
            <>
              {/* Size Selection */}
              <div className="mb-8">
                <h3 className="text-white font-bold mb-3 uppercase tracking-wider text-sm">Tamaño</h3>
              <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSize('Mediana'); }}
                    className={`p-3 rounded-xl border ${size === 'Mediana' ? 'bg-nyred/10 border-nyred text-white' : 'border-gray-800 text-gray-400 hover:border-gray-600'}`}
                  >
                    <div className="font-bold">Mediana</div>
                    <div className="text-xs opacity-70">8 porciones</div>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSize('Familiar'); }}
                    className={`p-3 rounded-xl border ${size === 'Familiar' ? 'bg-nyblue/10 border-nyblue text-white shadow-[0_0_15px_rgba(10,49,97,0.3)]' : 'border-gray-800 text-gray-400 hover:border-gray-600'}`}
                  >
                    <div className="font-bold">Familiar Neoyorquina</div>
                    <div className="text-xs opacity-70">+ $4.000 (Gigante)</div>
                  </button>
                </div>
              </div>

              {/* Ingredients Removal */}
              {selectedProduct.baseIngredients && selectedProduct.baseIngredients.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-white font-bold mb-1 uppercase tracking-wider text-sm">¿Quitar Ingredientes?</h3>
                  <p className="text-xs text-gray-500 mb-3">Toca para eliminar lo que no desees.</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.baseIngredients.map(ing => {
                      const isRemoved = removedIngredients.includes(ing);
                      return (
                        <button
                          key={ing}
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleIngredient(ing); }}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                            isRemoved 
                              ? 'bg-nyred/20 border-nyred text-nyred line-through' 
                              : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {ing}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Quantity selector */}
          <div className="flex items-center justify-between bg-gray-900 rounded-2xl p-2 max-w-xs mx-auto mt-8 border border-gray-800">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-3 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors"
            >
              <Minus size={20} />
            </button>
            <span className="font-black text-xl w-12 text-center text-white">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="p-3 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Footer FUERA del área scrollable - sin absolute, normal flow */}
        <div className="flex-shrink-0 bg-nyblack/95 backdrop-blur-md p-4 sm:p-5 border-t border-gray-800/80">
          <button 
            type="button"
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-nygreen via-nyred to-nyblue text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(210,38,48,0.3)]"
          >
            Añadir ${(finalPrice * quantity).toLocaleString('es-AR')}
          </button>
        </div>

      </div>
    </div>
  );
}
