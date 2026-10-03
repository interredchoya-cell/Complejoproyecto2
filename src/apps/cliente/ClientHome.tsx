import { Link, useParams } from 'react-router-dom';
import { useConfig } from '../../core/services/ConfigContext';
import { useEspaciosStore } from '../../store/useEspaciosStore';
import { Icon } from '../../components/ui/Icon';

export default function ClientHome() {
  const { negocioId } = useParams();
  const { config } = useConfig();
  const allEspacios = useEspaciosStore((s) => s.espacios);
  const espacios = allEspacios.filter((e) => e.isActive);
  const nombre = config?.negocio?.nombre || 'Complejo Giovanni';

  const libres = espacios.filter((e) => e.status === 'libre').length;

  return (
    <div className="p-4 space-y-6">
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-emerald-100 text-sm font-medium mb-1">Bienvenido a</p>
          <h1 className="text-2xl font-black mb-2">{nombre}</h1>
          <p className="text-sm text-emerald-100 mb-4">
            Reservá canchas, mirá el menú y gestioná tus turnos
          </p>
          <div className="flex gap-2">
            <Link
              to={`/${negocioId}/reservar`}
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-700 font-bold text-sm"
            >
              Reservar ahora
            </Link>
            <Link
              to={`/${negocioId}/menu`}
              className="px-4 py-2.5 rounded-xl bg-white/15 text-white font-medium text-sm"
            >
              Ver menú
            </Link>
          </div>
        </div>
        <Icon
          name="sports_soccer"
          size={120}
          className="absolute -right-4 -bottom-4 opacity-10"
        />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
          <p className="text-xs text-slate-500 mb-1">Espacios disponibles</p>
          <p className="text-2xl font-bold text-emerald-600">{libres}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
          <p className="text-xs text-slate-500 mb-1">Total espacios</p>
          <p className="text-2xl font-bold">{espacios.length}</p>
        </div>
      </div>

      {/* Espacios preview */}
      <div>
        <h2 className="font-bold mb-3">Nuestros espacios</h2>
        <div className="space-y-2">
          {espacios.slice(0, 4).map((e) => (
            <Link
              key={e.id}
              to={`/${negocioId}/reservar?espacio=${e.id}`}
              className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Icon name="stadium" className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{e.name}</p>
                <p className="text-xs text-slate-500 capitalize">{e.type}</p>
              </div>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  e.status === 'libre'
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {e.status === 'libre' ? 'Libre' : e.status.replace('_', ' ')}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
