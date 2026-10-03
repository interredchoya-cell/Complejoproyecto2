import { useState } from 'react';
import { useEspaciosStore } from '../../store/useEspaciosStore';
import { Icon } from '../../components/ui/Icon';
import type { Espacio } from '../../types';

const typeLabels: Record<string, string> = {
  futbol: 'Fútbol',
  padel: 'Padel',
  tenis: 'Tenis',
  quincho: 'Quincho / Salón',
  cancha: 'Cancha',
  salon: 'Salón',
};

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

export default function EspaciosPage() {
  const espacios = useEspaciosStore((s) => s.espacios);
  const addEspacio = useEspaciosStore((s) => s.addEspacio);
  const updateEspacio = useEspaciosStore((s) => s.updateEspacio);
  const deleteEspacio = useEspaciosStore((s) => s.deleteEspacio);
  const toggleActive = useEspaciosStore((s) => s.toggleActive);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Espacio | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<Espacio['type']>('futbol');
  const [precioHora, setPrecioHora] = useState(15000);

  const resetForm = () => {
    setName('');
    setType('futbol');
    setPrecioHora(15000);
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (editing) {
      updateEspacio(editing.id, { name, type, precioHora });
    } else {
      addEspacio({ name, type, precioHora });
    }
    resetForm();
  };

  const startEdit = (esp: Espacio) => {
    setEditing(esp);
    setName(esp.name);
    setType(esp.type);
    setPrecioHora(esp.precioHora || 15000);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Espacios / Canchas</h1>
          <p className="text-slate-500 text-sm">
            Administrá las canchas, salones y espacios reservables
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
        >
          <Icon name="add" />
          Nuevo espacio
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4"
        >
          <h3 className="font-semibold">{editing ? 'Editar espacio' : 'Crear espacio'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Nombre</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ej: Cancha 5"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Espacio['type'])}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value="futbol">Fútbol</option>
                <option value="padel">Padel</option>
                <option value="tenis">Tenis</option>
                <option value="quincho">Quincho / Salón</option>
                <option value="cancha">Cancha genérica</option>
                <option value="salon">Salón</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Precio por hora ($)</label>
              <input
                type="number"
                value={precioHora}
                onChange={(e) => setPrecioHora(Number(e.target.value))}
                min={0}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium">
              {editing ? 'Guardar cambios' : 'Crear'}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl text-slate-500">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {espacios.map((esp) => (
          <div
            key={esp.id}
            className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 ${
              !esp.isActive ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg">{esp.name}</h3>
                <p className="text-xs text-slate-500 capitalize">
                  {typeLabels[esp.type] || esp.type}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  esp.status === 'libre'
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : esp.status === 'en_juego'
                    ? 'bg-amber-500/10 text-amber-600'
                    : esp.status === 'reservada'
                    ? 'bg-blue-500/10 text-blue-600'
                    : 'bg-red-500/10 text-red-600'
                }`}
              >
                {esp.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-emerald-600 dark:text-emerald-400 font-bold">
              {formatMoney(esp.precioHora || 0)}
              <span className="text-xs font-normal text-slate-500"> / hora</span>
            </p>
            <div className="flex gap-1 mt-4">
              <button
                onClick={() => startEdit(esp)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Editar"
              >
                <Icon name="edit" size={18} />
              </button>
              <button
                onClick={() => toggleActive(esp.id)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                title={esp.isActive ? 'Desactivar' : 'Activar'}
              >
                <Icon name={esp.isActive ? 'visibility' : 'visibility_off'} size={18} />
              </button>
              <button
                onClick={() => {
                  if (confirm(`¿Eliminar ${esp.name}?`)) deleteEspacio(esp.id);
                }}
                className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"
                title="Eliminar"
              >
                <Icon name="delete" size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
