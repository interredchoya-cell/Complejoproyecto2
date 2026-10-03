import { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { Icon } from '../ui/Icon';
import { ReservationModal } from './ReservationModal';
import { format, parseISO, isSameDay, startOfWeek, addDays, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';

type CalendarMode = 'day' | 'week' | 'month';

const paymentBadge: Record<string, string> = {
  pendiente: 'bg-red-500/10 text-red-600 dark:text-red-400',
  senado: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  pagado: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
};

export function Reservations() {
  const reservations = useStore((s) => s.reservations);
  const courts = useStore((s) => s.courts);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<CalendarMode>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      const d = parseISO(r.date);
      if (mode === 'day') return isSameDay(d, selectedDate);
      if (mode === 'week') {
        const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const end = addDays(start, 6);
        return d >= start && d <= end;
      }
      return isSameMonth(d, selectedDate);
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [reservations, selectedDate, mode]);

  const courtName = (id: string) => courts.find((c) => c.id === id)?.name ?? id;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reservas y Turnos</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Calendario interactivo de reservas</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
        >
          <Icon name="add" />
          Nueva Reserva
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {(['day', 'week', 'month'] as CalendarMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                mode === m
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {m === 'day' ? 'Día' : m === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate((d) => addDays(d, mode === 'month' ? -30 : mode === 'week' ? -7 : -1))}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Icon name="chevron_left" />
          </button>
          <span className="text-sm font-medium min-w-[140px] text-center">
            {format(selectedDate, mode === 'month' ? 'MMMM yyyy' : 'dd MMM yyyy', { locale: es })}
          </span>
          <button
            onClick={() => setSelectedDate((d) => addDays(d, mode === 'month' ? 30 : mode === 'week' ? 7 : 1))}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Icon name="chevron_right" />
          </button>
          <button
            onClick={() => setSelectedDate(new Date())}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Hoy
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Icon name="event_busy" size={48} className="mx-auto mb-3 opacity-50" />
            <p>No hay reservas para este período</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((r) => (
              <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {r.startTime}
                    </span>
                    <span className="text-[10px] text-slate-500">{r.endTime}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{r.clientName}</p>
                    <p className="text-sm text-slate-500">
                      {courtName(r.courtId)} · {r.clientPhone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:ml-auto">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${paymentBadge[r.paymentStatus]}`}>
                    {r.paymentStatus === 'pendiente' ? 'Pendiente' : r.paymentStatus === 'senado' ? 'Señado' : 'Pagado'}
                  </span>
                  <span className="text-sm font-semibold">
                    ${r.amount.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReservationModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
