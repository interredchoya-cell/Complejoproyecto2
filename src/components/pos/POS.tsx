import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Icon } from '../ui/Icon';
import type { PaymentMethod } from '../../types';

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

export function POS() {
  const products = useStore((s) => s.products);
  const cart = useStore((s) => s.cart);
  const addToCart = useStore((s) => s.addToCart);
  const updateCartQty = useStore((s) => s.updateCartQty);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const clearCart = useStore((s) => s.clearCart);
  const checkoutCart = useStore((s) => s.checkoutCart);
  const cashSession = useStore((s) => s.cashSession);
  const [category, setCategory] = useState<string>('all');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('efectivo');

  const categories = ['all', 'bebida', 'snack', 'indumentaria', 'otro'];
  const filtered = category === 'all' ? products : products.filter((p) => p.category === category);
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleCheckout = () => {
    if (!cashSession || cashSession.status !== 'abierta') {
      alert('Debe abrir la caja antes de realizar ventas.');
      return;
    }
    checkoutCart(payMethod);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Punto de Venta / Cantina</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Venta de productos y alquileres</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                  category === c
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {c === 'all' ? 'Todos' : c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => p.stock > 0 && addToCart(p)}
                disabled={p.stock <= 0}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 text-left hover:border-emerald-500/50 hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <Icon name={p.icon} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="font-semibold text-sm leading-tight">{p.name}</p>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-1">{formatMoney(p.price)}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Stock: {p.stock}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col h-fit sticky top-20">
          <h3 className="font-bold flex items-center gap-2 mb-4">
            <Icon name="shopping_cart" />
            Carrito
          </h3>

          {cart.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Carrito vacío</p>
          ) : (
            <div className="space-y-3 flex-1 max-h-64 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-slate-500">{formatMoney(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateCartQty(item.productId, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                    >
                      <Icon name="remove" size={16} />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQty(item.productId, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                    >
                      <Icon name="add" size={16} />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)} className="p-1 text-red-500">
                    <Icon name="delete" size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <>
              <div className="border-t border-slate-200 dark:border-slate-800 mt-4 pt-4 space-y-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatMoney(total)}</span>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Método de pago</label>
                  <div className="flex gap-2">
                    {(['efectivo', 'transferencia', 'mercadopago'] as PaymentMethod[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => setPayMethod(m)}
                        className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium capitalize ${
                          payMethod === m
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800'
                        }`}
                      >
                        {m === 'mercadopago' ? 'MP' : m}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
                >
                  Cobrar
                </button>
                <button
                  onClick={clearCart}
                  className="w-full py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Vaciar carrito
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
