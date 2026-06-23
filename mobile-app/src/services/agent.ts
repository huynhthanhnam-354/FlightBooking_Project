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

export type AgentAction = {
  type?: string;
  label?: string;
  route?: string;
  payload?: Record<string, unknown>;
};

export type AgentResponse = {
  reply: string;
  suggestions: AgentSuggestion[];
  actions: AgentAction[];
  cards: Record<string, unknown>[];
};

export type AgentRequestContext = {
  from?: string;
  to?: string;
  date?: string;
  passengers?: number;
  budgetVnd?: number;
};

function normalizeSuggestion(item: unknown, index: number): AgentSuggestion {
  if (typeof item === 'string') {
    return { id: `suggestion-${index}-${item}`, label: item };
  }

  if (item && typeof item === 'object') {
    const raw = item as Partial<AgentSuggestion>;
    const label = String(raw.label || raw.id || '').trim();
    const id = String(raw.id || label || `suggestion-${index}`).trim();
    return {
      id,
      label: label || id,
    };
  }

  return { id: `suggestion-${index}`, label: String(item ?? '') };
}

function normalizeAction(item: unknown, index: number): AgentAction | null {
  if (!item || typeof item !== 'object') return null;
  const raw = item as Partial<AgentAction>;
  const type = String(raw.type || '').trim();
  const label = String(raw.label || raw.route || type || `Action ${index + 1}`).trim();
  const route = String(raw.route || '').trim();
  return {
    type,
    label,
    route,
    payload: raw.payload && typeof raw.payload === 'object' ? raw.payload : {},
  };
}

export async function sendMessageToAgent(
  message: string,
  context?: AgentRequestContext,
  language: Language = 'vi',
): Promise<AgentResponse> {
  const { data } = await axios.post<AgentResponse>(`${API_BASE_URL}/api/ai/chat`, {
    message,
    context,
    language,
    platform: 'mobile',
    sessionId: `mobile-${language}`,
  }, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 25000,
  });
  return {
    reply: data.reply,
    suggestions: Array.isArray(data.suggestions)
      ? data.suggestions
          .map(normalizeSuggestion)
          .filter((item) => item.label.trim().length > 0)
      : [],
    actions: Array.isArray(data.actions)
      ? data.actions
          .map(normalizeAction)
          .filter((item): item is AgentAction => !!item)
      : [],
    cards: Array.isArray(data.cards)
      ? data.cards.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
      : [],
  };
}
