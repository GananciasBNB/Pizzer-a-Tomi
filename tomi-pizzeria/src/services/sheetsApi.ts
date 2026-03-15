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
  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    // Apps Script no acepta application/json en preflight — usamos text/plain
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action, data }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Error en el script');
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
}): Promise<{ ok: boolean }> {
  return post('saveProducto', data);
}

/** Actualiza el stock de múltiples ingredientes en batch */
export async function updateStockBatch(
  deductions: { ingredientId: string; amount: number }[]
): Promise<{ ok: boolean }> {
  return post('updateStockBatch', { deductions });
}
