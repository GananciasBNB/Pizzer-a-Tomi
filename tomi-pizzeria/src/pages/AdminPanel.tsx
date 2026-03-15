import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Eye, EyeOff, Edit2, ChevronRight, Package, Tag, Layers, Save, X, FlaskConical, BarChart3, TrendingUp, ShoppingBag, Users, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMenuStore } from '../lib/menuStore';
import type { Category, Product, Ingredient, RecipeItem } from '../lib/menuStore';
import { getDashboard } from '../services/sheetsApi';
import type { DashboardData } from '../services/sheetsApi';

type Tab = 'dashboard' | 'categories' | 'products' | 'ingredients';

// ─── Formulario de Producto ────────────────────────────────────────────────
function ProductForm({ product, categories, allIngredients, onSave, onCancel }: {
  product?: Partial<Product>;
  categories: Category[];
  allIngredients: Ingredient[];
  onSave: (data: Omit<Product, 'id'>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price ?? 0,
    image: product?.image ?? '',
    categoryId: product?.categoryId ?? categories[0]?.id ?? '',
    status: product?.status ?? 'normal' as const,
    tags: product?.tags ?? [],
    extras: product?.extras ?? [],
    stock: product?.stock ?? 10,
    removableIngredients: product?.removableIngredients ?? [],
    recipe: product?.recipe ?? [] as RecipeItem[],
    promotionLabel: product?.promotionLabel ?? '',
    timeLabel: product?.timeLabel ?? '',
  });

  const [ingredientsInput, setIngredientsInput] = useState(form.removableIngredients.join(', '));
  // Receta: ingrediente seleccionado para agregar
  const [recipeSelect, setRecipeSelect] = useState(allIngredients[0]?.id ?? '');
  const [recipeQty, setRecipeQty] = useState(1);

  const addRecipeItem = () => {
    if (!recipeSelect) return;
    const existing = form.recipe.find(r => r.ingredientId === recipeSelect);
    if (existing) {
      setForm(f => ({ ...f, recipe: f.recipe.map(r => r.ingredientId === recipeSelect ? { ...r, quantity: r.quantity + recipeQty } : r) }));
    } else {
      setForm(f => ({ ...f, recipe: [...f.recipe, { ingredientId: recipeSelect, quantity: recipeQty }] }));
    }
  };

  const removeRecipeItem = (ingredientId: string) => {
    setForm(f => ({ ...f, recipe: f.recipe.filter(r => r.ingredientId !== ingredientId) }));
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-5">
      {/* Datos básicos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Nombre</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:border-nyblue outline-none" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Precio ($)</label>
          <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:border-nyblue outline-none" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Descripción</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm resize-none focus:border-nyblue outline-none" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">URL de Imagen</label>
          <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
            placeholder="https://..." className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:border-nyblue outline-none" />
          <p className="text-[10px] text-gray-600 mt-1">Drive: drive.google.com/uc?export=view&id=TU_ID</p>
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Categoría</label>
          <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:border-nyblue outline-none">
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Estado</label>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Product['status'] }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:border-nyblue outline-none">
            <option value="normal">Normal</option>
            <option value="promo">Promo</option>
            <option value="limited">Tiempo Limitado</option>
            <option value="sold-out">Agotado</option>
          </select>
        </div>
        {form.status === 'promo' && (
          <div>
            <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Etiqueta de promo</label>
            <input value={form.promotionLabel} onChange={e => setForm(f => ({ ...f, promotionLabel: e.target.value }))}
              placeholder="Ej: 2x1, 20% off" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:border-nyblue outline-none" />
          </div>
        )}
        <div className="sm:col-span-2">
          <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Ingredientes que el cliente puede quitar (separados por coma)</label>
          <input value={ingredientsInput}
            onChange={e => {
              setIngredientsInput(e.target.value);
              setForm(f => ({ ...f, removableIngredients: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }));
            }}
            placeholder="Ej: Salsa de tomate, Muzzarella, Pepperoni"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:border-nyblue outline-none" />
        </div>
      </div>

      {/* 🧪 Receta de Producción */}
      <div className="border border-gray-700/60 rounded-2xl p-4 bg-gray-800/30">
        <div className="flex items-center gap-2 mb-3">
          <FlaskConical size={14} className="text-nygold" />
          <h3 className="text-sm font-black uppercase tracking-wider text-nygold">Receta de Producción</h3>
        </div>
        <p className="text-xs text-gray-500 mb-4">¿Qué ingredientes usa esta pizza y en qué cantidad? Al confirmarse un pedido, se descuentan automáticamente del stock.</p>

        {/* Ingredientes ya en la receta */}
        {form.recipe.length > 0 ? (
          <div className="flex flex-col gap-2 mb-4">
            {form.recipe.map(item => {
              const ing = allIngredients.find(i => i.id === item.ingredientId);
              return (
                <div key={item.ingredientId} className="flex items-center justify-between gap-3 bg-gray-800 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-nygold font-bold text-sm w-6 text-center">{item.quantity}</span>
                    <span className="text-white text-sm">{ing?.name ?? item.ingredientId}</span>
                    <span className="text-gray-500 text-xs">u. por pizza</span>
                  </div>
                  <button onClick={() => removeRecipeItem(item.ingredientId)} className="text-gray-500 hover:text-nyred transition-colors">
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-600 mb-4 italic">Sin ingredientes en la receta todavía.</p>
        )}

        {/* Agregar ingrediente a la receta */}
        {allIngredients.length > 0 ? (
          <div className="flex gap-2">
            <select value={recipeSelect} onChange={e => setRecipeSelect(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-nygold">
              {allIngredients.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <input type="number" min={1} value={recipeQty} onChange={e => setRecipeQty(Number(e.target.value))}
              className="w-16 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm outline-none text-center focus:border-nygold" />
            <button onClick={addRecipeItem}
              className="bg-nygold/20 border border-nygold/40 text-nygold px-3 py-2 rounded-xl text-sm font-bold hover:bg-nygold/30 transition-colors">
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <p className="text-xs text-nyred">Primero creá ingredientes en la pestaña "Ingredientes".</p>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={() => onSave(form as Omit<Product, 'id'>)}
          className="flex items-center gap-2 bg-nygreen text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-nygreen/90 transition-colors">
          <Save size={14} /> Guardar
        </button>
        <button onClick={onCancel} className="flex items-center gap-2 bg-gray-800 text-gray-300 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-700">
          <X size={14} /> Cancelar
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboard()
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => { setError('No se pudo conectar con el Sheet. Verificá que el script esté configurado.'); setLoading(false); console.error(err); });
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 size={32} className="text-nyblue animate-spin" />
      <p className="text-gray-400 text-sm">Cargando datos del Sheet...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <AlertCircle size={32} className="text-nyred" />
      <p className="text-white font-bold">Sin conexión al Sheet</p>
      <p className="text-gray-500 text-sm max-w-sm">{error}</p>
      <p className="text-gray-600 text-xs">Recordá pegar el código del script en script.google.com y redesplegar.</p>
    </div>
  );

  if (!data) return null;

  const fmt = (n: number) => `$${Number(n || 0).toLocaleString('es-AR')}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Alerta stock bajo */}
      {data.stockBajo.length > 0 && (
        <div className="bg-nyred/10 border border-nyred/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={14} className="text-nyred" />
            <span className="text-nyred font-black text-sm uppercase tracking-wider">Alerta de Stock</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.stockBajo.map(i => (
              <span key={i.nombre} className="bg-nyred/20 text-nyred text-xs font-bold px-2 py-0.5 rounded-full">
                {i.nombre}: {i.stock} u.
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Métricas principales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Ventas hoy', value: fmt(data.ventasHoy), icon: TrendingUp, color: 'text-nygreen' },
          { label: 'Esta semana', value: fmt(data.ventasSemana), icon: BarChart3, color: 'text-nyblue' },
          { label: 'Este mes', value: fmt(data.ventasMes), icon: ShoppingBag, color: 'text-nygold' },
          { label: 'Clientes', value: String(data.totalClientes), icon: Users, color: 'text-nyred' },
        ].map(card => (
          <div key={card.label} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
            <card.icon size={18} className={card.color} />
            <p className="text-white font-black text-xl mt-2">{card.value}</p>
            <p className="text-gray-500 text-xs">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Ranking + Últimos pedidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Ranking de pizzas */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
          <h3 className="font-black text-white text-sm uppercase tracking-wider mb-3">🏆 Top Pizzas</h3>
          {data.ranking.length === 0 ? (
            <p className="text-gray-600 text-xs">Sin ventas registradas todavía.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {data.ranking.map((r, i) => (
                <div key={r.nombre} className="flex items-center gap-3">
                  <span className={`text-xs font-black w-5 text-center ${
                    i === 0 ? 'text-nygold' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-700' : 'text-gray-600'
                  }`}>{i + 1}</span>
                  <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-nyred to-nyblue rounded-full"
                      style={{ width: `${Math.min(100, (r.cantidad / (data.ranking[0]?.cantidad || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-white text-xs font-bold w-24 truncate text-right">{r.nombre}</span>
                  <span className="text-gray-500 text-xs w-6 text-right">{r.cantidad}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimos pedidos */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
          <h3 className="font-black text-white text-sm uppercase tracking-wider mb-3">📋 Últimos Pedidos</h3>
          {data.ultimosPedidos.length === 0 ? (
            <p className="text-gray-600 text-xs">Sin pedidos registrados.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {data.ultimosPedidos.map(p => (
                <div key={p.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-800 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-bold truncate">{p.cliente || 'Anónimo'}</p>
                    <p className="text-gray-600 text-[10px]">{p.fecha} {p.hora}</p>
                  </div>
                  <span className="text-nygold text-xs font-black whitespace-nowrap">{fmt(p.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Totales globales */}
      <div className="flex gap-3 text-center">
        <div className="flex-1 bg-gray-900/40 border border-gray-800 rounded-2xl p-3">
          <p className="text-2xl font-black text-white">{data.totalPedidos}</p>
          <p className="text-gray-500 text-xs">Pedidos totales</p>
        </div>
        <div className="flex-1 bg-gray-900/40 border border-gray-800 rounded-2xl p-3">
          <p className="text-2xl font-black text-nygreen">{fmt(data.ventasMes)}</p>
          <p className="text-gray-500 text-xs">Facturado este mes</p>
        </div>
      </div>
    </div>
  );
}


export default function AdminPanel() {
  const navigate = useNavigate();
  const { categories, products, ingredients, addCategory, updateCategory, removeCategory, addProduct, updateProduct, removeProduct, addIngredient, updateIngredient, removeIngredient } = useMenuStore();

  const [tab, setTab] = useState<Tab>('dashboard');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'categories', label: 'Categorías', icon: Layers },
    { id: 'products', label: 'Productos', icon: Tag },
    { id: 'ingredients', label: 'Ingredientes', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-nyblack pb-20">
      {/* Header Admin */}
      <div className="sticky top-0 z-40 bg-nyblack/95 backdrop-blur-md border-b border-gray-800 px-4 py-4">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-colors p-1">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tight text-white">Panel Admin</h1>
              <p className="text-xs text-gray-500">Pizzería Tomi</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-nygreen animate-pulse" />
            <span className="text-nygreen text-xs font-bold">En línea</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 p-1 rounded-2xl mb-6 border border-gray-800">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all ${
                tab === t.id ? 'bg-nyblue text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}>
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB DASHBOARD ─────────────────────────── */}
        {tab === 'dashboard' && <DashboardTab />}

        {/* ── TAB CATEGORÍAS ────────────────────────── */}
        {tab === 'categories' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="font-black text-white text-lg">Categorías del Menú</h2>
              <button onClick={() => setShowNewCategory(true)}
                className="flex items-center gap-2 bg-nyblue text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-nyblue/90 transition-colors">
                <Plus size={14} /> Nueva
              </button>
            </div>

            {showNewCategory && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex gap-3">
                <input
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  placeholder="Nombre de la categoría (ej: Bebidas Frías)"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-nyblue"
                />
                <button onClick={() => {
                  if (newCategoryName.trim()) {
                    addCategory({ name: newCategoryName, description: '', visible: true, accent: '#D22630' });
                    setNewCategoryName('');
                    setShowNewCategory(false);
                  }
                }} className="bg-nygreen text-white px-4 py-2 rounded-xl text-sm font-bold">Crear</button>
                <button onClick={() => setShowNewCategory(false)} className="text-gray-500 hover:text-white px-2">
                  <X size={16} />
                </button>
              </div>
            )}

            {categories.map(cat => {
              const count = products.filter(p => p.categoryId === cat.id).length;
              return (
                <div key={cat.id} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                  cat.visible ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-900/20 border-gray-800/50 opacity-60'
                }`}>
                  <div className="flex-1">
                    <p className="font-bold text-white">{cat.name}</p>
                    <p className="text-xs text-gray-500">{count} producto{count !== 1 ? 's' : ''}</p>
                  </div>
                  <button
                    onClick={() => updateCategory(cat.id, { visible: !cat.visible })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      cat.visible
                        ? 'bg-nygreen/10 text-nygreen hover:bg-nygreen/20 border border-nygreen/30'
                        : 'bg-gray-800 text-gray-500 hover:bg-gray-700 border border-gray-700'
                    }`}>
                    {cat.visible ? <><Eye size={12} /> Visible</> : <><EyeOff size={12} /> Oculta</>}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`¿Eliminár "${cat.name}" y sus ${count} producto${count !== 1 ? 's' : ''}?`)) {
                        removeCategory(cat.id);
                      }
                    }}
                    className="p-2 rounded-lg text-gray-600 hover:text-nyred hover:bg-gray-800 transition-colors" title="Eliminar categoría">
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ── TAB PRODUCTOS ────────────────────────── */}
        {tab === 'products' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="font-black text-white text-lg">Productos</h2>
              {!showNewProduct && (
                <button onClick={() => setShowNewProduct(true)}
                  className="flex items-center gap-2 bg-nyblue text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-nyblue/90 transition-colors">
                  <Plus size={14} /> Nuevo
                </button>
              )}
            </div>

            {showNewProduct && (
              <ProductForm
                categories={categories}
                allIngredients={ingredients}
                onSave={(data) => { addProduct(data); setShowNewProduct(false); }}
                onCancel={() => setShowNewProduct(false)}
              />
            )}

            {products.map(product => {
              const cat = categories.find(c => c.id === product.categoryId);
              const isEditing = editingProduct === product.id;
              return (
                <div key={product.id} className={`rounded-2xl border transition-all ${
                  product.status === 'sold-out' ? 'border-gray-800/40 opacity-50' : 'border-gray-800 bg-gray-900/30'
                }`}>
                  {isEditing ? (
                    <div className="p-4">
                      <ProductForm
                        product={product}
                        categories={categories}
                        allIngredients={ingredients}
                        onSave={(data) => { updateProduct(product.id, data); setEditingProduct(null); }}
                        onCancel={() => setEditingProduct(null)}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4">
                      <img src={product.image} alt={product.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-white truncate">{product.name}</p>
                          {product.status !== 'normal' && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              product.status === 'promo' ? 'bg-nygreen/20 text-nygreen' :
                              product.status === 'limited' ? 'bg-nygold/20 text-nygold' :
                              'bg-nyred/20 text-nyred'
                            }`}>{product.status}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{cat?.name} · ${product.price.toLocaleString('es-AR')}</p>
                        <p className="text-xs text-gray-400">Stock: {product.stock} unidades</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateProduct(product.id, { status: product.status === 'sold-out' ? 'normal' : 'sold-out' })}
                          className="p-2 rounded-lg text-gray-400 hover:text-nygold hover:bg-gray-800 transition-colors" title={product.status === 'sold-out' ? 'Activar' : 'Marcar agotado'}>
                          {product.status === 'sold-out' ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button onClick={() => setEditingProduct(product.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-nyblue hover:bg-gray-800 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminár "${product.name}"?`)) removeProduct(product.id);
                          }}
                          className="p-2 rounded-lg text-gray-600 hover:text-nyred hover:bg-gray-800 transition-colors" title="Eliminar producto">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── TAB INGREDIENTES ─────────────────────── */}
        {tab === 'ingredients' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="font-black text-white text-lg">Ingredientes & Stock</h2>
              <button onClick={() => addIngredient({ name: 'Nuevo Ingrediente', stock: 0, active: true })}
                className="flex items-center gap-2 bg-nyblue text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-nyblue/90 transition-colors">
                <Plus size={14} /> Agregar
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-2">Podes editar el nombre del ingrediente clickeando directamente sobre el texto.</p>

            {ingredients.map(ing => (
              <div key={ing.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                ing.active ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-900/20 border-gray-800/40 opacity-60'
              }`}>
                <div className="flex-1">
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) => updateIngredient(ing.id, { name: e.target.value })}
                    className="font-bold text-white bg-transparent border-b border-transparent hover:border-gray-700 focus:border-nyblue focus:outline-none w-full transition-colors pb-0.5"
                    placeholder="Nombre del ingrediente"
                  />
                  <p className={`text-xs font-bold mt-0.5 ${
                    ing.stock > 10 ? 'text-nygreen' : ing.stock > 0 ? 'text-nygold' : 'text-nyred'
                  }`}>
                    {ing.stock === 0 ? '⚠️ Sin stock' : `${ing.stock} unidades disponibles`}
                  </p>
                </div>
                {/* Ajuste rápido de stock */}
                <div className="flex items-center gap-2 bg-gray-900 rounded-xl border border-gray-800 p-1">
                  <button onClick={() => updateIngredient(ing.id, { stock: Math.max(0, ing.stock - 1) })}
                    className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 text-sm font-bold">-</button>
                  <span className="text-white font-bold text-sm w-8 text-center">{ing.stock}</span>
                  <button onClick={() => updateIngredient(ing.id, { stock: ing.stock + 5 })}
                    className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 text-xs font-bold">+5</button>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateIngredient(ing.id, { active: !ing.active })}
                    className={`p-2 rounded-lg transition-colors ${ing.active ? 'text-nygreen hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-800'}`}>
                    {ing.active ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`¿Eliminár el ingrediente "${ing.name}"?`)) removeIngredient(ing.id);
                    }}
                    className="p-2 rounded-lg text-gray-600 hover:text-nyred hover:bg-gray-800 transition-colors" title="Eliminar ingrediente">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acceso rápido al Admin (desde la home) */}
      <div className="fixed bottom-4 right-4 z-50">
        <button onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-nyblack border border-gray-700 text-gray-400 hover:text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl hover:border-gray-600 transition-colors">
          Ver Menu <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
