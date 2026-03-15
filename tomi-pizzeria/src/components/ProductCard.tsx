import { Plus } from 'lucide-react';
import Badge from './ui/Badge';
import type { BadgeVariant } from './ui/Badge';

export interface ProductProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  badges?: { text: string; variant: BadgeVariant }[];
  onAddClick: () => void;
}

export default function ProductCard({ name, description, price, imageUrl, badges, onAddClick }: ProductProps) {
  return (
    <div className="group relative border border-gray-800/60 rounded-2xl p-4 bg-gray-900/40 hover:bg-gray-800/80 transition-all duration-300 hover:border-nyblue/30 overflow-hidden flex flex-col h-full shadow-lg hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
      
      {/* Badges Container */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-1.5 items-start">
        {badges?.map((badge, idx) => (
          <Badge key={idx} text={badge.text} variant={badge.variant} />
        ))}
      </div>

      {/* Image with overlay effect */}
      <div className="relative w-full h-48 rounded-xl mb-4 overflow-hidden bg-gray-800">
        <div className="absolute inset-0 bg-gradient-to-t from-nyblack/90 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
        <img 
          src={imageUrl} 
          alt={name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow">
        <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tight">{name}</h3>
        <p className="text-sm text-gray-400 mb-4 line-clamp-3 flex-grow">{description}</p>
        
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-800/50">
          <span className="font-black text-nygold text-xl group-hover:text-white transition-colors">
            ${price.toLocaleString('es-AR')}
          </span>
          <button 
            onClick={onAddClick}
            className="flex items-center gap-1 bg-white text-nyblack px-4 py-2 rounded-full font-bold text-sm hover:bg-gradient-to-r hover:from-nyblue hover:to-nyred hover:text-white transition-all shadow-sm group-hover:shadow-[0_0_15px_rgba(210,38,48,0.4)]"
          >
            <span>Añadir</span>
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}
