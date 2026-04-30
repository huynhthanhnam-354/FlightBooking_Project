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

function buildMockReply(input: string): AgentResponse {
  const normalized = input.toLowerCase();

  if (normalized.includes('rẻ') || normalized.includes('cheap')) {
    return {
      reply:
        'Mình gợi ý ưu tiên chuyến bay buổi trưa để giá tốt hơn. Bạn có thể chọn ghế thường để tiết kiệm thêm chi phí.',
      suggestions: [
        { id: 's1', label: 'Tìm chuyến rẻ nhất HAN -> SGN' },
        { id: 's2', label: 'So sánh giá theo khung giờ' },
      ],
    };
  }

  if (normalized.includes('ghế') || normalized.includes('seat')) {
    return {
      reply:
        'Nếu muốn thoải mái hơn, chọn hàng ghế extra legroom. Nếu muốn tối ưu chi phí, chọn ghế phổ thông không phụ phí.',
      suggestions: [
        { id: 's3', label: 'Giải thích phụ phí ghế' },
        { id: 's4', label: 'Gợi ý ghế cho gia đình' },
      ],
    };
  }

  return {
    reply:
      'Mình có thể giúp bạn tìm chuyến, gợi ý ghế, và tối ưu chi phí đặt vé. Bạn muốn đi tuyến nào và ngày nào?',
    suggestions: [
      { id: 's5', label: 'Tìm chuyến HAN -> SGN ngày mai' },
      { id: 's6', label: 'Gợi ý chuyến đi Đà Nẵng cuối tuần' },
    ],
  };
}

/**
 * Temporary mock implementation for mobile frontend.
 * When backend is ready, replace body with POST /agent/chat.
 */
export async function sendMessageToAgent(
  message: string,
  _context?: AgentRequestContext,
): Promise<AgentResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return buildMockReply(message);
}

