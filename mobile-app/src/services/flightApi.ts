import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import type { CatalogFlight } from '../data/flightCatalog';

export type FlightDto = {
  id: number;
  flightNumber: string;
  airline: string;
  airlineName?: string;      // alias for backward compatibility
  departureAirport: string;  // Giữ lại 1 dòng duy nhất
  originCode?: string;       // alias for backward compatibility
  arrivalAirport: string;    // Giữ lại 1 dòng duy nhất
  destinationCode?: string;  // alias for backward compatibility
  departureAt: string;
  arrivalAt: string;
  durationMinutes: number;
  price: number;
  basePriceVnd?: number;     // alias for backward compatibility
  premiumCabin: boolean;
};

export function normalizeFlightDto(f: any): FlightDto {
  if (!f) return f;
  return {
    ...f,
    airlineName: f.airlineName || f.airline,
    originCode: f.originCode || f.departureAirport,
    destinationCode: f.destinationCode || f.arrivalAirport,
    basePriceVnd: f.basePriceVnd || f.price,
  };
}

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
    airline: f.airline,
    code: f.flightNumber,
    dep: timeFromLocalDateTime(f.departureAt),
    arr: timeFromLocalDateTime(f.arrivalAt),
    duration: minutesToDurationLabel(f.durationMinutes),
    priceVND: f.price,
    premium: f.premiumCabin,
  };
}

export async function searchFlightsApi(origin: string, destination: string, departureDate?: string): Promise<CatalogFlight[]> {
  const isoDate = departureDate ? ddMmYyyyToIsoDate(departureDate) : null;

  let start = null;
  let end = null;
  if (isoDate) {
    start = `${isoDate}T00:00:00`;
    end = `${isoDate}T23:59:59`;
  }

  const { data } = await axios.get<FlightDto[]>(`${API_BASE_URL}/api/v1/flights/search`, {
    params: {
      departureAirport: origin.trim().toUpperCase(),
      arrivalAirport: destination.trim().toUpperCase(),
      ...(start ? { start } : {}),
      ...((end ? { end } : {})),
      ...(isoDate
        ? {
            start: `${isoDate}T00:00:00`,
            end: `${isoDate}T23:59:59`,
          }
        : {}),
    },
    timeout: 25000,
  });
  return (Array.isArray(data) ? data : []).map(normalizeFlightDto).map(mapFlightDtoToCatalogFlight);
}