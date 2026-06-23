import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { getAuthToken } from '../storage/authStorage';
import { normalizeFlightDto } from './flightApi';
import type { FlightDto } from './flightApi';

export type BookingDto = {
  id: number;
  userId?: number;
  userEmail?: string | null;
  userFullName?: string | null;
  pnr: string;
  status: string;
  seatNumber: string;
  passengerName: string;
  passengerEmail?: string | null;
  passengerPhone?: string | null;
  passengerIdCard?: string | null;
  passengerCount: number;
  tripType?: string | null;
  paymentMethod?: string | null;
  baggageKg?: number | null;
  baggageFeeVnd?: number | null;
  totalPriceVnd: number;
  createdAt: string;
  checkedInAt?: string | null;
  checkInChannel?: string | null;
  flight: FlightDto;
};

async function authHeaders() {
  const token = await getAuthToken();
  if (!token) throw new Error('Chưa đăng nhập.');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  } as const;
}

export type CreateBookingBody = {
  flightId: number;
  seatNumber: string;
  passengerName: string;
  passengerEmail: string;
  passengerPhone?: string;
  passengerIdCard?: string;
  passengerCount: number;
  tripType?: string;
  paymentMethod?: string;
  baggageKg?: number;
  baggageFeeVnd?: number;
  totalPriceVnd: number;
};

export function normalizeBookingDto(b: any): BookingDto {
  if (!b) return b;
  return {
    ...b,
    flight: normalizeFlightDto(b.flight),
  };
}

export async function createBookingApi(body: CreateBookingBody): Promise<BookingDto> {
  const { data } = await axios.post<BookingDto>(`${API_BASE_URL}/api/bookings`, body, {
    headers: await authHeaders(),
    timeout: 25000,
  });
  return normalizeBookingDto(data);
}

export async function listMyBookingsApi(): Promise<BookingDto[]> {
  const { data } = await axios.get<BookingDto[]>(`${API_BASE_URL}/api/bookings/me`, {
    headers: await authHeaders(),
    timeout: 25000,
  });
  return (Array.isArray(data) ? data : []).map(normalizeBookingDto);
}

export async function updateBookingBaggageApi(
  bookingId: number,
  body: { baggageKg: number; baggageFeeVnd: number },
): Promise<BookingDto> {
  const { data } = await axios.put<BookingDto>(`${API_BASE_URL}/api/bookings/${bookingId}/baggage`, body, {
    headers: await authHeaders(),
    timeout: 25000,
  });
  return normalizeBookingDto(data);
}

export async function confirmMockPaymentApi(bookingId: number): Promise<BookingDto> {
  const { data } = await axios.post<BookingDto>(
    `${API_BASE_URL}/api/bookings/${bookingId}/payment/mock-confirm`,
    {},
    {
      headers: await authHeaders(),
      timeout: 25000,
    },
  );
  return normalizeBookingDto(data);
}

export async function cancelBookingApi(bookingId: number): Promise<BookingDto> {
  const { data } = await axios.post<BookingDto>(
    `${API_BASE_URL}/api/bookings/${bookingId}/cancel`,
    {},
    {
      headers: await authHeaders(),
      timeout: 25000,
    },
  );
  return normalizeBookingDto(data);
}

export async function checkInBookingApi(body: { pnr: string; passengerLastName: string }): Promise<BookingDto> {
  const { data } = await axios.post<BookingDto>(`${API_BASE_URL}/api/bookings/check-in`, body, {
    headers: await authHeaders(),
    timeout: 25000,
  });
  return normalizeBookingDto(data);
}

export async function listOccupiedSeatsApi(flightId: number): Promise<string[]> {
  const { data } = await axios.get<string[]>(`${API_BASE_URL}/api/bookings/occupied-seats`, {
    params: { flightId },
    timeout: 25000,
  });
  return Array.isArray(data) ? data.map((x) => String(x).trim().toUpperCase()).filter(Boolean) : [];
}
