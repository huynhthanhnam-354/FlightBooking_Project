import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import type { CatalogFlight } from '../data/flightCatalog';

export type FlightDto = {
  id: number;
  flightNumber: string;
  airlineName: string;
  originCode: string;
  destinationCode: string;
  departureAt: string;
  arrivalAt: string;
  durationMinutes: number;
  basePriceVnd: number;
  premiumCabin: boolean;
};

function timeFromLocalDateTime(iso: string): string {
  const t = iso.includes('T') ? iso.split('T')[1] ?? '' : '';
  return t.length >= 5 ? t.slice(0, 5) : '00:00';
}

function minutesToDurationLabel(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function ddMmYyyyToIsoDate(value: string): string | null {
  const m = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function mapFlightDtoToCatalogFlight(f: FlightDto): CatalogFlight {
  return {
    id: String(f.id),
    airline: f.airlineName,
    code: f.flightNumber,
    dep: timeFromLocalDateTime(f.departureAt),
    arr: timeFromLocalDateTime(f.arrivalAt),
    duration: minutesToDurationLabel(f.durationMinutes),
    priceVND: f.basePriceVnd,
    premium: f.premiumCabin,
  };
}

export async function searchFlightsApi(origin: string, destination: string, departureDate?: string): Promise<CatalogFlight[]> {
  const isoDate = departureDate ? ddMmYyyyToIsoDate(departureDate) : null;
  const { data } = await axios.get<FlightDto[]>(`${API_BASE_URL}/api/flights`, {
    params: {
      origin: origin.trim().toUpperCase(),
      destination: destination.trim().toUpperCase(),
      ...(isoDate ? { departureDate: isoDate } : {}),
    },
    timeout: 25000,
  });
  return (Array.isArray(data) ? data : []).map(mapFlightDtoToCatalogFlight);
}
