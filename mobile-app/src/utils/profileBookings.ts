import type { BookingDto } from '../services/bookingApi';

export type ProfileBookingRow = {
  id: string;
  route: string;
  date: string;
  statusKey: 'confirmed' | 'pending_payment' | 'completed';
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
  if (status === 'COMPLETED' || status === 'CANCELLED') return { statusKey: 'completed', statusColor: '#9CA3AF' };
  return { statusKey: 'confirmed', statusColor: '#10B981' };
}

export function mapBookingDtoToProfileRow(b: BookingDto): ProfileBookingRow {
  const f = b.flight;
  const { statusKey, statusColor } = statusForBooking(b.status);
  const depHm = timeHmFromIso(f.departureAt);
  return {
    id: `B-${b.id}`,
    route: `${f.originCode} → ${f.destinationCode}`,
    date: formatDdMmYyyy(f.departureAt),
    statusKey,
    statusColor,
    priceVND: b.totalPriceVnd,
    ticket: {
      pnr: b.pnr,
      passenger: b.passengerName,
      seat: b.seatNumber,
      gate: '—',
      boardingTime: depHm,
      from: f.originCode,
      to: f.destinationCode,
      depart: f.departureAt.replace('T', ' ').slice(0, 16),
      arrive: f.arrivalAt.replace('T', ' ').slice(0, 16),
      flightNumber: f.flightNumber,
      airline: f.airlineName,
      qrValue: `${b.pnr}|${f.flightNumber}|${f.originCode}-${f.destinationCode}`,
    },
  };
}
