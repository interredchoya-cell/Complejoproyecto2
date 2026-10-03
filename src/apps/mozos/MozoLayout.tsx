import { Outlet, NavLink, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../../components/ui/Icon';

export default function MozoLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { negocioId } = useParams();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-black flex flex-col max-w-lg mx-auto">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-emerald-600 text-white px-4 h-14 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <Icon name="room_service" size={22} />
          <div>
            <p className="font-bold text-sm leading-tight">Mozos</p>
            <p className="text-[10px] opacity-80">{user?.nombre}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => document.documentElement.classList.toggle('dark')}
            className="p-2 rounded-full hover:bg-white/10"
          >
            <Icon name="dark_mode" size={20} />
          </button>
          <button
            onClick={() => {
              logout();
              navigate(`/${negocioId}/login`);
            }}
            className="p-2 rounded-full hover:bg-white/10"
          >
            <Icon name="logout" size={20} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex z-30">
        <NavLink
          to={`/${negocioId}/app/mozos`}
          end
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2.5 text-xs font-medium ${
              isActive ? 'text-emerald-600' : 'text-slate-500'
            }`
          }
        >
          <Icon name="table_restaurant" size={22} />
          Mesas
        </NavLink>
        <NavLink
          to={`/${negocioId}/app/mozos/pedidos`}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2.5 text-xs font-medium ${
              isActive ? 'text-emerald-600' : 'text-slate-500'
            }`
          }
        >
          <Icon name="receipt_long" size={22} />
          Pedidos
        </NavLink>
        <NavLink
          to={`/${negocioId}/app/mozos/nuevo`}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2.5 text-xs font-medium ${
              isActive ? 'text-emerald-600' : 'text-slate-500'
            }`
          }
        >
          <div className="w-10 h-10 -mt-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg">
            <Icon name="add" size={24} />
          </div>
          Nuevo
        </NavLink>
      </nav>
    </div>
  );
}
