import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import type { Language } from '../i18n/translations';

export type AgentRole = 'user' | 'assistant';

export type AgentMessage = {
  id: string;
  role: AgentRole;
  content: string;
  createdAt: string;
};

export type AgentSuggestion = {
  id: string;
  label: string;
};

export type AgentResponse = {
  reply: string;
  suggestions: AgentSuggestion[];
};

export type AgentRequestContext = {
  from?: string;
  to?: string;
  date?: string;
  passengers?: number;
  budgetVnd?: number;
};

export async function sendMessageToAgent(
  message: string,
  context?: AgentRequestContext,
  language: Language = 'vi',
): Promise<AgentResponse> {
  const { data } = await axios.post<AgentResponse>(`${API_BASE_URL}/api/agent/chat`, {
    message,
    context,
    language,
  }, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 25000,
  });
  return {
    reply: data.reply,
    suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
  };
}
