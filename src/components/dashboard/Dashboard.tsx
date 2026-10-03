import { KPICards } from './KPICards';
import { CourtGrid } from './CourtGrid';

export function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Vista general del complejo · {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <KPICards />
      <CourtGrid />
    </div>
  );
}
