import { translations, type Language } from '../i18n/translations';

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

/**
 * In-app copy only — no mock “AI” answers. Wire POST /agent/chat when backend exists.
 */
export async function sendMessageToAgent(
  _message: string,
  _context?: AgentRequestContext,
  language: Language = 'vi',
): Promise<AgentResponse> {
  await new Promise((resolve) => setTimeout(resolve, 280));
  const pack = translations[language];
  return {
    reply: pack.agent_assistant_reply,
    suggestions: [],
  };
}
