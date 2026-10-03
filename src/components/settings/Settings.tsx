import { useStore } from '../../store/useStore';
import { Icon } from '../ui/Icon';

export function Settings() {
  const config = useStore((s) => s.config);
  const courts = useStore((s) => s.courts);
  const updateConfig = useStore((s) => s.updateConfig);
  const currentUser = useStore((s) => s.currentUser);

  const updatePrice = (courtId: string, field: 'dayPrice' | 'nightPrice' | 'nightStartHour', value: number) => {
    const prices = config.prices.map((p) =>
      p.courtId === courtId ? { ...p, [field]: value } : p
    );
    updateConfig({ prices });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración del Sistema</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Horarios, precios y usuarios</p>
      </div>

      {/* Hours */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Icon name="schedule" />
          Horarios del complejo
        </h3>
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div>
            <label className="text-sm text-slate-500 mb-1.5 block">Apertura</label>
            <input
              type="time"
              value={config.openTime}
              onChange={(e) => updateConfig({ openTime: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="text-sm text-slate-500 mb-1.5 block">Cierre</label>
            <input
              type="time"
              value={config.closeTime}
              onChange={(e) => updateConfig({ closeTime: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Prices */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Icon name="attach_money" />
          Precios por cancha / horario
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                <th className="pb-3 pr-4">Cancha</th>
                <th className="pb-3 pr-4">Precio diurno</th>
                <th className="pb-3 pr-4">Precio nocturno</th>
                <th className="pb-3">Inicio noche (hs)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {config.prices.map((p) => {
                const court = courts.find((c) => c.id === p.courtId);
                return (
                  <tr key={p.courtId}>
                    <td className="py-3 pr-4 font-medium">{court?.name ?? p.courtId}</td>
                    <td className="py-3 pr-4">
                      <input
                        type="number"
                        value={p.dayPrice}
                        onChange={(e) => updatePrice(p.courtId, 'dayPrice', Number(e.target.value))}
                        className="w-28 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                    </td>
                    <td className="py-3 pr-4">
                      <input
                        type="number"
                        value={p.nightPrice}
                        onChange={(e) => updatePrice(p.courtId, 'nightPrice', Number(e.target.value))}
                        className="w-28 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                    </td>
                    <td className="py-3">
                      <input
                        type="number"
                        value={p.nightStartHour}
                        min={0}
                        max={23}
                        onChange={(e) => updatePrice(p.courtId, 'nightStartHour', Number(e.target.value))}
                        className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Icon name="manage_accounts" />
          Usuarios y roles
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-medium">{currentUser.name}</p>
              <p className="text-xs text-slate-500">{currentUser.email}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 capitalize">
              {currentUser.role}
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 opacity-60">
            <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-white font-bold">
              R
            </div>
            <div className="flex-1">
              <p className="font-medium">Recepción</p>
              <p className="text-xs text-slate-500">recepcion@complejogiovanni.com</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-500">
              recepcion
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            * En una versión completa aquí se gestionarían usuarios reales con autenticación.
          </p>
        </div>
      </div>
    </div>
  );
}
