export type BadgeVariant = 'new' | 'popular' | 'limited' | 'promo' | 'default';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ text, variant = 'default', className = '' }: BadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'new':
        // Verde vibrante para novedades
        return 'bg-gradient-to-r from-nygreen to-nyblue text-white shadow-[0_0_10px_rgba(0,140,69,0.5)] border border-nygreen/50 animate-pulse';
      case 'popular':
        // Rojo intenso para populares
        return 'bg-gradient-to-r from-nyred to-nyblue text-white shadow-[0_0_10px_rgba(210,38,48,0.5)] border border-nyred/50';
      case 'limited':
        // Dorado llamativo para tiempo limitado
        return 'bg-nygold text-nyblack font-black border border-nygold/50 shadow-[0_0_10px_rgba(244,162,97,0.5)]';
      case 'promo':
        // Tricolor italoamericano para promociones top
        return 'bg-gradient-to-r from-nygreen via-nyred to-nyblue text-white font-black border border-white/20 shadow-lg';
      default:
        // Neutro discreto
        return 'bg-gray-800 text-gray-300 border border-gray-700';
    }
  };

  return (
    <span className={`inline-flex px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full ${getVariantStyles()} ${className}`}>
      {text}
    </span>
  );
}
