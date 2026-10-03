import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Mesa, Pedido, DetallePedido, MesaEstado, PedidoEstado, ItemEstado, Product } from '../types';
import { useNotificationStore } from './useNotificationStore';

const initialMesas: Mesa[] = [
  { id: 'm1', negocioId: 'giovanni', numero: 1, sector: 'salon', capacidad: 4, estado: 'libre' },
  { id: 'm2', negocioId: 'giovanni', numero: 2, sector: 'salon', capacidad: 4, estado: 'ocupada' },
  { id: 'm3', negocioId: 'giovanni', numero: 3, sector: 'salon', capacidad: 6, estado: 'libre' },
  { id: 'm4', negocioId: 'giovanni', numero: 4, sector: 'salon', capacidad: 2, estado: 'cuenta_pedida' },
  { id: 'm5', negocioId: 'giovanni', numero: 5, sector: 'patio', capacidad: 8, estado: 'libre' },
  { id: 'm6', negocioId: 'giovanni', numero: 6, sector: 'patio', capacidad: 4, estado: 'ocupada' },
  { id: 'm7', negocioId: 'giovanni', numero: 7, sector: 'terraza', capacidad: 4, estado: 'reservada' },
  { id: 'm8', negocioId: 'giovanni', numero: 8, sector: 'terraza', capacidad: 6, estado: 'libre' },
  { id: 'm9', negocioId: 'giovanni', numero: 9, sector: 'canchas', capacidad: 4, estado: 'libre' },
  { id: 'm10', negocioId: 'giovanni', numero: 10, sector: 'canchas', capacidad: 4, estado: 'libre' },
];

interface MesasState {
  mesas: Mesa[];
  pedidos: Pedido[];
  activePedidoId: string | null; // pedido actualmente siendo editado

  // Mesas
  updateMesaEstado: (mesaId: string, estado: MesaEstado, mozoId?: string) => void;
  getMesa: (id: string) => Mesa | undefined;

  // Pedidos
  createPedido: (data: {
    tipoPedido: Pedido['tipoPedido'];
    mesaId?: string;
    mozoId?: string;
    clienteNombre?: string;
    clienteTelefono?: string;
    direccionDelivery?: string;
  }) => string; // returns pedidoId
  addItemToPedido: (pedidoId: string, product: Product, cantidad?: number, notas?: string) => void;
  updateItemEstado: (pedidoId: string, itemId: string, estado: ItemEstado) => void;
  updatePedidoEstado: (pedidoId: string, estado: PedidoEstado) => void;
  removeItemFromPedido: (pedidoId: string, itemId: string) => void;
  getPedidoByMesa: (mesaId: string) => Pedido | undefined;
  getActivePedidos: () => Pedido[];
  setActivePedido: (id: string | null) => void;
  cerrarMesa: (mesaId: string) => void;
}

export const useMesasStore = create<MesasState>()(
  persist(
    (set, get) => ({
      mesas: initialMesas,
      pedidos: [],
      activePedidoId: null,

      updateMesaEstado: (mesaId, estado, mozoId) =>
        set((s) => ({
          mesas: s.mesas.map((m) =>
            m.id === mesaId
              ? { ...m, estado, mozoAsignadoId: mozoId ?? m.mozoAsignadoId }
              : m
          ),
        })),

      getMesa: (id) => get().mesas.find((m) => m.id === id),

      createPedido: (data) => {
        const id = `ped-${Date.now()}`;
        const nuevo: Pedido = {
          id,
          negocioId: 'giovanni',
          tipoPedido: data.tipoPedido,
          mesaId: data.mesaId,
          mozoId: data.mozoId,
          clienteNombre: data.clienteNombre,
          clienteTelefono: data.clienteTelefono,
          direccionDelivery: data.direccionDelivery,
          estado: 'borrador',
          total: 0,
          items: [],
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          pedidos: [...s.pedidos, nuevo],
          activePedidoId: id,
        }));

        // Si es de salón, marcar mesa como ocupada
        if (data.mesaId) {
          get().updateMesaEstado(data.mesaId, 'ocupada', data.mozoId);
        }
        return id;
      },

      addItemToPedido: (pedidoId, product, cantidad = 1, notas) => {
        set((s) => {
          const pedidos = s.pedidos.map((p) => {
            if (p.id !== pedidoId) return p;

            const existing = p.items.find((i) => i.productoId === product.id && i.notas === notas);
            let items: DetallePedido[];

            if (existing) {
              items = p.items.map((i) =>
                i.id === existing.id
                  ? {
                      ...i,
                      cantidad: i.cantidad + cantidad,
                      subtotal: (i.cantidad + cantidad) * i.precioUnitario,
                    }
                  : i
              );
            } else {
              const newItem: DetallePedido = {
                id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                pedidoId,
                productoId: product.id,
                nombre: product.name,
                cantidad,
                precioUnitario: product.price,
                subtotal: product.price * cantidad,
                notas,
                estadoItem: 'pendiente',
                destinoComanda: product.destinoComanda || (product.category === 'comida' ? 'cocina' : 'bar'),
              };
              items = [...p.items, newItem];
            }

            const total = items.reduce((sum, i) => sum + i.subtotal, 0);
            return { ...p, items, total, updatedAt: new Date().toISOString() };
          });
          return { pedidos };
        });
      },

      updateItemEstado: (pedidoId, itemId, estado) => {
        const prev = get().pedidos.find((p) => p.id === pedidoId);
        const item = prev?.items.find((i) => i.id === itemId);

        set((s) => ({
          pedidos: s.pedidos.map((p) =>
            p.id === pedidoId
              ? {
                  ...p,
                  items: p.items.map((i) =>
                    i.id === itemId ? { ...i, estadoItem: estado } : i
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }));

        // Notify when kitchen marks as ready
        if (estado === 'listo' && item) {
          const mesa = get().mesas.find((m) => m.id === prev?.mesaId);
          useNotificationStore.getState().addNotification({
            title: '¡Pedido listo!',
            message: `${item.cantidad}x ${item.nombre}${mesa ? ` · Mesa ${mesa.numero}` : ''}`,
            type: 'kitchen',
            meta: {
              pedidoId,
              mesaNumero: mesa?.numero,
              itemName: item.nombre,
            },
          });
        }
      },

      updatePedidoEstado: (pedidoId, estado) =>
        set((s) => ({
          pedidos: s.pedidos.map((p) =>
            p.id === pedidoId
              ? { ...p, estado, updatedAt: new Date().toISOString() }
              : p
          ),
        })),

      removeItemFromPedido: (pedidoId, itemId) =>
        set((s) => ({
          pedidos: s.pedidos.map((p) => {
            if (p.id !== pedidoId) return p;
            const items = p.items.filter((i) => i.id !== itemId);
            return {
              ...p,
              items,
              total: items.reduce((sum, i) => sum + i.subtotal, 0),
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      getPedidoByMesa: (mesaId) =>
        get().pedidos.find(
          (p) =>
            p.mesaId === mesaId &&
            !['entregado', 'cancelado'].includes(p.estado)
        ),

      getActivePedidos: () =>
        get().pedidos.filter((p) =>
          !['entregado', 'cancelado'].includes(p.estado)
        ),

      setActivePedido: (id) => set({ activePedidoId: id }),

      cerrarMesa: (mesaId) => {
        const pedido = get().getPedidoByMesa(mesaId);
        if (pedido) {
          get().updatePedidoEstado(pedido.id, 'entregado');
        }
        get().updateMesaEstado(mesaId, 'libre');
        set({ activePedidoId: null });
      },
    }),
    {
      name: 'giovanni-mesas-storage',
      partialize: (s) => ({ mesas: s.mesas, pedidos: s.pedidos }),
    }
  )
);
