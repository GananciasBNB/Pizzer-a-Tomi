import type { BadgeVariant } from '../components/ui/Badge';

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  badges?: { text: string; variant: BadgeVariant }[];
  baseIngredients?: string[];
}

export const CATEGORIES = [
  { id: 'ny-style', name: 'Pizzas Estilo NY' },
  { id: 'half-half', name: 'Mitad y Mitad' },
  { id: 'drinks', name: 'Bebidas Frías' },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    categoryId: 'ny-style',
    name: 'Pepperoni Clásica',
    description: 'Salsa de tomates perita, muzzarella fundida y doble porción de pepperoni ahumado, horneado a la perfección.',
    price: 12000,
    imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800&auto=format&fit=crop',
    badges: [{ text: 'Popular', variant: 'popular' }],
    baseIngredients: ['Salsa de tomate', 'Muzzarella', 'Pepperoni ahumado'],
  },
  {
    id: 'p2',
    categoryId: 'ny-style',
    name: 'Margarita New York',
    description: 'Nuestra base de salsa de la casa, muzzarella fresca, flor di latte, albahaca y un toque de aceite de oliva.',
    price: 11000,
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800&auto=format&fit=crop',
    baseIngredients: ['Salsa de la casa', 'Muzzarella', 'Flor di latte', 'Albahaca fresca'],
  },
  {
    id: 'p3',
    categoryId: 'ny-style',
    name: 'Bronx Meatlover',
    description: 'Para los más carnívoros. Salchicha italiana, pepperoni, bacon crocante y jamón sobre abundante muzzarella.',
    price: 15500,
    imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=800&auto=format&fit=crop',
    badges: [{ text: 'Nuevo', variant: 'new' }, { text: 'Fuego', variant: 'promo' }],
    baseIngredients: ['Salsa de tomate', 'Muzzarella', 'Salchicha Italiana', 'Pepperoni', 'Bacon', 'Jamón'],
  },
  {
    id: 'd1',
    categoryId: 'drinks',
    name: 'Limonada Casera',
    description: 'Refrescante limonada con menta y jengibre, ideal para acompañar tu pizza.',
    price: 3500,
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop',
  }
];
