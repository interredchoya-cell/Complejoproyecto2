import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { useMesasStore } from '../../store/useMesasStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { Icon } from '../../components/ui/Icon';

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n);
}

export default function ClientMenu() {
  const products = useStore((s) => s.products);
  const createPedido = useMesasStore((s) => s.createPedido);
  const addItemToPedido = useMesasStore((s) => s.addItemToPedido);
  const updatePedidoEstado = useMesasStore((s) => s.updatePedidoEstado);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [cart, setCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);
  const [category, setCategory] = useState('all');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [done, setDone] = useState(false);

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered = category === 'all' ? products : products.filter((p) => p.category === category);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const addToCart = (p: (typeof products)[0]) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === p.id);
      if (existing) {
        return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1 }];
    });
  };

  const handleOrder = () => {
    if (!name.trim() || cart.length === 0) return;
    const pedidoId = createPedido({
      tipoPedido: 'mostrador',
      clienteNombre: name,
      clienteTelefono: phone,
    });
    cart.forEach((item) => {
      const product = products.find((p) => p.id === item.id);
      if (product) addItemToPedido(pedidoId, product, item.qty);
    });
    updatePedidoEstado(pedidoId, 'confirmado');
    addNotification({
      title: 'Nuevo pedido mostrador',
      message: `${name}: ${cart.map((i) => `${i.qty}x ${i.name}`).join(', ')}`,
      type: 'info',
    });
    setDone(true);
    setCart([]);
  };

  if (done) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
          <Icon name="check_circle" size={48} className="text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold">¡Pedido recibido!</h2>
        <p className="text-slate-500 text-sm">
          Pasá por el mostrador a retirar. Te avisamos cuando esté listo.
        </p>
        <button
          onClick={() => setDone(false)}
          className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold"
        >
          Seguir mirando el menú
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-32">
      <h1 className="text-lg font-bold">Menú</h1>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap capitalize ${
              category === c
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {c === 'all' ? 'Todos' : c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => addToCart(p)}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
              <Icon name={p.icon} className="text-emerald-600" size={20} />
            </div>
            <p className="font-semibold text-sm leading-tight">{p.name}</p>
            <p className="text-emerald-600 font-bold text-sm mt-1">{formatMoney(p.price)}</p>
          </button>
        ))}
      </div>

      {/* Cart bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 max-w-lg mx-auto p-3 z-20">
          <button
            onClick={() => setShowCheckout(true)}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-between px-5 shadow-xl"
          >
            <span>{cart.reduce((s, i) => s + i.qty, 0)} ítems</span>
            <span>Ver pedido · {formatMoney(total)}</span>
          </button>
        </div>
      )}

      {/* Checkout sheet */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCheckout(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-t-3xl w-full max-w-lg p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Tu pedido</h3>
              <button onClick={() => setShowCheckout(false)}>
                <Icon name="close" />
              </button>
            </div>
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.qty}x {item.name}
                </span>
                <span className="font-medium">{formatMoney(item.price * item.qty)}</span>
              </div>
            ))}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-emerald-600">{formatMoney(total)}</span>
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Teléfono (opcional)"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
            <button
              onClick={handleOrder}
              disabled={!name.trim()}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold disabled:opacity-50"
            >
              Confirmar pedido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
