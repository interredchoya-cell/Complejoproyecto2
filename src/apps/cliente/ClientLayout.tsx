import { Outlet, NavLink, useParams } from 'react-router-dom';
import { useConfig } from '../../core/services/ConfigContext';
import { Icon } from '../../components/ui/Icon';

export default function ClientLayout() {
  const { negocioId } = useParams();
  const { config } = useConfig();
  const nombre = config?.negocio?.nombre || 'Complejo';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col max-w-lg mx-auto">
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 h-14 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
          <Icon name="sports_soccer" className="text-white" size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">{nombre}</p>
          <p className="text-[10px] text-slate-500">Portal del cliente</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex z-30">
        <NavLink
          to={`/${negocioId}`}
          end
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2.5 text-xs font-medium ${
              isActive ? 'text-emerald-600' : 'text-slate-500'
            }`
          }
        >
          <Icon name="home" size={22} />
          Inicio
        </NavLink>
        <NavLink
          to={`/${negocioId}/reservar`}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2.5 text-xs font-medium ${
              isActive ? 'text-emerald-600' : 'text-slate-500'
            }`
          }
        >
          <Icon name="calendar_month" size={22} />
          Reservar
        </NavLink>
        <NavLink
          to={`/${negocioId}/menu`}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2.5 text-xs font-medium ${
              isActive ? 'text-emerald-600' : 'text-slate-500'
            }`
          }
        >
          <Icon name="restaurant_menu" size={22} />
          Menú
        </NavLink>
        <NavLink
          to={`/${negocioId}/mis-reservas`}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2.5 text-xs font-medium ${
              isActive ? 'text-emerald-600' : 'text-slate-500'
            }`
          }
        >
          <Icon name="person" size={22} />
          Mis turnos
        </NavLink>
      </nav>
    </div>
  );
}
