import { useNavigate, useParams } from 'react-router-dom';
import { useMesasStore } from '../../store/useMesasStore';
import type { MesaEstado } from '../../types';

const estadoStyle: Record<MesaEstado, string> = {
  libre: 'bg-emerald-500 text-white',
  ocupada: 'bg-amber-500 text-white',
  reservada: 'bg-blue-500 text-white',
  cuenta_pedida: 'bg-violet-600 text-white',
};

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

export default function MozoMesas() {
  const mesas = useMesasStore((s) => s.mesas);
  const getPedidoByMesa = useMesasStore((s) => s.getPedidoByMesa);
  const createPedido = useMesasStore((s) => s.createPedido);
  const navigate = useNavigate();
  const { negocioId } = useParams();

  const handleMesaClick = (mesaId: string, estado: MesaEstado) => {
    if (estado === 'libre' || estado === 'reservada') {
      const pedidoId = createPedido({
        tipoPedido: 'salon',
        mesaId,
        mozoId: 'u-mozo',
      });
      navigate(`/${negocioId}/app/mozos/pedido/${pedidoId}`);
    } else {
      const pedido = getPedidoByMesa(mesaId);
      if (pedido) {
        navigate(`/${negocioId}/app/mozos/pedido/${pedido.id}`);
      }
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-bold">Mis Mesas</h1>

      <div className="grid grid-cols-3 gap-3">
        {mesas.map((mesa) => {
          const pedido = getPedidoByMesa(mesa.id);
          return (
            <button
              key={mesa.id}
              onClick={() => handleMesaClick(mesa.id, mesa.estado)}
              className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center shadow-md active:scale-95 transition-transform ${estadoStyle[mesa.estado]}`}
            >
              <span className="text-3xl font-black">{mesa.numero}</span>
              <span className="text-[10px] font-semibold uppercase mt-0.5 opacity-90">
                {mesa.estado === 'cuenta_pedida' ? 'Cuenta' : mesa.estado}
              </span>
              {pedido && pedido.total > 0 && (
                <span className="absolute bottom-2 text-[10px] font-bold bg-black/20 px-1.5 py-0.5 rounded">
                  {formatMoney(pedido.total)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {Object.entries({
          libre: 'Libre',
          ocupada: 'Ocupada',
          reservada: 'Reservada',
          cuenta_pedida: 'Cuenta',
        }).map(([k, label]) => (
          <div key={k} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className={`w-3 h-3 rounded-full ${estadoStyle[k as MesaEstado]}`} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
