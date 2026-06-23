import type { BookingDto } from '../services/bookingApi';

export type ProfileBookingRow = {
  rawId: number;
  id: string;
  route: string;
  date: string;
  status: string;
  statusKey: 'confirmed' | 'pending_payment' | 'completed' | 'cancelled' | 'checked_in';
  statusColor: string;
  priceVND: number;
  ticket: {
    pnr: string;
    passenger: string;
    seat: string;
    gate: string;
    boardingTime: string;
    from: string;
    to: string;
    depart: string;
    arrive: string;
    flightNumber: string;
    airline: string;
    qrValue: string;
  };
};

function formatDdMmYyyy(iso: string): string {
  const datePart = iso.split('T')[0] ?? '';
  const [y, m, d] = datePart.split('-');
  if (d && m && y) return `${d}/${m}/${y}`;
  return datePart;
}

function timeHmFromIso(iso: string): string {
  const t = iso.split('T')[1] ?? '';
  return t.length >= 5 ? t.slice(0, 5) : '--:--';
}

function statusForBooking(status: string): { statusKey: ProfileBookingRow['statusKey']; statusColor: string } {
  if (status === 'PENDING_PAYMENT') return { statusKey: 'pending_payment', statusColor: '#F59E0B' };
  if (status === 'CHECKED_IN') return { statusKey: 'checked_in', statusColor: '#2563EB' };
  if (status === 'CANCELLED') return { statusKey: 'cancelled', statusColor: '#9CA3AF' };
  if (status === 'COMPLETED') return { statusKey: 'completed', statusColor: '#9CA3AF' };
  return { statusKey: 'confirmed', statusColor: '#10B981' };
}

export function mapBookingDtoToProfileRow(b: BookingDto): ProfileBookingRow {
  const f = b.flight;
  const { statusKey, statusColor } = statusForBooking(b.status);
  const depHm = timeHmFromIso(f.departureAt);
  return {
    rawId: b.id,
    id: `B-${b.id}`,
    route: `${f.departureAirport} → ${f.arrivalAirport}`,
    date: formatDdMmYyyy(f.departureAt),
    status: b.status,
    statusKey,
    statusColor,
    priceVND: b.totalPriceVnd,
    ticket: {
      pnr: b.pnr,
      passenger: b.passengerName,
      seat: b.seatNumber,
      gate: '—',
      boardingTime: depHm,
      from: f.departureAirport,
      to: f.arrivalAirport,
      depart: f.departureAt.replace('T', ' ').slice(0, 16),
      arrive: f.arrivalAt.replace('T', ' ').slice(0, 16),
      flightNumber: f.flightNumber,
      airline: f.airline,
      qrValue: `${b.pnr}|${f.flightNumber}|${f.departureAirport}-${f.arrivalAirport}`,
    },
  };
}
