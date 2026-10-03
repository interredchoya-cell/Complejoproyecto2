import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMesasStore } from '../../store/useMesasStore';
import { useStore } from '../../store/useStore';
import { Icon } from '../../components/ui/Icon';

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

export default function MozoPedido() {
  const { pedidoId, negocioId } = useParams();
  const navigate = useNavigate();
  const pedidos = useMesasStore((s) => s.pedidos);
  const mesas = useMesasStore((s) => s.mesas);
  const addItemToPedido = useMesasStore((s) => s.addItemToPedido);
  const removeItemFromPedido = useMesasStore((s) => s.removeItemFromPedido);
  const updatePedidoEstado = useMesasStore((s) => s.updatePedidoEstado);
  const updateMesaEstado = useMesasStore((s) => s.updateMesaEstado);
  const cerrarMesa = useMesasStore((s) => s.cerrarMesa);
  const products = useStore((s) => s.products);
  const addCashMovement = useStore((s) => s.addCashMovement);
  const cashSession = useStore((s) => s.cashSession);

  const [tab, setTab] = useState<'pedido' | 'carta'>('pedido');
  const [category, setCategory] = useState('all');

  const pedido = pedidos.find((p) => p.id === pedidoId);
  const mesa = pedido?.mesaId ? mesas.find((m) => m.id === pedido.mesaId) : null;

  if (!pedido) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Pedido no encontrado</p>
        <button onClick={() => navigate(`/${negocioId}/app/mozos`)} className="mt-4 text-emerald-600 font-medium">
          Volver
        </button>
      </div>
    );
  }

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered = category === 'all' ? products : products.filter((p) => p.category === category);

  const handleEnviarCocina = () => {
    updatePedidoEstado(pedido.id, 'confirmado');
    // Mark pending items as en_marcha conceptually (kitchen will see them)
    alert('¡Pedido enviado a cocina!');
  };

  const handlePedirCuenta = () => {
    if (mesa) {
      updateMesaEstado(mesa.id, 'cuenta_pedida');
    }
    updatePedidoEstado(pedido.id, 'listo');
  };

  const handleCobrarYCerrar = () => {
    if (cashSession?.status === 'abierta' && pedido.total > 0) {
      addCashMovement({
        type: 'ingreso',
        amount: pedido.total,
        method: 'efectivo',
        description: `Cobro Mesa ${mesa?.numero ?? '?'} - Pedido ${pedido.id.slice(-6)}`,
        relatedPedidoId: pedido.id,
      });
    }
    if (mesa) {
      cerrarMesa(mesa.id);
    } else {
      updatePedidoEstado(pedido.id, 'entregado');
    }
    navigate(`/${negocioId}/app/mozos`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-4rem)]">
      {/* Header del pedido */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(`/${negocioId}/app/mozos`)} className="p-1">
          <Icon name="arrow_back" />
        </button>
        <div className="flex-1">
          <h2 className="font-bold">
            {mesa ? `Mesa ${mesa.numero}` : 'Pedido'} · {pedido.estado}
          </h2>
          <p className="text-xs text-slate-500">{pedido.items.length} ítems</p>
        </div>
        <span className="text-lg font-bold text-emerald-600">{formatMoney(pedido.total)}</span>
      </div>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setTab('pedido')}
          className={`flex-1 py-2.5 text-sm font-medium ${
            tab === 'pedido' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500'
          }`}
        >
          Pedido
        </button>
        <button
          onClick={() => setTab('carta')}
          className={`flex-1 py-2.5 text-sm font-medium ${
            tab === 'carta' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500'
          }`}
        >
          Carta
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'pedido' ? (
          <div className="p-4 space-y-2">
            {pedido.items.length === 0 ? (
              <p className="text-center text-slate-500 py-12">Todavía no hay productos</p>
            ) : (
              pedido.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {item.cantidad}x {item.nombre}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">{item.estadoItem.replace('_', ' ')}</p>
                  </div>
                  <span className="font-semibold text-sm">{formatMoney(item.subtotal)}</span>
                  <button
                    onClick={() => removeItemFromPedido(pedido.id, item.id)}
                    className="p-1.5 text-red-500"
                  >
                    <Icon name="delete" size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="p-3">
            <div className="flex gap-2 overflow-x-auto pb-3 mb-2">
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
            <div className="grid grid-cols-2 gap-2">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addItemToPedido(pedido.id, p, 1)}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left active:scale-95 transition-transform"
                >
                  <p className="font-medium text-sm leading-tight">{p.name}</p>
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm mt-1">
                    {formatMoney(p.price)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {pedido.estado === 'borrador' && pedido.items.length > 0 && (
          <button
            onClick={handleEnviarCocina}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold flex items-center justify-center gap-2"
          >
            <Icon name="send" />
            Enviar a Cocina
          </button>
        )}
        {['confirmado', 'en_preparacion', 'listo'].includes(pedido.estado) && (
          <button
            onClick={handlePedirCuenta}
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold"
          >
            Pedir Cuenta
          </button>
        )}
        <button
          onClick={handleCobrarYCerrar}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2"
        >
          <Icon name="payments" />
          Cobrar y Cerrar · {formatMoney(pedido.total)}
        </button>
      </div>
    </div>
  );
}
