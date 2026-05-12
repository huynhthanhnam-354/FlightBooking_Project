import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { getAuthToken } from '../storage/authStorage';
import type { FlightDto } from './flightApi';

export type BookingDto = {
  id: number;
  pnr: string;
  status: string;
  seatNumber: string;
  passengerName: string;
  totalPriceVnd: number;
  createdAt: string;
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
  totalPriceVnd: number;
};

export async function createBookingApi(body: CreateBookingBody): Promise<BookingDto> {
  const { data } = await axios.post<BookingDto>(`${API_BASE_URL}/api/bookings`, body, {
    headers: await authHeaders(),
    timeout: 25000,
  });
  return data;
}

export async function listMyBookingsApi(): Promise<BookingDto[]> {
  const { data } = await axios.get<BookingDto[]>(`${API_BASE_URL}/api/bookings/me`, {
    headers: await authHeaders(),
    timeout: 25000,
  });
  return Array.isArray(data) ? data : [];
}
