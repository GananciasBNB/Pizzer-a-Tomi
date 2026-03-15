interface Category {
  id: string;
  name: string;
}

interface CategoryNavProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}

export default function CategoryNav({ categories, activeCategory, onSelectCategory }: CategoryNavProps) {
  return (
    <div className="sticky top-16 z-40 bg-nyblack/95 border-b border-gray-800/80 py-3 px-4 backdrop-blur-md">
      <div className="container mx-auto">
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`snap-start px-5 py-2.5 rounded-full text-sm font-bold flex-shrink-0 transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-nyred to-nyblue text-white shadow-[0_0_10px_rgba(210,38,48,0.3)] border border-nyred/30' 
                    : 'bg-gray-900/80 text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800/50'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
