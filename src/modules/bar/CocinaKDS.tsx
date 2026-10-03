import { useMesasStore } from '../../store/useMesasStore';
import { Icon } from '../../components/ui/Icon';
import type { ItemEstado } from '../../types';

const estadoColors: Record<ItemEstado, string> = {
  pendiente: 'bg-red-500/15 border-red-500/40 text-red-600 dark:text-red-400',
  en_marcha: 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400',
  listo: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400',
  entregado: 'bg-slate-500/15 border-slate-500/40 text-slate-500',
};

export default function CocinaKDS() {
  const allPedidos = useMesasStore((s) => s.pedidos);
  const pedidos = allPedidos.filter((p) => p.estado !== 'entregado' && p.estado !== 'cancelado');
  const updateItemEstado = useMesasStore((s) => s.updateItemEstado);

  // Flatten items destined to cocina
  const cocinaItems = pedidos.flatMap((p) =>
    p.items
      .filter((i) => i.destinoComanda === 'cocina' || i.destinoComanda === 'ambos')
      .filter((i) => i.estadoItem !== 'entregado')
      .map((item) => ({
        ...item,
        mesaNumero: p.mesaId ? p.mesaId.replace('m', '') : '—',
        pedidoId: p.id,
        createdAt: p.createdAt,
      }))
  );

  const cycleEstado = (pedidoId: string, itemId: string, current: ItemEstado) => {
    const order: ItemEstado[] = ['pendiente', 'en_marcha', 'listo', 'entregado'];
    const next = order[(order.indexOf(current) + 1) % order.length];
    updateItemEstado(pedidoId, itemId, next);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Icon name="skillet" />
          Cocina KDS
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Pantalla de comandas en tiempo real · Tocá un item para avanzar su estado
        </p>
      </div>

      {cocinaItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-500">
          <Icon name="check_circle" size={64} className="mb-4 opacity-30" />
          <p className="text-lg font-medium">No hay comandas pendientes</p>
          <p className="text-sm">Las órdenes de cocina aparecerán aquí</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cocinaItems.map((item) => (
            <button
              key={item.id}
              onClick={() => cycleEstado(item.pedidoId, item.id, item.estadoItem)}
              className={`p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] ${estadoColors[item.estadoItem]}`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl font-black">M{item.mesaNumero}</span>
                <span className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                  {item.estadoItem.replace('_', ' ')}
                </span>
              </div>
              <p className="text-lg font-bold leading-tight">
                {item.cantidad}x {item.nombre}
              </p>
              {item.notas && (
                <p className="text-sm mt-1 opacity-80 italic">“{item.notas}”</p>
              )}
              <p className="text-[10px] mt-3 opacity-60">
                {new Date(item.createdAt).toLocaleTimeString('es-AR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
