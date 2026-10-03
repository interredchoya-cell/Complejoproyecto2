import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useEspaciosStore } from '../../store/useEspaciosStore';
import { useStore } from '../../store/useStore';
import { Icon } from '../../components/ui/Icon';

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n);
}

const HOURS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
  '21:00', '22:00', '23:00',
];

export default function ClientReservar() {
  const { negocioId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const allEspacios = useEspaciosStore((s) => s.espacios);
  const espacios = allEspacios.filter((e) => e.isActive);
  const updateStatus = useEspaciosStore((s) => s.updateStatus);
  const addReservation = useStore((s) => s.addReservation);
  const addClient = useStore((s) => s.addClient);
  const clients = useStore((s) => s.clients);

  const [step, setStep] = useState(1);
  const [espacioId, setEspacioId] = useState(searchParams.get('espacio') || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('18:00');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [done, setDone] = useState(false);

  const espacio = espacios.find((e) => e.id === espacioId);
  const endHour = (() => {
    const [h, m] = startTime.split(':').map(Number);
    return `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  })();
  const amount = espacio?.precioHora || 15000;

  useEffect(() => {
    if (searchParams.get('espacio')) setStep(2);
  }, [searchParams]);

  const handleConfirm = () => {
    if (!espacioId || !name.trim() || !phone.trim()) return;

    let clientId = clients.find(
      (c) => c.phone === phone || c.name.toLowerCase() === name.toLowerCase()
    )?.id;

    if (!clientId) {
      addClient({ name, phone, isFrequent: false, isSanctioned: false });
      clientId = `cl${Date.now()}`;
    }

    addReservation({
      courtId: espacioId,
      clientId,
      clientName: name,
      clientPhone: phone,
      date,
      startTime,
      endTime: endHour,
      paymentStatus: 'pendiente',
      amount,
      paidAmount: 0,
    });
    updateStatus(espacioId, 'reservada');
    setDone(true);
  };

  if (done) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
          <Icon name="check_circle" size={48} className="text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold">¡Reserva confirmada!</h2>
        <p className="text-slate-500 text-sm">
          {espacio?.name} · {date} · {startTime} – {endHour}
        </p>
        <p className="text-sm text-slate-500">
          Te esperamos. Presentate en recepción con tu nombre o teléfono.
        </p>
        <div className="flex flex-col gap-2 pt-4">
          <button
            onClick={() => navigate(`/${negocioId}/mis-reservas`)}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold"
          >
            Ver mis turnos
          </button>
          <button
            onClick={() => navigate(`/${negocioId}`)}
            className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-medium"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5">
      <h1 className="text-lg font-bold">Reservar turno</h1>

      {/* Steps indicator */}
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${
              step >= s ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">Elegí el espacio</p>
          {espacios.map((e) => (
            <button
              key={e.id}
              onClick={() => {
                setEspacioId(e.id);
                setStep(2);
              }}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Icon name="stadium" className="text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold">{e.name}</p>
                <p className="text-xs text-slate-500 capitalize">{e.type}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-600 text-sm">
                  {formatMoney(e.precioHora || 0)}
                </p>
                <p className="text-[10px] text-slate-500">/ hora</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <button onClick={() => setStep(1)} className="text-sm text-emerald-600 flex items-center gap-1">
            <Icon name="arrow_back" size={16} /> {espacio?.name}
          </button>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Fecha</label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Horario de inicio</label>
            <div className="grid grid-cols-4 gap-2">
              {HOURS.map((h) => (
                <button
                  key={h}
                  onClick={() => setStartTime(h)}
                  className={`py-2.5 rounded-xl text-sm font-medium ${
                    startTime === h
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-sm">
              <strong>{espacio?.name}</strong> · {date} · {startTime} – {endHour}
            </p>
            <p className="text-lg font-bold text-emerald-600 mt-1">{formatMoney(amount)}</p>
          </div>
          <button
            onClick={() => setStep(3)}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold"
          >
            Continuar
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <button onClick={() => setStep(2)} className="text-sm text-emerald-600 flex items-center gap-1">
            <Icon name="arrow_back" size={16} /> Volver
          </button>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Tu nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Teléfono</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="11-XXXX-XXXX"
              type="tel"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-sm space-y-1">
            <p><strong>Espacio:</strong> {espacio?.name}</p>
            <p><strong>Fecha:</strong> {date}</p>
            <p><strong>Horario:</strong> {startTime} – {endHour}</p>
            <p><strong>Total:</strong> {formatMoney(amount)} (pago en el complejo)</p>
          </div>
          <button
            onClick={handleConfirm}
            disabled={!name.trim() || !phone.trim()}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold disabled:opacity-50"
          >
            Confirmar reserva
          </button>
        </div>
      )}
    </div>
  );
}
