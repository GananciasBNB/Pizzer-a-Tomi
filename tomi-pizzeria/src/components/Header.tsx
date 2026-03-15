import { useState, useRef, useCallback } from 'react';
import { ShoppingBag, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

const ADMIN_PIN = '0187';
const PRESS_DURATION = 4000; // 4 segundos

export default function Header() {
  const navigate = useNavigate();
  const { items, toggleCart } = useCartStore();
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [pressProgress, setPressProgress] = useState(0); // 0-100%
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Long Press handlers ──────────────────────────────────
  const startPress = useCallback(() => {
    setPressProgress(0);
    let progress = 0;
    const step = 100 / (PRESS_DURATION / 50);

    progressIntervalRef.current = setInterval(() => {
      progress += step;
      setPressProgress(Math.min(progress, 100));
    }, 50);

    pressTimerRef.current = setTimeout(() => {
      clearInterval(progressIntervalRef.current!);
      setPressProgress(0);
      setPin('');
      setPinError(false);
      setShowPinModal(true);
    }, PRESS_DURATION);
  }, []);

  const cancelPress = useCallback(() => {
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current!);
    setPressProgress(0);
  }, []);

  // ── PIN logic ────────────────────────────────────────────
  const handlePinDigit = (digit: string) => {
    if (pinError) { setPin(digit); setPinError(false); return; }
    const newPin = (pin + digit).slice(0, 4);
    setPin(newPin);
    if (newPin.length === 4) {
      if (newPin === ADMIN_PIN) {
        setShowPinModal(false);
        setPin('');
        navigate('/admin');
      } else {
        setPinError(true);
        setTimeout(() => { setPin(''); setPinError(false); }, 800);
      }
    }
  };

  const handlePinDelete = () => { setPin(prev => prev.slice(0, -1)); setPinError(false); };

  return (
    <>
      <header className="sticky top-0 z-50 bg-nyblack/90 backdrop-blur-md relative">
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-nygreen via-nyred to-nyblue opacity-90" />
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo — Long-press secreto para acceder al admin */}
            <div
              className="flex items-center gap-2 select-none cursor-default"
              onMouseDown={startPress}
              onMouseUp={cancelPress}
              onMouseLeave={cancelPress}
              onTouchStart={startPress}
              onTouchEnd={cancelPress}
            >
              {/* Indicador de progreso de long-press */}
              <div className="relative w-10 h-10">
                <div className="w-10 h-10 bg-gradient-to-br from-nyred to-nyblue rounded-full flex items-center justify-center font-bold text-xl italic tracking-tighter text-white shadow-lg border border-white/10 relative overflow-hidden">
                  T
                  {/* Overlay de progreso */}
                  {pressProgress > 0 && (
                    <div
                      className="absolute inset-0 bg-white/20 transition-all duration-75 rounded-full"
                      style={{ clipPath: `inset(${100 - pressProgress}% 0 0 0)` }}
                    />
                  )}
                </div>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black tracking-tight text-white uppercase drop-shadow-md">Tomi's</span>
                <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">New York Pizza</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.35em] text-gray-300">
              <Link to="/" className="hover:text-nyGold transition-colors">Menú</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/checkout"
              className="text-xs uppercase tracking-[0.4em] text-gray-300 border border-white/20 px-3 py-2 rounded-full hover:border-nyGold"
            >
              Checkout
            </Link>
            <button onClick={toggleCart} className="relative p-2 text-white hover:text-nygreen transition-colors">
              <ShoppingBag size={24} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-nygreen text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center translate-x-1 -translate-y-1 shadow-md border border-nyblack">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Modal PIN (acceso secreto) ── */}
      {showPinModal && (
        <div
          className="fixed inset-0 z-[100] bg-nyblack/95 backdrop-blur-md flex flex-col items-center justify-center gap-6"
          onClick={(e) => e.target === e.currentTarget && setShowPinModal(false)}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-nyblue/20 border border-nyblue/40 rounded-2xl flex items-center justify-center">
              <Lock size={24} className="text-nyblue" />
            </div>
            <h2 className="text-white font-black text-xl uppercase tracking-widest">Acceso Admin</h2>
            <p className="text-gray-500 text-xs">Ingresá tu PIN de 4 dígitos</p>
          </div>

          {/* Dots indicator */}
          <div className="flex gap-3">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                  pinError
                    ? 'border-nyred bg-nyred scale-110'
                    : i < pin.length
                      ? 'border-nyblue bg-nyblue scale-110'
                      : 'border-gray-600'
                }`}
              />
            ))}
          </div>

          {/* Teclado numérico */}
          <div className="grid grid-cols-3 gap-3 w-64">
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => (
              d === '' ? (
                <div key={i} />
              ) : d === '⌫' ? (
                <button
                  key={i}
                  onClick={handlePinDelete}
                  className="h-16 rounded-2xl bg-gray-800 text-gray-300 font-bold text-lg hover:bg-gray-700 active:scale-95 transition-all"
                >
                  ⌫
                </button>
              ) : (
                <button
                  key={i}
                  onClick={() => handlePinDigit(d)}
                  className={`h-16 rounded-2xl font-black text-2xl transition-all active:scale-95 ${
                    pinError
                      ? 'bg-nyred/20 border border-nyred/40 text-nyred'
                      : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700 hover:border-nyblue'
                  }`}
                >
                  {d}
                </button>
              )
            ))}
          </div>

          <button onClick={() => setShowPinModal(false)} className="text-gray-600 text-xs hover:text-gray-400 mt-2">
            Cancelar
          </button>
        </div>
      )}
    </>
  );
}
