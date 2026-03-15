// ============================================================
//  Servicio de comunicación con Apps Script / Google Sheets
//  Pizzería Tomi
// ============================================================

const SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxDhL4z7dhiZEUCi7R6tOEuDYmZNFu0pKKDVHlRHkVmPSR64Co639PHO5emvvg1A4EmRw/exec';

// ── Tipos ─────────────────────────────────────────────────

export interface OrderItem {
  name: string;
  size?: string;
  quantity: number;
  price: number;
  removedIngredients?: string[];
}

export interface SavePedidoPayload {
  cliente?: string;        // Opcional (modo anónimo)
  telefono: string;        // Obligatorio
  direccion: string;       // Obligatorio
  items: OrderItem[];
  total: number;
  pago: string;
  guardarCliente?: boolean;
  deductions?: { ingredientId: string; amount: number }[];
}

export interface DashboardData {
  ventasHoy: number;
  ventasSemana: number;
  ventasMes: number;
  pedidosHoy: number;
  totalPedidos: number;
  totalClientes: number;
  ranking: { nombre: string; cantidad: number }[];
  ultimosPedidos: {
    id: string;
    fecha: string;
    hora: string;
    cliente: string;
    total: number;
    pago: string;
    estado: string;
  }[];
  stockBajo: { nombre: string; stock: number }[];
}

// ── Helper interno ────────────────────────────────────────

async function post<T>(action: string, data: unknown): Promise<T> {
  // Apps Script redirige POST→GET perdiendo el body Y los URL params originales.
  // Usamos GET directamente: doGet ya maneja todas las acciones de escritura.
  const dataStr = JSON.stringify(data);
  const url = `${SCRIPT_URL}?action=${encodeURIComponent(action)}&data=${encodeURIComponent(dataStr)}`;
  const res = await fetch(url);
  const text = await res.text();
  let json: Record<string, unknown>;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error('Respuesta inválida del servidor');
  }
  if (!json.ok) throw new Error((json.error as string) || 'Error en el script');
  return json as T;
}

async function get<T>(params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${SCRIPT_URL}?${qs}`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Error en el script');
  return json as T;
}

// ── API pública ───────────────────────────────────────────

/** Guarda un pedido en Sheets (al confirmar por WhatsApp) */
export async function savePedido(payload: SavePedidoPayload): Promise<{ ok: boolean; id: string }> {
  return post('savePedido', payload);
}

/** Obtiene los datos para el Dashboard del admin */
export async function getDashboard(): Promise<{ ok: boolean; data: DashboardData }> {
  return get({ action: 'getDashboard' });
}

/** Obtiene todos los pedidos */
export async function getPedidos(): Promise<{ ok: boolean; data: unknown[] }> {
  return get({ action: 'getPedidos' });
}

/** Guarda o actualiza datos de un cliente (upsert por teléfono) */
export async function saveCliente(data: {
  nombre?: string;
  telefono: string;
  direccion: string;
  totalGastado: number;
}): Promise<{ ok: boolean }> {
  return post('saveCliente', data);
}

/** Obtiene todos los ingredientes */
export async function getIngredientes(): Promise<{ ok: boolean; data: Record<string, any>[] }> {
  return get({ action: 'getIngredientes' });
}

/** Obtiene todos los clientes */
export async function getClientes(): Promise<{ ok: boolean; data: Record<string, any>[] }> {
  return get({ action: 'getClientes' });
}

/** Obtiene todos los productos */
export async function getProducts(): Promise<{ ok: boolean; data: Record<string, any>[] }> {
  return get({ action: 'getProducts' });
}

/** Obtiene todas las categorías */
export async function getCategories(): Promise<{ ok: boolean; data: Record<string, any>[] }> {
  return get({ action: 'getCategories' });
}

/** Sincroniza un producto al Sheet */
export async function saveProducto(data: {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria: string;
  estado: string;
  stock: number;
  receta?: string; // JSON stringify de RecipeItem[]
  quitar?: string; // JSON stringify de string[]
  etiquetaPromo?: string;
}): Promise<{ ok: boolean }> {
  return post('saveProducto', data);
}

/** Elimina un producto */
export async function removeProducto(id: string): Promise<{ ok: boolean }> {
  return post('removeProducto', { id });
}

/** Guarda o actualiza una categoría */
export async function saveCategoria(data: {
  id: string;
  nombre: string;
  descripcion: string;
  visible: boolean;
  accent: string;
}): Promise<{ ok: boolean }> {
  return post('saveCategoria', data);
}

/** Elimina una categoría */
export async function removeCategoria(id: string): Promise<{ ok: boolean }> {
  return post('removeCategoria', { id });
}

/** Actualiza el stock de múltiples ingredientes en batch */
export async function updateStockBatch(
  deductions: { ingredientId: string; amount: number }[]
): Promise<{ ok: boolean }> {
  return post('updateStockBatch', { deductions });
}

/** Agrega o actualiza un ingrediente */
export async function updateIngrediente(data: {
  id: string;
  nombre: string;
  stock?: number;
  activo?: boolean;
}): Promise<{ ok: boolean }> {
  return post('updateIngrediente', data);
}

/** Elimina un ingrediente (cambia activo a false temporalmente, o lo borra real si hay endpoint) */
export async function removeIngrediente(id: string): Promise<{ ok: boolean }> {
  return post('removeIngrediente', { id });
}
