import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { getAuthToken } from '../storage/authStorage';

export type SupportTicketDto = {
  id: number;
  code: string;
  userEmail: string;
  userName: string;
  bookingId?: number | null;
  pnr?: string | null;
  category: string;
  message: string;
  adminReply?: string | null;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
};

async function authHeaders() {
  const token = await getAuthToken();
  if (!token) throw new Error('Chưa đăng nhập.');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  } as const;
}

export async function createSupportTicketApi(body: {
  category: string;
  pnr?: string;
  message: string;
}): Promise<SupportTicketDto> {
  const { data } = await axios.post<SupportTicketDto>(`${API_BASE_URL}/api/support-tickets`, body, {
    headers: await authHeaders(),
    timeout: 25000,
  });
  return data;
}
