// ===================== MULTI-TENANT CORE =====================
export type UserRole =
  | 'superadmin'
  | 'admin'
  | 'encargado'
  | 'mozo'
  | 'cocina'
  | 'recepcion'
  | 'delivery'
  | 'mantenimiento'
  | 'cliente';

export type ModuleId =
  | 'bar'
  | 'reservas'
  | 'cocina'
  | 'caja'
  | 'inventario'
  | 'iot'
  | 'analytics_ai'
  | 'delivery'
  | 'mozos'
  | 'escuela'
  | 'torneos'
  | 'access_control'
  | 'smart_center'
  | 'finanzas'
  | 'empleados';

export interface ThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  fontFamily?: string;
}

export interface Negocio {
  id: string;
  slug: string;
  nombre: string;
  logoUrl?: string;
  theme?: ThemeConfig;
  isActive: boolean;
  createdAt: string;
}

export interface Plan {
  id: string;
  nombre: string;
  precioMensual: number;
  limiteCanchas: number;
  limiteMesas: number;
  modulosIncluidos: ModuleId[];
}

export interface Suscripcion {
  id: string;
  negocioId: string;
  planId: string;
  estado: 'trial' | 'active' | 'past_due' | 'canceled';
  fechaRenovacion: string;
}

export interface User {
  id: string;
  negocioId?: string | null; // null = superadmin
  email: string;
  nombre?: string;
  name?: string;
  telefono?: string;
  rol?: UserRole;
  role?: UserRole;
  pinAcceso?: string;
  isActive?: boolean;
  avatar?: string;
}

export interface TenantConfig {
  negocio: Negocio;
  modulos: Record<ModuleId, boolean>;
  activeModules: ModuleId[];
  theme?: ThemeConfig;
  openTime?: string;
  closeTime?: string;
}

// ===================== BUSINESS ENTITIES =====================
export type CourtStatus = 'libre' | 'reservada' | 'en_juego' | 'mantenimiento';
export type PaymentStatus = 'pendiente' | 'senado' | 'pagado';
export type PaymentMethod = 'efectivo' | 'transferencia' | 'mercadopago' | 'tarjeta';
export type CashMovementType = 'ingreso' | 'egreso';
export type MesaEstado = 'libre' | 'ocupada' | 'reservada' | 'cuenta_pedida';

export interface Espacio {
  id: string;
  negocioId?: string;
  name: string;
  type: 'cancha' | 'salon' | 'futbol' | 'padel' | 'tenis' | 'quincho';
  status: CourtStatus;
  precioHora?: number;
  currentReservationId?: string;
  isActive?: boolean;
}

export type Court = Espacio;

export interface Client {
  id: string;
  negocioId?: string;
  name: string;
  phone: string;
  email?: string;
  isFrequent: boolean;
  isSanctioned: boolean;
  totalReservations: number;
  noShows: number;
  createdAt: string;
}

export interface Reservation {
  id: string;
  negocioId?: string;
  espacioId?: string;
  courtId?: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  amount: number;
  paidAmount: number;
  senaPagada?: number;
  saldoPendiente?: number;
  qrToken?: string;
  notes?: string;
  estado?: 'pendiente' | 'confirmada' | 'en_curso' | 'completada' | 'cancelada';
  createdAt: string;
}

export interface Product {
  id: string;
  negocioId?: string;
  name: string;
  price: number;
  stock: number;
  category: 'bebida' | 'snack' | 'indumentaria' | 'otro' | 'comida';
  icon: string;
  destinoComanda?: 'cocina' | 'bar' | 'ambos';
  disponible?: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface Mesa {
  id: string;
  negocioId: string;
  numero: number;
  sector: 'salon' | 'patio' | 'terraza' | 'canchas';
  capacidad: number;
  estado: MesaEstado;
  mozoAsignadoId?: string;
}

export interface CashSession {
  id: string;
  negocioId?: string;
  openedAt: string;
  closedAt?: string;
  openingAmount: number;
  closingAmount?: number;
  expectedAmount?: number;
  status: 'abierta' | 'cerrada';
  openedBy: string;
  usuarioAperturaId?: string;
}

export interface CashMovement {
  id: string;
  sessionId: string;
  negocioId?: string;
  type: CashMovementType;
  amount: number;
  method: PaymentMethod;
  description: string;
  categoria?: 'cobro_pedido' | 'cobro_reserva' | 'gasto_proveedor' | 'retiro';
  relatedReservationId?: string;
  relatedPedidoId?: string;
  createdAt: string;
  createdBy: string;
}

export interface PriceConfig {
  espacioId?: string;
  courtId?: string;
  dayPrice: number;
  nightPrice: number;
  nightStartHour: number;
}

export interface SystemConfig {
  openTime: string;
  closeTime: string;
  prices: PriceConfig[];
}

export type ViewId =
  | 'dashboard'
  | 'reservations'
  | 'pos'
  | 'cash'
  | 'clients'
  | 'settings'
  | 'mesas'
  | 'inventario'
  | 'empleados';

// ===================== PEDIDOS & MESAS =====================
export type PedidoTipo = 'salon' | 'delivery' | 'mostrador';
export type PedidoEstado = 'borrador' | 'confirmado' | 'en_preparacion' | 'listo' | 'en_camino' | 'entregado' | 'cancelado';
export type ItemEstado = 'pendiente' | 'en_marcha' | 'listo' | 'entregado';

export interface DetallePedido {
  id: string;
  pedidoId: string;
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  notas?: string;
  estadoItem: ItemEstado;
  destinoComanda?: 'cocina' | 'bar' | 'ambos';
}

export interface Pedido {
  id: string;
  negocioId: string;
  tipoPedido: PedidoTipo;
  mesaId?: string;
  mozoId?: string;
  repartidorId?: string;
  clienteNombre?: string;
  clienteTelefono?: string;
  direccionDelivery?: string;
  estado: PedidoEstado;
  total: number;
  items: DetallePedido[];
  createdAt: string;
  updatedAt?: string;
}
