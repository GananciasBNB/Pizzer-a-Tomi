import { useState } from 'react';
import CategoryNav from '../components/CategoryNav';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import CartDrawer from '../components/CartDrawer';
import { useMenuStore } from '../lib/menuStore';
import { useCartStore } from '../store/cartStore';
import type { BadgeVariant } from '../components/ui/Badge';

// Mapear status del menuStore a nuestras variantes de Badge
const toBadgeVariant = (status: string): BadgeVariant => {
  if (status === 'promo') return 'promo';
  if (status === 'limited') return 'limited';
  return 'popular';
};

export default function Home() {
  const { categories, products } = useMenuStore();
  const openModal = useCartStore(state => state.openModal);

  const visibleCategories = categories.filter(c => c.visible);
  const [activeCategory, setActiveCategory] = useState(visibleCategories[0]?.id ?? '');

  const filteredProducts = products.filter(p => p.categoryId === activeCategory && p.status !== 'sold-out');

  const handleOpenProduct = (productId: string) => {
    const menuProduct = products.find(p => p.id === productId);
    if (!menuProduct) return;
    // Adaptamos el schema del menuStore al formato que espera nuestro cartStore/modal
    openModal({
      id: menuProduct.id,
      categoryId: menuProduct.categoryId,
      name: menuProduct.name,
      description: menuProduct.description,
      price: menuProduct.price,
      imageUrl: menuProduct.image,
      badges: menuProduct.status !== 'normal'
        ? [{ text: menuProduct.promotionLabel ?? menuProduct.status, variant: toBadgeVariant(menuProduct.status) }]
        : undefined,
      baseIngredients: menuProduct.removableIngredients ?? [],
    });
  };

  return (
    <div className="flex flex-col w-full pb-20">

      {/* Hero Section */}
      <section className="relative h-[260px] sm:h-[420px] w-full bg-nyblack overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-t from-nyblack via-nyblack/80 to-transparent absolute inset-0 z-10" />
          <img
            src="https://images.unsplash.com/photo-1548369937-47519962c11a?q=80&w=1200&auto=format&fit=crop"
            alt="Horno a leña Pizzería Tomi"
            className="w-full h-full object-cover opacity-70"
            loading="eager"
          />
        </div>
        <div className="relative z-20 text-center px-4 mt-8">
          <span className="inline-block px-3 py-1 bg-gradient-to-r from-nyred to-nyblue text-white text-xs font-bold uppercase tracking-widest rounded-full mb-3 shadow-[0_0_15px_rgba(210,38,48,0.6)] border border-white/20">
            Especialidad de la casa
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-2 text-glow">
            100% Neoyorquina <br /> Artesanal
          </h1>
          <p className="text-gray-300 max-w-md mx-auto text-sm sm:text-base">
            Hechas a mano. Horneadas a la leña. El auténtico sabor de New York directo a tu mesa.
          </p>
        </div>
      </section>

      {/* Navegación de Categorías (Sticky) */}
      <CategoryNav
        categories={visibleCategories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      {/* Grilla de Productos */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-xl sm:text-2xl font-black mb-6 uppercase tracking-tight text-white border-b border-gray-800 pb-2">
          {visibleCategories.find(c => c.id === activeCategory)?.name ?? 'Menú'}
        </h2>

        {filteredProducts.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                imageUrl={product.image}
                badges={
                  product.status !== 'normal'
                    ? [{ text: product.promotionLabel ?? product.status, variant: toBadgeVariant(product.status) }]
                    : undefined
                }
                onAddClick={() => handleOpenProduct(product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No hay productos disponibles en esta categoría.</p>
          </div>
        )}
      </section>

      {/* Overlays globales */}
      <ProductModal />
      <CartDrawer />
    </div>
  );
}
