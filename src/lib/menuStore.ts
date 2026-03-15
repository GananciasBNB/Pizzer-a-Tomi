import { create } from 'zustand'

export type ProductStatus = 'normal' | 'promo' | 'limited' | 'sold-out'

export interface Category {
  id: string
  name: string
  description: string
  visible: boolean
  accent: string
}

export interface Ingredient {
  id: string
  name: string
  stock: number
  active: boolean
  notes?: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  categoryId: string
  status: ProductStatus
  tags: string[]
  extras: string[]
  stock: number
  promotionLabel?: string
  timeLabel?: string
}

export interface HeroBanner {
  id: string
  title: string
  tagline: string
  cta: string
  accentColor: string
  status: 'live' | 'draft'
}

interface MenuStore {
  categories: Category[]
  products: Product[]
  ingredients: Ingredient[]
  heroBanners: HeroBanner[]
  addCategory: (category: Omit<Category, 'id'>) => void
  updateCategory: (id: string, data: Partial<Omit<Category, 'id'>>) => void
  addProduct: (product: Omit<Product, 'id'>) => void
  updateProduct: (id: string, data: Partial<Omit<Product, 'id'>>) => void
  adjustProductStock: (id: string, amount: number) => void
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => void
  updateIngredient: (id: string, data: Partial<Omit<Ingredient, 'id'>>) => void
  addHeroBanner: (hero: Omit<HeroBanner, 'id'>) => void
  updateHeroBanner: (id: string, data: Partial<Omit<HeroBanner, 'id'>>) => void
}

const randomId = () => Math.random().toString(36).slice(2, 9)

export const useMenuStore = create<MenuStore>((set) => ({
  categories: [
    {
      id: 'cat-pizzas',
      name: 'Pizzas Clásicas & NY',
      description: 'Medianas y familiares hechas al horno de leña de Tomi.',
      visible: true,
      accent: '#F77F00',
    },
    {
      id: 'cat-especiales',
      name: 'Especiales y Gourmet',
      description: 'Combinaciones de autor con ingredientes premium.',
      visible: true,
      accent: '#D62828',
    },
    {
      id: 'cat-extras',
      name: 'Bebidas & Extras Bites',
      description: 'Agregados crujientes, dips y gaseosas heladas.',
      visible: true,
      accent: '#FFB703',
    },
  ],
  products: [
    {
      id: 'prod-001',
      name: 'Pepperoni Clásica',
      description: 'Doble capa de pepperoni, queso muzzarella artesanal y toque de oregano.',
      price: 12000,
      image: 'https://images.unsplash.com/photo-1548369937-47519962c11a?q=80&w=1200&auto=format&fit=crop',
      categoryId: 'cat-pizzas',
      status: 'promo',
      tags: ['Con queso extra', 'Popular'],
      extras: ['Masa fina', 'Masa alta'],
      stock: 12,
      promotionLabel: 'Promo 2x1',
    },
    {
      id: 'prod-002',
      name: 'Cuatro Quesos Tomi',
      description: 'Muzzarella, provolone, parmesano y queso azul con reducción de honey.',
      price: 15000,
      image: 'https://images.unsplash.com/photo-1601924638867-3ec5f0b6cf48?q=80&w=1200&auto=format&fit=crop',
      categoryId: 'cat-pizzas',
      status: 'limited',
      tags: ['Tiempo limitado'],
      extras: ['Aderezo crema a la pimienta'],
      stock: 5,
      timeLabel: 'Sólo esta semana',
    },
    {
      id: 'prod-003',
      name: 'Suprema Tomi Especial',
      description: 'Albahaca fresca, cebolla morada, panceta crocante y tomates confitados.',
      price: 16500,
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1200&auto=format&fit=crop',
      categoryId: 'cat-especiales',
      status: 'normal',
      tags: ['Chef Suggestion'],
      extras: ['Borde relleno de queso'],
      stock: 8,
    },
    {
      id: 'prod-004',
      name: 'Tomi’s Cajun Wings (6u)',
      description: 'Alitas caramelizadas con glaseado casero, acompañadas de tu dip favorito.',
      price: 7500,
      image: 'https://images.unsplash.com/photo-1606755962772-0f7d0d6d7f57?q=80&w=1200&auto=format&fit=crop',
      categoryId: 'cat-extras',
      status: 'normal',
      tags: ['Crocante'],
      extras: ['Dip ranch', 'Dip spicy'],
      stock: 20,
    },
  ],
  ingredients: [
    { id: 'ing-01', name: 'Harina 00', stock: 42, active: true },
    { id: 'ing-02', name: 'Pepperoni artesanal', stock: 18, active: true },
    { id: 'ing-03', name: 'Queso muzzarella local', stock: 35, active: true },
  ],
  heroBanners: [
    {
      id: 'hero-01',
      title: 'Tomi’s Oven Stories',
      tagline: 'Pizza NY artesanal, hecha 100% a mano con ingredientes locales.',
      cta: 'Ver Carta',
      accentColor: '#D62828',
      status: 'live',
    },
  ],
  addCategory: (category) =>
    set((state) => ({
      categories: [...state.categories, { ...category, id: randomId() }],
    })),
  updateCategory: (id, data) =>
    set((state) => ({
      categories: state.categories.map((category) =>
        category.id === id ? { ...category, ...data } : category,
      ),
    })),
  addProduct: (product) =>
    set((state) => ({
      products: [...state.products, { ...product, id: randomId() }],
    })),
  updateProduct: (id, data) =>
    set((state) => ({
      products: state.products.map((product) =>
        product.id === id ? { ...product, ...data } : product,
      ),
    })),
  adjustProductStock: (id, amount) =>
    set((state) => ({
      products: state.products.map((product) =>
        product.id === id
          ? { ...product, stock: Math.max(0, product.stock + amount) }
          : product,
      ),
    })),
  addIngredient: (ingredient) =>
    set((state) => ({
      ingredients: [...state.ingredients, { ...ingredient, id: randomId() }],
    })),
  updateIngredient: (id, data) =>
    set((state) => ({
      ingredients: state.ingredients.map((ingredient) =>
        ingredient.id === id ? { ...ingredient, ...data } : ingredient,
      ),
    })),
  addHeroBanner: (hero) =>
    set((state) => ({
      heroBanners: [...state.heroBanners, { ...hero, id: randomId() }],
    })),
  updateHeroBanner: (id, data) =>
    set((state) => ({
      heroBanners: state.heroBanners.map((hero) =>
        hero.id === id ? { ...hero, ...data } : hero,
      ),
    })),
}))
