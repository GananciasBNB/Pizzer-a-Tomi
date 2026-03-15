import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

export default function Header() {
  const { items, toggleCart } = useCartStore();
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-nyblack/90 backdrop-blur-md relative">
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-nygreen via-nyred to-nyblue opacity-90" />
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-nyred to-nyblue rounded-full flex items-center justify-center font-bold text-xl italic tracking-tighter text-white shadow-lg border border-white/10">
              T
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black tracking-tight text-white uppercase drop-shadow-md">Tomi's</span>
              <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">New York Pizza</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.35em] text-gray-300">
            <Link to="/" className="hover:text-nyGold transition-colors">
              Menú
            </Link>
            <Link to="/admin" className="text-nyGold hover:text-white transition-colors">
              Admin
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/checkout"
            className="text-xs uppercase tracking-[0.4em] text-gray-300 border border-white/20 px-3 py-2 rounded-full hover:border-nyGold"
          >
            Checkout
          </Link>
          <button
            onClick={toggleCart}
            className="relative p-2 text-white hover:text-nygreen transition-colors"
          >
            <ShoppingBag size={24} />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-nygreen text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center translate-x-1 -translate-y-1 shadow-md border border-nyblack">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
