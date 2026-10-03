import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Espacio, CourtStatus } from '../types';

const initialEspacios: Espacio[] = [
  { id: 'c1', negocioId: 'giovanni', name: 'Cancha 1', type: 'futbol', status: 'libre', precioHora: 15000, isActive: true },
  { id: 'c2', negocioId: 'giovanni', name: 'Cancha 2', type: 'futbol', status: 'reservada', precioHora: 15000, isActive: true, currentReservationId: 'r1' },
  { id: 'c3', negocioId: 'giovanni', name: 'Cancha 3', type: 'futbol', status: 'en_juego', precioHora: 18000, isActive: true, currentReservationId: 'r2' },
  { id: 'c4', negocioId: 'giovanni', name: 'Cancha 4', type: 'padel', status: 'libre', precioHora: 12000, isActive: true },
  { id: 's1', negocioId: 'giovanni', name: 'Salón de Eventos', type: 'quincho', status: 'mantenimiento', precioHora: 50000, isActive: true },
];

interface EspaciosState {
  espacios: Espacio[];
  addEspacio: (data: Omit<Espacio, 'id' | 'negocioId' | 'status' | 'isActive'>) => void;
  updateEspacio: (id: string, data: Partial<Espacio>) => void;
  deleteEspacio: (id: string) => void;
  updateStatus: (id: string, status: CourtStatus, reservationId?: string) => void;
  toggleActive: (id: string) => void;
}

export const useEspaciosStore = create<EspaciosState>()(
  persist(
    (set) => ({
      espacios: initialEspacios,

      addEspacio: (data) =>
        set((s) => ({
          espacios: [
            ...s.espacios,
            {
              ...data,
              id: `esp-${Date.now()}`,
              negocioId: 'giovanni',
              status: 'libre',
              isActive: true,
            },
          ],
        })),

      updateEspacio: (id, data) =>
        set((s) => ({
          espacios: s.espacios.map((e) => (e.id === id ? { ...e, ...data } : e)),
        })),

      deleteEspacio: (id) =>
        set((s) => ({
          espacios: s.espacios.filter((e) => e.id !== id),
        })),

      updateStatus: (id, status, reservationId) =>
        set((s) => ({
          espacios: s.espacios.map((e) =>
            e.id === id
              ? { ...e, status, currentReservationId: reservationId }
              : e
          ),
        })),

      toggleActive: (id) =>
        set((s) => ({
          espacios: s.espacios.map((e) =>
            e.id === id ? { ...e, isActive: !e.isActive } : e
          ),
        })),
    }),
    { name: 'giovanni-espacios-storage' }
  )
);
