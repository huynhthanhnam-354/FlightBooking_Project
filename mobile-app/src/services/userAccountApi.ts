import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { getAuthToken } from '../storage/authStorage';

export type MeResponse = {
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  shareAnalytics: boolean;
  marketingOptIn: boolean;
};

async function authHeaders() {
  const token = await getAuthToken();
  if (!token) throw new Error('Chưa đăng nhập hoặc phiên đã hết hạn.');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  } as const;
}

export async function fetchMe(): Promise<MeResponse> {
  const { data } = await axios.get<MeResponse>(`${API_BASE_URL}/api/me`, {
    headers: await authHeaders(),
    timeout: 25000,
  });
  return data;
}

export async function updateProfileApi(body: { fullName: string; phone: string }): Promise<MeResponse> {
  const { data } = await axios.patch<MeResponse>(`${API_BASE_URL}/api/me/profile`, body, {
    headers: await authHeaders(),
    timeout: 25000,
  });
  return data;
}

export async function updatePrivacyApi(body: {
  shareAnalytics: boolean;
  marketingOptIn: boolean;
}): Promise<MeResponse> {
  const { data } = await axios.patch<MeResponse>(`${API_BASE_URL}/api/me/privacy`, body, {
    headers: await authHeaders(),
    timeout: 25000,
  });
  return data;
}

export async function changePasswordApi(body: { currentPassword: string; newPassword: string }): Promise<void> {
  await axios.post(`${API_BASE_URL}/api/me/password`, body, {
    headers: await authHeaders(),
    timeout: 25000,
  });
}
