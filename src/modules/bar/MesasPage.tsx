import { useState } from 'react';
import { useMesasStore } from '../../store/useMesasStore';
import { useStore } from '../../store/useStore';
import { Icon } from '../../components/ui/Icon';
import type { Mesa, MesaEstado } from '../../types';

const estadoConfig: Record<
  MesaEstado,
  { label: string; bg: string; border: string; text: string; icon: string }
> = {
  libre: {
    label: 'Libre',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/40',
    text: 'text-emerald-600 dark:text-emerald-400',
    icon: 'check_circle',
  },
  ocupada: {
    label: 'Ocupada',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
    text: 'text-amber-600 dark:text-amber-400',
    icon: 'restaurant',
  },
  reservada: {
    label: 'Reservada',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/40',
    text: 'text-blue-600 dark:text-blue-400',
    icon: 'event',
  },
  cuenta_pedida: {
    label: 'Cuenta pedida',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/40',
    text: 'text-violet-600 dark:text-violet-400',
    icon: 'receipt_long',
  },
};

const sectores = ['todos', 'salon', 'patio', 'terraza', 'canchas'] as const;

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n);
}

export default function MesasPage() {
  const mesas = useMesasStore((s) => s.mesas);
  const updateMesaEstado = useMesasStore((s) => s.updateMesaEstado);
  const createPedido = useMesasStore((s) => s.createPedido);
  const getPedidoByMesa = useMesasStore((s) => s.getPedidoByMesa);
  const cerrarMesa = useMesasStore((s) => s.cerrarMesa);
  const addItemToPedido = useMesasStore((s) => s.addItemToPedido);
  const products = useStore((s) => s.products);

  const [sectorFilter, setSectorFilter] = useState<string>('todos');
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);
  const [showAddProducts, setShowAddProducts] = useState(false);

  const filtered = sectorFilter === 'todos'
    ? mesas
    : mesas.filter((m) => m.sector === sectorFilter);

  const stats = {
    libres: mesas.filter((m) => m.estado === 'libre').length,
    ocupadas: mesas.filter((m) => m.estado === 'ocupada').length,
    cuenta: mesas.filter((m) => m.estado === 'cuenta_pedida').length,
    reservadas: mesas.filter((m) => m.estado === 'reservada').length,
  };

  const handleOpenMesa = (mesa: Mesa) => {
    if (mesa.estado === 'libre' || mesa.estado === 'reservada') {
      createPedido({
        tipoPedido: 'salon',
        mesaId: mesa.id,
        mozoId: 'u-mozo',
      });
    }
    setSelectedMesa(mesa);
    setShowAddProducts(false);
  };

  const pedidoActivo = selectedMesa ? getPedidoByMesa(selectedMesa.id) : null;

  const handleAddProduct = (productId: string) => {
    if (!pedidoActivo) return;
    const product = products.find((p) => p.id === productId);
    if (product) {
      addItemToPedido(pedidoActivo.id, product, 1);
    }
  };

  const handlePedirCuenta = () => {
    if (selectedMesa) {
      updateMesaEstado(selectedMesa.id, 'cuenta_pedida');
      setSelectedMesa({ ...selectedMesa, estado: 'cuenta_pedida' });
    }
  };

  const handleCerrar = () => {
    if (selectedMesa) {
      cerrarMesa(selectedMesa.id);
      setSelectedMesa(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mesas / Salón</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Control de ocupación y pedidos en tiempo real
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats).map(([key, val]) => (
            <div
              key={key}
              className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium"
            >
              <span className="capitalize">{key}</span>: <strong>{val}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {sectores.map((s) => (
          <button
            key={s}
            onClick={() => setSectorFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              sectorFilter === s
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {s === 'todos' ? 'Todos' : s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Grid de mesas */}
        <div className="xl:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered.map((mesa) => {
              const cfg = estadoConfig[mesa.estado];
              const pedido = getPedidoByMesa(mesa.id);
              const isSelected = selectedMesa?.id === mesa.id;

              return (
                <button
                  key={mesa.id}
                  onClick={() => handleOpenMesa(mesa)}
                  className={`relative p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] ${cfg.bg} ${cfg.border} ${
                    isSelected ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-black' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl font-bold">{mesa.numero}</span>
                    <Icon name={cfg.icon} className={cfg.text} size={20} />
                  </div>
                  <p className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</p>
                  <p className="text-[10px] text-slate-500 capitalize mt-0.5">
                    {mesa.sector} · {mesa.capacidad} pers.
                  </p>
                  {pedido && pedido.items.length > 0 && (
                    <p className="text-xs font-bold mt-2 text-slate-700 dark:text-slate-200">
                      {formatMoney(pedido.total)}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel lateral de la mesa seleccionada */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 h-fit sticky top-20">
          {!selectedMesa ? (
            <div className="text-center py-12 text-slate-500">
              <Icon name="table_restaurant" size={48} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Seleccioná una mesa</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Mesa {selectedMesa.numero}</h3>
                  <p className="text-sm text-slate-500 capitalize">
                    {selectedMesa.sector} · {selectedMesa.capacidad} personas
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    estadoConfig[selectedMesa.estado].text
                  } ${estadoConfig[selectedMesa.estado].bg}`}
                >
                  {estadoConfig[selectedMesa.estado].label}
                </span>
              </div>

              {/* Acciones rápidas de estado */}
              <div className="flex flex-wrap gap-2">
                {(['libre', 'ocupada', 'reservada', 'cuenta_pedida'] as MesaEstado[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      updateMesaEstado(selectedMesa.id, st);
                      setSelectedMesa({ ...selectedMesa, estado: st });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${
                      selectedMesa.estado === st
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {estadoConfig[st].label}
                  </button>
                ))}
              </div>

              {/* Pedido actual */}
              {pedidoActivo ? (
                <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm">Pedido actual</h4>
                    <button
                      onClick={() => setShowAddProducts(!showAddProducts)}
                      className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1"
                    >
                      <Icon name="add" size={16} />
                      Agregar
                    </button>
                  </div>

                  {pedidoActivo.items.length === 0 ? (
                    <p className="text-sm text-slate-500 py-4 text-center">Sin items todavía</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {pedidoActivo.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-50 dark:bg-slate-800"
                        >
                          <div>
                            <span className="font-medium">
                              {item.cantidad}x {item.nombre}
                            </span>
                            {item.notas && (
                              <p className="text-[10px] text-slate-500">{item.notas}</p>
                            )}
                          </div>
                          <span className="font-semibold">{formatMoney(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <span className="font-bold">Total</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {formatMoney(pedidoActivo.total)}
                    </span>
                  </div>

                  {/* Botones de acción */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      onClick={handlePedirCuenta}
                      disabled={selectedMesa.estado === 'cuenta_pedida'}
                      className="py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium disabled:opacity-50"
                    >
                      Pedir cuenta
                    </button>
                    <button
                      onClick={handleCerrar}
                      className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium"
                    >
                      Cerrar mesa
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 py-6 text-center">
                  Tocá la mesa para abrir un pedido
                </p>
              )}

              {/* Selector rápido de productos */}
              {showAddProducts && pedidoActivo && (
                <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                  <h4 className="font-semibold text-sm mb-2">Agregar productos</h4>
                  <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto">
                    {products.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleAddProduct(p.id)}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 text-left transition-colors"
                      >
                        <p className="text-xs font-medium truncate">{p.name}</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          {formatMoney(p.price)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
