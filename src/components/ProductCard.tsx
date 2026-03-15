import { Product } from '../lib/menuStore'

const statusStyles: Record<Product['status'], string> = {
  normal: 'bg-gray-800 text-gray-200',
  promo: 'bg-nyRed/90 text-white',
  limited: 'bg-gradient-to-r from-[#F77F00] via-[#FFB703] to-[#D62828] text-white',
  'sold-out': 'bg-gray-700 text-gray-300',
}

interface ProductCardProps {
  product: Product
  categoryName: string
}

export default function ProductCard({ product, categoryName }: ProductCardProps) {
  return (
    <article className="border border-gray-800/70 rounded-3xl bg-gradient-to-b from-[#0f0f0f]/80 to-[#1a1a1a]/80 p-5 shadow-lg shadow-black/40 flex flex-col gap-4">
      <div className="relative rounded-2xl overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-[210px] object-cover brightness-90 transition duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
        <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 text-xs uppercase tracking-[0.2em] font-semibold">
          {categoryName}
        </span>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-white leading-tight tracking-tight">{product.name}</h3>
          <p className="text-sm text-gray-300/90 line-clamp-3">{product.description}</p>
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          <span className="text-gray-400 text-xs uppercase tracking-widest">Precio</span>
          <span className="text-xl font-bold text-nyGold">${product.price.toLocaleString('es-AR')}</span>
          <span className="text-[11px] uppercase tracking-[0.4em] text-gray-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em]">
        <span className={`rounded-full px-3 py-1 ${statusStyles[product.status]}`}>{product.status}</span>
        {product.promotionLabel && (
          <span className="rounded-full px-3 py-1 bg-nyRed text-white">{product.promotionLabel}</span>
        )}
        {product.timeLabel && (
          <span className="rounded-full px-3 py-1 bg-gray-800 text-gray-200">{product.timeLabel}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-gray-400">
        {product.tags.map((tag) => (
          <span key={tag} className="px-3 py-1 bg-white/10 rounded-full">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between gap-3">
        <button className="bg-transparent border border-gray-700 px-4 py-2 text-sm font-semibold uppercase tracking-wider rounded-full hover:border-nyRed hover:text-nyGold transition">
          Ver detalles
        </button>
        <button className="bg-nyGold text-nyBlack px-4 py-2 rounded-full font-black text-sm uppercase tracking-[0.3em] shadow-[0_15px_35px_rgba(247,127,0,0.35)]">
          Añadir
        </button>
      </div>
    </article>
  )
}
