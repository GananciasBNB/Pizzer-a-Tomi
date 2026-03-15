import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import AdminPanel from './pages/AdminPanel';

function App() {
  const location = useLocation();
  const isCheckout = location.pathname === '/checkout';
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </main>
      {!isCheckout && (
        <footer className="bg-nyblack py-6 text-center text-gray-500 text-sm border-t border-gray-800">
          <p>© {new Date().getFullYear()} Pizzería Tomi. Auténtica Pizza NY.</p>
        </footer>
      )}
    </div>
  );
}

export default App;
