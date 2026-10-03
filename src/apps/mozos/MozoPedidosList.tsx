import { useNavigate, useParams } from 'react-router-dom';
import { useMesasStore } from '../../store/useMesasStore';
import { Icon } from '../../components/ui/Icon';

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

export default function MozoPedidosList() {
  const allPedidos = useMesasStore((s) => s.pedidos);
  const pedidos = allPedidos.filter((p) => p.estado !== 'entregado' && p.estado !== 'cancelado');
  const mesas = useMesasStore((s) => s.mesas);
  const navigate = useNavigate();
  const { negocioId } = useParams();

  const getMesaNum = (mesaId?: string) => {
    if (!mesaId) return '—';
    return mesas.find((m) => m.id === mesaId)?.numero ?? '?';
  };

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-lg font-bold">Pedidos activos</h1>

      {pedidos.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Icon name="receipt_long" size={48} className="mx-auto mb-3 opacity-40" />
          <p>No hay pedidos activos</p>
        </div>
      ) : (
        pedidos.map((p) => (
          <button
            key={p.id}
            onClick={() => navigate(`/${negocioId}/app/mozos/pedido/${p.id}`)}
            className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left flex items-center gap-3 active:scale-[0.98] transition-transform"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-black text-lg">
              {getMesaNum(p.mesaId)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">Mesa {getMesaNum(p.mesaId)}</p>
              <p className="text-xs text-slate-500 capitalize">
                {p.estado} · {p.items.length} ítems
              </p>
            </div>
            <span className="font-bold text-emerald-600">{formatMoney(p.total)}</span>
            <Icon name="chevron_right" className="text-slate-400" />
          </button>
        ))
      )}
    </div>
  );
}
