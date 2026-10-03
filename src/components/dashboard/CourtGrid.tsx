import { useStore } from '../../store/useStore';
import { useEspaciosStore } from '../../store/useEspaciosStore';
import { Icon } from '../ui/Icon';
import type { CourtStatus } from '../../types';

const statusConfig: Record<
  CourtStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  libre: {
    label: 'Libre',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    icon: 'check_circle',
  },
  reservada: {
    label: 'Reservada',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/30',
    icon: 'event',
  },
  en_juego: {
    label: 'En Juego',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/30',
    icon: 'sports_soccer',
  },
  mantenimiento: {
    label: 'Mantenimiento',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-500/10 border-red-500/30',
    icon: 'build',
  },
};

export function CourtGrid() {
  const allEspacios = useEspaciosStore((s) => s.espacios);
  const courts = allEspacios.filter((e) => e.isActive);
  const reservations = useStore((s) => s.reservations);
  const updateCourtStatus = useEspaciosStore((s) => s.updateStatus);

  const getReservationInfo = (resId?: string) => {
    if (!resId) return null;
    return reservations.find((r) => r.id === resId);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Icon name="grid_view" />
        Estado de Canchas en Tiempo Real
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courts.map((court) => {
          const cfg = statusConfig[court.status];
          const res = getReservationInfo(court.currentReservationId);
          return (
            <div
              key={court.id}
              className={`rounded-2xl border p-5 transition-all hover:shadow-lg ${cfg.bg}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-lg">{court.name}</h4>
                  <p className="text-xs text-slate-500 capitalize">{court.type}</p>
                </div>
                <div className={`flex items-center gap-1.5 ${cfg.color}`}>
                  <Icon name={cfg.icon} size={18} filled />
                  <span className="text-sm font-semibold">{cfg.label}</span>
                </div>
              </div>

              {res && (
                <div className="mt-3 pt-3 border-t border-current/10 text-sm space-y-1">
                  <p className="font-medium">{res.clientName}</p>
                  <p className="text-slate-500 dark:text-slate-400">
                    {res.startTime} - {res.endTime}
                  </p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {(Object.keys(statusConfig) as CourtStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => updateCourtStatus(court.id, st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      court.status === st
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {statusConfig[st].label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
