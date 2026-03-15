import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

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

// Un ingrediente en la receta de un producto + cuántas unidades usa
export interface RecipeItem {
  ingredientId: string
  quantity: number  // Unidades que se descuentan del stock por cada PIZZA pedida
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
  removableIngredients?: string[]  // Lo que el cliente puede pedir quitar
  recipe?: RecipeItem[]           // Ingredientes internos + cantidad (para descontar stock)
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

interface MenuStoreValue {
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
  deductIngredientsForOrder: (orderedItems: { productId: string; quantity: number }[]) => void
}

const randomId = () => Math.random().toString(36).slice(2, 9)

const initialCategories: Category[] = [
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
]

const initialProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'Pepperoni Clásica',
    description: 'Doble capa de pepperoni, queso muzzarella artesanal y toque de oregano.',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800&auto=format&fit=crop',
    categoryId: 'cat-pizzas',
    status: 'promo',
    tags: ['Con queso extra', 'Popular'],
    extras: ['Masa fina', 'Masa alta'],
    stock: 12,
    removableIngredients: ['Salsa de tomate', 'Muzzarella', 'Pepperoni ahumado'],
    promotionLabel: 'Promo 2x1',
  },
  {
    id: 'prod-002',
    name: 'Cuatro Quesos Tomi',
    description: 'Muzzarella, provolone, parmesano y queso azul con reducción de honey.',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1601924638867-3ec5f0b6cf48?q=80&w=800&auto=format&fit=crop',
    categoryId: 'cat-pizzas',
    status: 'limited',
    tags: ['Tiempo limitado'],
    extras: ['Aderezo crema a la pimienta'],
    stock: 5,
    removableIngredients: ['Muzzarella', 'Provolone', 'Parmesano', 'Queso azul'],
    timeLabel: 'Sólo esta semana',
  },
  {
    id: 'prod-003',
    name: 'Suprema Tomi Especial',
    description: 'Albahaca fresca, cebolla morada, panceta crocante y tomates confitados.',
    price: 16500,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=800&auto=format&fit=crop',
    categoryId: 'cat-especiales',
    status: 'normal',
    tags: ['Chef Suggestion'],
    extras: ['Borde relleno de queso'],
    stock: 8,
    removableIngredients: ['Albahaca', 'Cebolla morada', 'Panceta', 'Tomates confitados'],
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
]

const initialIngredients: Ingredient[] = [
  { id: 'ing-01', name: 'Harina 00', stock: 42, active: true },
  { id: 'ing-02', name: 'Pepperoni artesanal', stock: 18, active: true },
  { id: 'ing-03', name: 'Queso muzzarella local', stock: 35, active: true },
]

const initialHero: HeroBanner[] = [
  {
    id: 'hero-01',
    title: 'Tomi’s Oven Stories',
    tagline: 'Pizza NY artesanal, hecha 100% a mano con ingredientes locales.',
    cta: 'Ver Carta',
    accentColor: '#D62828',
    status: 'live',
  },
]

const MenuContext = createContext<MenuStoreValue | undefined>(undefined)

export function MenuProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState(initialCategories)
  const [products, setProducts] = useState(initialProducts)
  const [ingredients, setIngredients] = useState(initialIngredients)
  const [heroBanners, setHeroBanners] = useState(initialHero)

  const addCategory = (category: Omit<Category, 'id'>) => {
    setCategories((prev) => [...prev, { ...category, id: randomId() }])
  }

  const updateCategory = (id: string, data: Partial<Omit<Category, 'id'>>) => {
    setCategories((prev) => prev.map((category) => (category.id === id ? { ...category, ...data } : category)))
  }

  const addProduct = (product: Omit<Product, 'id'>) => {
    setProducts((prev) => [...prev, { ...product, id: randomId() }])
  }

  const updateProduct = (id: string, data: Partial<Omit<Product, 'id'>>) => {
    setProducts((prev) => prev.map((product) => (product.id === id ? { ...product, ...data } : product)))
  }

  const adjustProductStock = (id: string, amount: number) => {
    if (!id) return
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, stock: Math.max(0, product.stock + amount) } : product,
      ),
    )
  }

  const addIngredient = (ingredient: Omit<Ingredient, 'id'>) => {
    setIngredients((prev) => [...prev, { ...ingredient, id: randomId() }])
  }

  const updateIngredient = (id: string, data: Partial<Omit<Ingredient, 'id'>>) => {
    setIngredients((prev) => prev.map((ingredient) => (ingredient.id === id ? { ...ingredient, ...data } : ingredient)))
  }

  const addHeroBanner = (hero: Omit<HeroBanner, 'id'>) => {
    setHeroBanners((prev) => [...prev, { ...hero, id: randomId() }])
  }

  const updateHeroBanner = (id: string, data: Partial<Omit<HeroBanner, 'id'>>) => {
    setHeroBanners((prev) => prev.map((hero) => (hero.id === id ? { ...hero, ...data } : hero)))
  }

  // Al confirmar un pedido: descuenta ingredientes según la receta de cada pizza
  const deductIngredientsForOrder = (orderedItems: { productId: string; quantity: number }[]) => {
    setIngredients((prevIngredients) => {
      // Calculamos cuánto descontar de cada ingrediente
      const deductions: Record<string, number> = {}

      orderedItems.forEach(({ productId, quantity }) => {
        const product = products.find((p) => p.id === productId)
        if (!product?.recipe) return

        product.recipe.forEach(({ ingredientId, quantity: qtyPerPizza }) => {
          deductions[ingredientId] = (deductions[ingredientId] ?? 0) + qtyPerPizza * quantity
        })
      })

      return prevIngredients.map((ing) =>
        deductions[ing.id] !== undefined
          ? { ...ing, stock: Math.max(0, ing.stock - deductions[ing.id]) }
          : ing
      )
    })
  }

  const value: MenuStoreValue = {
    categories,
    products,
    ingredients,
    heroBanners,
    addCategory,
    updateCategory,
    addProduct,
    updateProduct,
    adjustProductStock,
    addIngredient,
    updateIngredient,
    addHeroBanner,
    updateHeroBanner,
    deductIngredientsForOrder,
  }

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

export function useMenuStore() {
  const context = useContext(MenuContext)
  if (!context) {
    throw new Error('useMenuStore must be used within a MenuProvider')
  }
  return context
}
