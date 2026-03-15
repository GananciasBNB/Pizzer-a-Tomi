import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import {
  updateIngrediente,
  getIngredientes,
  getProducts,
  getCategories,
  saveProducto,
  saveCategoria,
  removeProducto,
  removeCategoria,
} from '../services/sheetsApi'

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

export interface RecipeItem {
  ingredientId: string
  quantity: number
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
  removableIngredients?: string[]
  recipe?: RecipeItem[]
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
  isLoading: boolean
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
  removeCategory: (id: string) => void
  removeProduct: (id: string) => void
  removeIngredient: (id: string) => void
}

const randomId = () => Math.random().toString(36).slice(2, 9)

// ─── Datos semilla (solo para la primera vez que el Sheet esté vacío) ──────────
// Estos datos SE SUBEN AL SHEET automáticamente si no hay nada guardado.
const SEED_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Pizzas Clásicas & NY', description: 'Medianas y familiares hechas al horno de leña de Tomi.', visible: true, accent: '#F77F00' },
  { name: 'Especiales y Gourmet', description: 'Combinaciones de autor con ingredientes premium.', visible: true, accent: '#D62828' },
  { name: 'Bebidas & Extras', description: 'Agregados crujientes, dips y gaseosas heladas.', visible: true, accent: '#FFB703' },
]

const SEED_INGREDIENTS: Omit<Ingredient, 'id'>[] = [
  { name: 'Harina 00', stock: 42, active: true },
  { name: 'Pepperoni artesanal', stock: 18, active: true },
  { name: 'Queso muzzarella', stock: 35, active: true },
]

// Los productos semilla necesitan IDs de categoría, se generan después de seedear categorías
const buildSeedProducts = (catIds: string[]): Omit<Product, 'id'>[] => [
  {
    name: 'Pepperoni Clásica',
    description: 'Doble capa de pepperoni, queso muzzarella artesanal y toque de oregano.',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800&auto=format&fit=crop',
    categoryId: catIds[0] ?? '',
    status: 'promo',
    tags: [],
    extras: [],
    stock: 12,
    removableIngredients: ['Salsa de tomate', 'Muzzarella', 'Pepperoni ahumado'],
    promotionLabel: 'Promo 2x1',
    recipe: [],
  },
  {
    name: 'Cuatro Quesos Tomi',
    description: 'Muzzarella, provolone, parmesano y queso azul con reducción de honey.',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1601924638867-3ec5f0b6cf48?q=80&w=800&auto=format&fit=crop',
    categoryId: catIds[0] ?? '',
    status: 'limited',
    tags: [],
    extras: [],
    stock: 5,
    removableIngredients: ['Muzzarella', 'Provolone', 'Parmesano', 'Queso azul'],
    recipe: [],
  },
  {
    name: 'Suprema Tomi Especial',
    description: 'Albahaca fresca, cebolla morada, panceta crocante y tomates confitados.',
    price: 16500,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=800&auto=format&fit=crop',
    categoryId: catIds[1] ?? '',
    status: 'normal',
    tags: [],
    extras: [],
    stock: 8,
    removableIngredients: ['Albahaca', 'Cebolla morada', 'Panceta', 'Tomates confitados'],
    recipe: [],
  },
  {
    name: 'Cajun Wings (6u)',
    description: 'Alitas caramelizadas con glaseado casero, acompañadas de tu dip favorito.',
    price: 7500,
    image: 'https://images.unsplash.com/photo-1606755962772-0f7d0d6d7f57?q=80&w=1200&auto=format&fit=crop',
    categoryId: catIds[2] ?? '',
    status: 'normal',
    tags: [],
    extras: [],
    stock: 20,
    recipe: [],
  },
]

const initialHero: HeroBanner[] = [
  { id: 'hero-01', title: 'Tomi\'s Oven Stories', tagline: 'Pizza NY artesanal, hecha 100% a mano.', cta: 'Ver Carta', accentColor: '#D62828', status: 'live' },
]

const MenuContext = createContext<MenuStoreValue | undefined>(undefined)

export function MenuProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [heroBanners, setHeroBanners] = useState(initialHero)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      console.log('🍕 Iniciando carga de datos desde Sheets...')
      setIsLoading(true)
      try {
        // ── 1. Ingredientes ──────────────────────────────────────
        const ingRes = await getIngredientes()
        let loadedIngredients: Ingredient[] = []
        if (ingRes.ok && ingRes.data && ingRes.data.length > 0) {
          loadedIngredients = ingRes.data.map(row => ({
            id: String(row.ID),
            name: String(row.Nombre),
            stock: Number(row.Stock) || 0,
            active: row.Activo === true || String(row.Activo).toLowerCase() === 'true',
          }))
          console.log(`✅ ${loadedIngredients.length} ingredientes cargados desde Sheet`)
        } else {
          // Sheet vacío → sembrar ingredientes
          console.log('⬆️ Sheet de Ingredientes vacío. Sembrando datos iniciales...')
          const seedIds: string[] = []
          for (const ing of SEED_INGREDIENTS) {
            const newId = randomId()
            seedIds.push(newId)
            await updateIngrediente({ id: newId, nombre: ing.name, stock: ing.stock, activo: ing.active })
            loadedIngredients.push({ ...ing, id: newId })
          }
          console.log('✅ Ingredientes sembrados en Sheet')
        }
        setIngredients(loadedIngredients)

        // ── 2. Categorías ────────────────────────────────────────
        const catRes = await getCategories()
        let loadedCategories: Category[] = []
        if (catRes.ok && catRes.data && catRes.data.length > 0) {
          loadedCategories = catRes.data.map(row => ({
            id: String(row.ID),
            name: String(row.Nombre),
            description: String(row.Descripcion || ''),
            visible: row.Visible === true || String(row.Visible).toLowerCase() === 'true',
            accent: String(row.Acento || '#D22630'),
          }))
          console.log(`✅ ${loadedCategories.length} categorías cargadas desde Sheet`)
        } else {
          // Sheet vacío → sembrar categorías
          console.log('⬆️ Sheet de Categorías vacío. Sembrando datos iniciales...')
          for (const cat of SEED_CATEGORIES) {
            const newId = randomId()
            await saveCategoria({ id: newId, nombre: cat.name, descripcion: cat.description, visible: cat.visible, accent: cat.accent })
            loadedCategories.push({ ...cat, id: newId })
          }
          console.log('✅ Categorías sembradas en Sheet')
        }
        setCategories(loadedCategories)

        // ── 3. Productos ─────────────────────────────────────────
        const prodRes = await getProducts()
        let loadedProducts: Product[] = []
        if (prodRes.ok && prodRes.data && prodRes.data.length > 0) {
          loadedProducts = prodRes.data.map(row => {
            let removable: string[] = []
            let recipe: RecipeItem[] = []
            try { removable = row.Quitar ? JSON.parse(String(row.Quitar)) : [] } catch { removable = [] }
            try { recipe = row.Receta ? JSON.parse(String(row.Receta)) : [] } catch { recipe = [] }
            return {
              id: String(row.ID),
              name: String(row.Nombre),
              description: String(row.Descripcion || ''),
              price: Number(row.Precio) || 0,
              image: String(row.Imagen || ''),
              categoryId: String(row.CategoriaID || ''),
              status: (String(row.Estado || 'normal')) as ProductStatus,
              stock: Number(row.Stock) || 0,
              tags: [],
              extras: [],
              promotionLabel: String(row.EtiquetaPromo || ''),
              timeLabel: '',
              removableIngredients: removable,
              recipe,
            }
          })
          console.log(`✅ ${loadedProducts.length} productos cargados desde Sheet`)
        } else {
          // Sheet vacío → sembrar productos con las categorías ya creadas
          console.log('⬆️ Sheet de Productos vacío. Sembrando datos iniciales...')
          const catIds = loadedCategories.map(c => c.id)
          const seedProducts = buildSeedProducts(catIds)
          for (const prod of seedProducts) {
            const newId = randomId()
            await saveProducto({
              id: newId,
              nombre: prod.name,
              descripcion: prod.description,
              precio: prod.price,
              imagen: prod.image,
              categoria: prod.categoryId,
              estado: prod.status,
              stock: prod.stock,
              receta: JSON.stringify(prod.recipe || []),
              quitar: JSON.stringify(prod.removableIngredients || []),
              etiquetaPromo: prod.promotionLabel,
            })
            loadedProducts.push({ ...prod, id: newId })
          }
          console.log('✅ Productos sembrados en Sheet')
        }
        setProducts(loadedProducts)
        console.log('🎉 Carga de datos completada')
      } catch (err) {
        console.error('❌ Error cargando datos del Sheet:', err)
        // En caso de error de red, el store queda vacío — no se usan datos locales falsos
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // ── Categorías ────────────────────────────────────────────────────────────────
  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const freshId = randomId()
    const newCat = { ...categoryData, id: freshId }
    setCategories(prev => [...prev, newCat])
    saveCategoria({ id: freshId, nombre: newCat.name, descripcion: newCat.description, visible: newCat.visible, accent: newCat.accent })
      .then(res => console.log('saveCategoria:', res))
      .catch(console.error)
  }

  const updateCategory = (id: string, data: Partial<Omit<Category, 'id'>>) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== id) return cat
      const merged = { ...cat, ...data }
      saveCategoria({ id, nombre: merged.name, descripcion: merged.description, visible: merged.visible, accent: merged.accent })
        .catch(console.error)
      return merged
    }))
  }

  const removeCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id))
    removeCategoria(id).catch(console.error)
  }

  // ── Productos ─────────────────────────────────────────────────────────────────
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const freshId = randomId()
    const newProd = { ...productData, id: freshId }
    setProducts(prev => [...prev, newProd])
    saveProducto({
      id: freshId,
      nombre: newProd.name,
      descripcion: newProd.description,
      precio: newProd.price,
      imagen: newProd.image,
      categoria: newProd.categoryId,
      estado: newProd.status,
      stock: newProd.stock,
      receta: JSON.stringify(newProd.recipe || []),
      quitar: JSON.stringify(newProd.removableIngredients || []),
      etiquetaPromo: newProd.promotionLabel,
    }).then(res => console.log('saveProducto:', res))
      .catch(console.error)
  }

  const updateProduct = (id: string, data: Partial<Omit<Product, 'id'>>) => {
    setProducts(prev => prev.map(prod => {
      if (prod.id !== id) return prod
      const merged = { ...prod, ...data }
      saveProducto({
        id,
        nombre: merged.name,
        descripcion: merged.description,
        precio: merged.price,
        imagen: merged.image,
        categoria: merged.categoryId,
        estado: merged.status,
        stock: merged.stock,
        receta: JSON.stringify(merged.recipe || []),
        quitar: JSON.stringify(merged.removableIngredients || []),
        etiquetaPromo: merged.promotionLabel,
      }).catch(console.error)
      return merged
    }))
  }

  const removeProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id))
    removeProducto(id).catch(console.error)
  }

  const adjustProductStock = (id: string, amount: number) => {
    if (!id) return
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + amount) } : p))
  }

  // ── Ingredientes ──────────────────────────────────────────────────────────────
  const addIngredient = (ingredient: Omit<Ingredient, 'id'>) => {
    setIngredients(prev => {
      const exists = prev.some(ing => ing.name.toLowerCase() === ingredient.name.toLowerCase())
      if (exists) {
        alert(`Ya existe un ingrediente llamado "${ingredient.name}".`)
        return prev
      }
      const newId = randomId()
      updateIngrediente({ id: newId, nombre: ingredient.name, stock: ingredient.stock, activo: ingredient.active }).catch(console.error)
      return [...prev, { ...ingredient, id: newId }]
    })
  }

  const updateIngredient = (id: string, data: Partial<Omit<Ingredient, 'id'>>) => {
    setIngredients(prev => prev.map(ing => {
      if (ing.id !== id) return ing
      const merged = { ...ing, ...data }
      updateIngrediente({ id, nombre: merged.name, stock: merged.stock, activo: merged.active }).catch(console.error)
      return merged
    }))
  }

  const removeIngredient = (id: string) => {
    setIngredients(prev => prev.filter(i => i.id !== id))
    import('../services/sheetsApi').then(({ removeIngrediente }) => {
      removeIngrediente(id).catch(console.error)
    })
  }

  // ── Hero Banners ──────────────────────────────────────────────────────────────
  const addHeroBanner = (hero: Omit<HeroBanner, 'id'>) => {
    setHeroBanners(prev => [...prev, { ...hero, id: randomId() }])
  }

  const updateHeroBanner = (id: string, data: Partial<Omit<HeroBanner, 'id'>>) => {
    setHeroBanners(prev => prev.map(hero => hero.id === id ? { ...hero, ...data } : hero))
  }

  const deductIngredientsForOrder = (orderedItems: { productId: string; quantity: number }[]) => {
    setIngredients(prevIngredients => {
      const deductions: Record<string, number> = {}
      orderedItems.forEach(({ productId, quantity }) => {
        const product = products.find(p => p.id === productId)
        if (!product?.recipe) return
        product.recipe.forEach(({ ingredientId, quantity: qtyPerPizza }) => {
          deductions[ingredientId] = (deductions[ingredientId] ?? 0) + qtyPerPizza * quantity
        })
      })
      return prevIngredients.map(ing =>
        deductions[ing.id] !== undefined
          ? { ...ing, stock: Math.max(0, ing.stock - deductions[ing.id]) }
          : ing
      )
    })
  }

  const value: MenuStoreValue = {
    categories, products, ingredients, heroBanners, isLoading,
    addCategory, updateCategory, removeCategory,
    addProduct, updateProduct, removeProduct,
    adjustProductStock, addIngredient, updateIngredient, removeIngredient,
    addHeroBanner, updateHeroBanner, deductIngredientsForOrder,
  }

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

export function useMenuStore() {
  const context = useContext(MenuContext)
  if (!context) throw new Error('useMenuStore must be used within a MenuProvider')
  return context
}
