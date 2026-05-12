import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export type AuthResponse = {
  token: string;
  tokenType: string;
  email: string;
  fullName: string;
  role: string;
  phone?: string | null;
  shareAnalytics?: boolean;
  marketingOptIn?: boolean;
};

export type RegisterBody = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
};

export async function registerAccount(body: RegisterBody): Promise<AuthResponse> {
  const payload: Record<string, string> = {
    email: body.email.trim().toLowerCase(),
    password: body.password,
    fullName: body.fullName.trim(),
  };
  const p = body.phone?.trim();
  if (p) payload.phone = p;

  const { data } = await axios.post<AuthResponse>(`${API_BASE_URL}/api/auth/register`, payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 25000,
  });
  return data;
}

export async function loginAccount(body: { email: string; password: string }): Promise<AuthResponse> {
  const { data } = await axios.post<AuthResponse>(`${API_BASE_URL}/api/auth/login`, {
    email: body.email.trim().toLowerCase(),
    password: body.password,
  }, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 25000,
  });
  return data;
}

export function formatAuthError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const d = err.response?.data as any;
    if (typeof d?.message === 'string') return d.message;
    if (typeof d?.error === 'string') return d.error;
    if (err.response?.status === 400 && d?.message) return String(d.message);
    if (err.code === 'ECONNABORTED') return 'Timeout — kiểm tra backend đang chạy và URL mạng.';
    if (!err.response) return 'Không kết nối được máy chủ. Kiểm tra Wi‑Fi / URL backend.';
    return err.message || `Lỗi HTTP ${err.response.status}`;
  }
  return err instanceof Error ? err.message : String(err);
}
