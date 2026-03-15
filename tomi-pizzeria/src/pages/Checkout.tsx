import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin, MessageCircle, Loader2, BookmarkCheck } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useMenuStore } from '../lib/menuStore';
import { savePedido } from '../services/sheetsApi';

type PaymentMethod = 'efectivo' | 'mercadopago' | 'transferencia';

interface CustomerData {
  name: string;
  phone: string;
  address: string;
  notes: string;
}

const WHATSAPP_NUMBER = '5491123934273'; // +54 9 11 2393-4273

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const { deductIngredientsForOrder } = useMenuStore();

  const [customer, setCustomer] = useState<CustomerData>({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [payment, setPayment] = useState<PaymentMethod>('efectivo');
  const [errors, setErrors] = useState<Partial<CustomerData>>({});
  const [loading, setLoading] = useState(false);
  const [saveData, setSaveData] = useState(false); // checkbox "Recordar mis datos"

  // Cargar datos guardados del cliente desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tomi_customer_data');
    if (saved) {
      setCustomer(JSON.parse(saved));
    }
  }, []);

  // Si el carrito está vacío, volver al inicio
  useEffect(() => {
    if (items.length === 0) navigate('/');
  }, [items, navigate]);

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleChange = (field: keyof CustomerData, value: string) => {
    setCustomer(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const newErrors: Partial<CustomerData> = {};
    // nombre es OPCIONAL (modo anónimo)
    if (!customer.phone.trim()) newErrors.phone = 'El teléfono es obligatorio para la entrega';
    if (!customer.address.trim()) newErrors.address = 'La dirección es obligatoria';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildWhatsAppMessage = () => {
    const paymentLabels: Record<PaymentMethod, string> = {
      efectivo: '💵 Efectivo',
      mercadopago: '💳 Mercado Pago',
      transferencia: '🏦 Transferencia Bancaria',
    };

    const orderLines = items.map(item => {
      const size = item.size ? ` (${item.size})` : '';
      const removed = item.removedIngredients.length > 0
        ? `\n   🚫 Sin: ${item.removedIngredients.join(', ')}`
        : '';
      const qty = item.quantity > 1 ? `x${item.quantity} ` : '';
      return `▪️ ${qty}${item.name}${size} - $${(item.price * item.quantity).toLocaleString('es-AR')}${removed}`;
    }).join('\n');

    return encodeURIComponent(
      `🍕 *NUEVO PEDIDO - PIZZERÍA TOMI* 🍕\n\n` +
      `👤 *Cliente:* ${customer.name}\n` +
      `📱 *Teléfono:* ${customer.phone}\n` +
      `📍 *Dirección:* ${customer.address}\n` +
      (customer.notes ? `📝 *Aclaraciones:* ${customer.notes}\n` : '') +
      `\n*🛒 Tu Pedido:*\n${orderLines}\n\n` +
      `💰 *TOTAL: $${total.toLocaleString('es-AR')}*\n` +
      `💳 *Pago:* ${paymentLabels[payment]}\n\n` +
      `_Enviado desde la app de Tomi's NY Pizza_ 🔥`
    );
  };

  const handleConfirm = () => {
    if (!validate()) return;
    setLoading(true);

    // Guardar datos del cliente para próximas veces
    localStorage.setItem('tomi_customer_data', JSON.stringify(customer));

    const message = buildWhatsAppMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    setTimeout(() => {
      // Descontar ingredientes del stock según la receta de cada producto
      deductIngredientsForOrder(
        items.map(item => ({ productId: item.productId, quantity: item.quantity }))
      );

      // Guardar pedido en Google Sheets (no bloqueante — el WhatsApp abre igual)
      const paymentLabels: Record<PaymentMethod, string> = {
        efectivo: 'Efectivo',
        mercadopago: 'Mercado Pago',
        transferencia: 'Transferencia',
      };
      savePedido({
        cliente: customer.name.trim() || undefined,
        telefono: customer.phone,
        direccion: customer.address,
        items: items.map(item => ({
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          removedIngredients: item.removedIngredients,
        })),
        total,
        pago: paymentLabels[payment],
        guardarCliente: saveData,
      }).catch(err => console.warn('Sheet save error (no bloqueante):', err));

      clearCart();
      window.open(url, '_blank');
      navigate('/');
      setLoading(false);
    }, 600);
  };

  const paymentOptions: { id: PaymentMethod; label: string; icon: string; desc: string }[] = [
    { id: 'efectivo', label: 'Efectivo', icon: '💵', desc: 'Pagás al recibir tu pedido' },
    { id: 'mercadopago', label: 'Mercado Pago', icon: '💳', desc: 'QR o link de pago' },
    { id: 'transferencia', label: 'Transferencia', icon: '🏦', desc: 'CBU te enviamos por WhatsApp' },
  ];

  return (
    <div className="min-h-screen bg-nyblack pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-nyblack/95 backdrop-blur-md border-b border-gray-800 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors p-1">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-black uppercase tracking-tight text-white">Tu Pedido</h1>
      </div>

      <div className="container mx-auto max-w-lg px-4 py-6 flex flex-col gap-6">

        {/* Resumen del Pedido */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-400 mb-4">Resumen</h2>
          <div className="flex flex-col gap-3">
            {items.map(item => (
              <div key={item.cartItemId} className="flex justify-between items-start gap-2 text-sm">
                <div className="flex-1">
                  <span className="text-white font-bold">
                    {item.quantity > 1 ? `${item.quantity}x ` : ''}{item.name}
                  </span>
                  {item.size && <span className="text-nygold text-xs font-bold ml-2">({item.size})</span>}
                  {item.removedIngredients.length > 0 && (
                    <div className="text-gray-500 text-xs mt-0.5 line-through">
                      Sin: {item.removedIngredients.join(', ')}
                    </div>
                  )}
                </div>
                <span className="font-bold text-white whitespace-nowrap">
                  ${(item.price * item.quantity).toLocaleString('es-AR')}
                </span>
              </div>
            ))}
            <div className="border-t border-gray-800 pt-3 flex justify-between items-center">
              <span className="font-black uppercase text-sm tracking-wider text-gray-300">Total</span>
              <span className="font-black text-2xl text-white">${total.toLocaleString('es-AR')}</span>
            </div>
          </div>
        </section>

        {/* Datos del Cliente */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
            <User size={14} /> Tus Datos
          </h2>

          <div className="flex flex-col gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Nombre completo *
              </label>
              <input
                type="text"
                value={customer.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ej: Juan García"
                className={`w-full bg-gray-800 border ${errors.name ? 'border-nyred' : 'border-gray-700'} rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-nyblue transition-colors`}
              />
              {errors.name && <p className="text-nyred text-xs mt-1 font-bold">{errors.name}</p>}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1">
                <Phone size={11} /> Teléfono *
              </label>
              <input
                type="tel"
                value={customer.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Ej: 11 2345-6789"
                className={`w-full bg-gray-800 border ${errors.phone ? 'border-nyred' : 'border-gray-700'} rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-nyblue transition-colors`}
              />
              {errors.phone && <p className="text-nyred text-xs mt-1 font-bold">{errors.phone}</p>}
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1">
                <MapPin size={11} /> Dirección de entrega *
              </label>
              <input
                type="text"
                value={customer.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Calle, número, piso/depto"
                className={`w-full bg-gray-800 border ${errors.address ? 'border-nyred' : 'border-gray-700'} rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-nyblue transition-colors`}
              />
              {errors.address && <p className="text-nyred text-xs mt-1 font-bold">{errors.address}</p>}
            </div>

            {/* Notas opcionales */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Aclaraciones (opcional)
              </label>
              <textarea
                value={customer.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Ej: tocar timbre, dejar en portería, etc."
                rows={2}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-nyblue transition-colors resize-none"
              />
            </div>
          </div>
        </section>

        {/* Método de Pago */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-400 mb-4">
            Método de Pago
          </h2>
          <div className="flex flex-col gap-3">
            {paymentOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => setPayment(opt.id)}
                className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                  payment === opt.id
                    ? 'bg-nyblue/10 border-nyblue shadow-[0_0_15px_rgba(10,49,97,0.2)]'
                    : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <div className="flex-1">
                  <div className={`font-bold ${payment === opt.id ? 'text-white' : 'text-gray-300'}`}>
                    {opt.label}
                  </div>
                  <div className="text-xs text-gray-500">{opt.desc}</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  payment === opt.id ? 'border-nyblue bg-nyblue' : 'border-gray-600'
                }`}>
                  {payment === opt.id && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            ))}
          </div>
        </section>

      </div>

      {/* CTA Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-nyblack/95 backdrop-blur-md border-t border-gray-800 p-4 z-50">
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-nygreen text-white py-4 rounded-2xl font-black uppercase tracking-widest text-base hover:bg-nygreen/90 transition-all shadow-[0_5px_25px_rgba(0,140,69,0.4)] disabled:opacity-60"
        >
          {loading ? (
            <><Loader2 size={20} className="animate-spin" /> Enviando pedido...</>
          ) : (
            <><MessageCircle size={22} /> Confirmar por WhatsApp</>
          )}
        </button>
        <p className="text-center text-gray-600 text-[11px] mt-2">
          Se abrirá WhatsApp con tu pedido listo para confirmar
        </p>
      </div>
    </div>
  );
}
