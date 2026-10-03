import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Court,
  Client,
  Reservation,
  Product,
  CartItem,
  CashSession,
  CashMovement,
  SystemConfig,
  User,
  ViewId,
  PaymentMethod,
} from '../types';

const initialCourts: Court[] = [
  { id: 'c1', name: 'Cancha 1', type: 'cancha', status: 'libre' },
  { id: 'c2', name: 'Cancha 2', type: 'cancha', status: 'reservada', currentReservationId: 'r1' },
  { id: 'c3', name: 'Cancha 3', type: 'cancha', status: 'en_juego', currentReservationId: 'r2' },
  { id: 'c4', name: 'Cancha 4', type: 'cancha', status: 'libre' },
  { id: 's1', name: 'Salón de Eventos', type: 'salon', status: 'mantenimiento' },
];

const initialClients: Client[] = [
  {
    id: 'cl1',
    name: 'Juan Pérez',
    phone: '11-2345-6789',
    email: 'juan@email.com',
    isFrequent: true,
    isSanctioned: false,
    totalReservations: 24,
    noShows: 1,
    createdAt: '2025-01-15',
  },
  {
    id: 'cl2',
    name: 'María González',
    phone: '11-9876-5432',
    isFrequent: false,
    isSanctioned: false,
    totalReservations: 5,
    noShows: 0,
    createdAt: '2025-06-20',
  },
  {
    id: 'cl3',
    name: 'Carlos Rodríguez',
    phone: '11-5555-1234',
    isFrequent: true,
    isSanctioned: true,
    totalReservations: 18,
    noShows: 4,
    createdAt: '2024-11-03',
  },
];

const today = new Date().toISOString().split('T')[0];

const initialReservations: Reservation[] = [
  {
    id: 'r1',
    courtId: 'c2',
    clientId: 'cl1',
    clientName: 'Juan Pérez',
    clientPhone: '11-2345-6789',
    date: today,
    startTime: '18:00',
    endTime: '19:00',
    paymentStatus: 'senado',
    paymentMethod: 'transferencia',
    amount: 15000,
    paidAmount: 5000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'r2',
    courtId: 'c3',
    clientId: 'cl2',
    clientName: 'María González',
    clientPhone: '11-9876-5432',
    date: today,
    startTime: '17:00',
    endTime: '18:30',
    paymentStatus: 'pagado',
    paymentMethod: 'efectivo',
    amount: 20000,
    paidAmount: 20000,
    createdAt: new Date().toISOString(),
  },
];

const initialProducts: Product[] = [
  { id: 'p1', name: 'Agua mineral', price: 1500, stock: 48, category: 'bebida', icon: 'water_drop', destinoComanda: 'bar', disponible: true },
  { id: 'p2', name: 'Gaseosa 500ml', price: 2000, stock: 36, category: 'bebida', icon: 'local_cafe', destinoComanda: 'bar', disponible: true },
  { id: 'p3', name: 'Cerveza', price: 3500, stock: 24, category: 'bebida', icon: 'sports_bar', destinoComanda: 'bar', disponible: true },
  { id: 'p4', name: 'Papas fritas', price: 2500, stock: 20, category: 'snack', icon: 'restaurant', destinoComanda: 'cocina', disponible: true },
  { id: 'p5', name: 'Barrita energética', price: 1800, stock: 30, category: 'snack', icon: 'bakery_dining', destinoComanda: 'bar', disponible: true },
  { id: 'p6', name: 'Hamburguesa completa', price: 6500, stock: 40, category: 'comida', icon: 'lunch_dining', destinoComanda: 'cocina', disponible: true },
  { id: 'p7', name: 'Milanesa con papas', price: 7500, stock: 25, category: 'comida', icon: 'dinner_dining', destinoComanda: 'cocina', disponible: true },
  { id: 'p8', name: 'Ensalada César', price: 4800, stock: 15, category: 'comida', icon: 'eco', destinoComanda: 'cocina', disponible: true },
  { id: 'p9', name: 'Alquiler remera', price: 3000, stock: 15, category: 'indumentaria', icon: 'checkroom', destinoComanda: 'bar', disponible: true },
  { id: 'p10', name: 'Pelota', price: 5000, stock: 8, category: 'otro', icon: 'sports_soccer', destinoComanda: 'bar', disponible: true },
];

const initialConfig: SystemConfig = {
  openTime: '08:00',
  closeTime: '00:00',
  prices: [
    { courtId: 'c1', dayPrice: 12000, nightPrice: 15000, nightStartHour: 18 },
    { courtId: 'c2', dayPrice: 12000, nightPrice: 15000, nightStartHour: 18 },
    { courtId: 'c3', dayPrice: 14000, nightPrice: 18000, nightStartHour: 18 },
    { courtId: 'c4', dayPrice: 14000, nightPrice: 18000, nightStartHour: 18 },
    { courtId: 's1', dayPrice: 50000, nightPrice: 70000, nightStartHour: 18 },
  ],
};

const currentUser: User = {
  id: 'u1',
  name: 'Admin Giovanni',
  nombre: 'Admin Giovanni',
  email: 'admin@complejogiovanni.com',
  role: 'admin',
  rol: 'admin',
  isActive: true,
};

interface AppState {
  currentView: ViewId;
  sidebarCollapsed: boolean;
  darkMode: boolean;
  setView: (view: ViewId) => void;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  currentUser: User;
  courts: Court[];
  updateCourtStatus: (id: string, status: Court['status'], reservationId?: string) => void;
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'totalReservations' | 'noShows'>) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  reservations: Reservation[];
  addReservation: (res: Omit<Reservation, 'id' | 'createdAt'>) => void;
  updateReservation: (id: string, data: Partial<Reservation>) => void;
  products: Product[];
  cart: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  checkoutCart: (method: PaymentMethod, reservationId?: string) => void;
  cashSession: CashSession | null;
  cashMovements: CashMovement[];
  openCash: (amount: number) => void;
  closeCash: (closingAmount: number) => void;
  addCashMovement: (mov: Omit<CashMovement, 'id' | 'sessionId' | 'createdAt' | 'createdBy'>) => void;
  config: SystemConfig;
  updateConfig: (cfg: Partial<SystemConfig>) => void;
  getTodayStats: () => {
    revenue: number;
    occupiedSlots: number;
    newClients: number;
    cashBalance: number;
  };
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentView: 'dashboard',
      sidebarCollapsed: false,
      darkMode: true,
      currentUser,
      courts: initialCourts,
      clients: initialClients,
      reservations: initialReservations,
      products: initialProducts,
      cart: [],
      cashSession: null,
      cashMovements: [],
      config: initialConfig,

      setView: (view) => set({ currentView: view }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      toggleDarkMode: () =>
        set((s) => {
          const next = !s.darkMode;
          document.documentElement.classList.toggle('dark', next);
          return { darkMode: next };
        }),

      updateCourtStatus: (id, status, reservationId) =>
        set((s) => ({
          courts: s.courts.map((c) =>
            c.id === id ? { ...c, status, currentReservationId: reservationId } : c
          ),
        })),

      addClient: (client) =>
        set((s) => ({
          clients: [
            ...s.clients,
            {
              ...client,
              id: `cl${Date.now()}`,
              createdAt: new Date().toISOString().split('T')[0],
              totalReservations: 0,
              noShows: 0,
            },
          ],
        })),

      updateClient: (id, data) =>
        set((s) => ({
          clients: s.clients.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),

      addReservation: (res) => {
        const id = `r${Date.now()}`;
        set((s) => ({
          reservations: [...s.reservations, { ...res, id, createdAt: new Date().toISOString() }],
        }));
        const targetId = res.courtId || res.espacioId;
        if (targetId) {
          get().updateCourtStatus(targetId, 'reservada', id);
        }
      },

      updateReservation: (id, data) =>
        set((s) => ({
          reservations: s.reservations.map((r) => (r.id === id ? { ...r, ...data } : r)),
        })),

      addToCart: (product, qty = 1) =>
        set((s) => {
          const existing = s.cart.find((i) => i.productId === product.id);
          if (existing) {
            return {
              cart: s.cart.map((i) =>
                i.productId === product.id ? { ...i, quantity: i.quantity + qty } : i
              ),
            };
          }
          return {
            cart: [...s.cart, { productId: product.id, name: product.name, price: product.price, quantity: qty }],
          };
        }),

      removeFromCart: (productId) =>
        set((s) => ({ cart: s.cart.filter((i) => i.productId !== productId) })),

      updateCartQty: (productId, qty) =>
        set((s) => ({
          cart:
            qty <= 0
              ? s.cart.filter((i) => i.productId !== productId)
              : s.cart.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)),
        })),

      clearCart: () => set({ cart: [] }),

      checkoutCart: (method, reservationId) => {
        const { cart, cashSession } = get();
        if (!cashSession || cart.length === 0) return;
        const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
        set((s) => ({
          products: s.products.map((p) => {
            const item = cart.find((c) => c.productId === p.id);
            return item ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p;
          }),
          cart: [],
        }));
        get().addCashMovement({
          type: 'ingreso',
          amount: total,
          method,
          description: `Venta POS: ${cart.map((i) => `${i.quantity}x ${i.name}`).join(', ')}`,
          relatedReservationId: reservationId,
        });
      },

      openCash: (amount) =>
        set({
          cashSession: {
            id: `cs${Date.now()}`,
            openedAt: new Date().toISOString(),
            openingAmount: amount,
            status: 'abierta',
            openedBy: get().currentUser.name,
          },
          cashMovements: [],
        }),

      closeCash: (closingAmount) =>
        set((s) => {
          if (!s.cashSession) return s;
          const ingresos = s.cashMovements.filter((m) => m.type === 'ingreso').reduce((sum, m) => sum + m.amount, 0);
          const egresos = s.cashMovements.filter((m) => m.type === 'egreso').reduce((sum, m) => sum + m.amount, 0);
          const expected = s.cashSession.openingAmount + ingresos - egresos;
          return {
            cashSession: {
              ...s.cashSession,
              closedAt: new Date().toISOString(),
              closingAmount,
              expectedAmount: expected,
              status: 'cerrada',
            },
          };
        }),

      addCashMovement: (mov) => {
        const session = get().cashSession;
        if (!session || session.status !== 'abierta') return;
        set((s) => ({
          cashMovements: [
            ...s.cashMovements,
            {
              ...mov,
              id: `cm${Date.now()}`,
              sessionId: session.id,
              createdAt: new Date().toISOString(),
              createdBy: s.currentUser.name,
            },
          ],
        }));
      },

      updateConfig: (cfg) => set((s) => ({ config: { ...s.config, ...cfg } })),

      getTodayStats: () => {
        const { reservations, cashMovements, clients, cashSession } = get();
        const todayStr = new Date().toISOString().split('T')[0];
        const todayRes = reservations.filter((r) => r.date === todayStr);
        const revenue =
          todayRes.reduce((sum, r) => sum + r.paidAmount, 0) +
          cashMovements.filter((m) => m.type === 'ingreso').reduce((sum, m) => sum + m.amount, 0);
        const occupiedSlots = todayRes.length;
        const newClients = clients.filter((c) => c.createdAt === todayStr).length;
        const ingresos = cashMovements.filter((m) => m.type === 'ingreso').reduce((sum, m) => sum + m.amount, 0);
        const egresos = cashMovements.filter((m) => m.type === 'egreso').reduce((sum, m) => sum + m.amount, 0);
        const cashBalance = cashSession ? cashSession.openingAmount + ingresos - egresos : 0;
        return { revenue, occupiedSlots, newClients, cashBalance };
      },
    }),
    {
      name: 'giovanni-admin-storage',
      partialize: (state) => ({
        darkMode: state.darkMode,
        clients: state.clients,
        reservations: state.reservations,
        products: state.products,
        config: state.config,
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('giovanni-admin-storage');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.state?.darkMode !== false) {
        document.documentElement.classList.add('dark');
      }
    } catch {
      document.documentElement.classList.add('dark');
    }
  } else {
    document.documentElement.classList.add('dark');
  }
}
