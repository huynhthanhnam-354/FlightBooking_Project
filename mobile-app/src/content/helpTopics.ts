import type { Language } from '../i18n/translations';

export type HelpTopicId = 'baggage' | 'checkin' | 'support';

type TopicBlock = { title: string; paragraphs: string[] };

const vi: Record<HelpTopicId, TopicBlock> = {
  baggage: {
    title: 'Hành lý ký gửi & xách tay',
    paragraphs: [
      'Hành lý xách tay: thường 7 kg, kích thước tối đa theo quy định từng hãng (tham khảo trên vé điện tử).',
      'Hành lý ký gửi: mua thêm trong bước đặt vé hoặc tại quầy làm thủ tục. Một số vé tiết kiệm không bao gồm ký gửi.',
      'Vật phẩm cấm: chất dễ cháy, pin lithium không đúng quy cách, chất lỏng vượt 100ml trong hành lý xách tay (theo quy định an ninh hàng không).',
    ],
  },
  checkin: {
    title: 'Check-in trực tuyến',
    paragraphs: [
      'Mở check-in trước giờ khởi hành thường từ 24 đến 1 giờ (tùy hãng). Bạn cần mã đặt chỗ (PNR) và họ tên hành khách.',
      'Sau khi check-in, bạn có thể chọn ghế (nếu chưa chọn) và nhận thẻ lên máy bay điện tử trong app hoặc email.',
      'Tại sân bay, chỉ cần hộ chiếu/CCCD và mã QR thẻ lên máy bay để qua cửa an ninh và lên máy bay.',
    ],
  },
  support: {
    title: 'Hỗ trợ & liên hệ',
    paragraphs: [
      'Hotline SkyBook (demo): 1900-xxxx, hoạt động 8:00–22:00 mỗi ngày.',
      'Email: support@skybook.demo — thời gian phản hồi trong 24 giờ.',
      'Tab AI Assistant có thể gợi ý nhanh về tìm chuyến và chọn ghế. Với hoàn vé/đổi vé, vui lòng liên hệ hãng bay theo điều kiện vé.',
    ],
  },
};

const en: Record<HelpTopicId, TopicBlock> = {
  baggage: {
    title: 'Baggage policy',
    paragraphs: [
      'Carry-on: typically up to 7 kg; size limits vary by airline (see your e-ticket).',
      'Checked baggage: add during booking or at the airport counter. Some economy fares exclude checked bags.',
      'Prohibited items include flammables, non-compliant lithium batteries, and liquids over 100 ml in carry-on where security rules apply.',
    ],
  },
  checkin: {
    title: 'Online check-in',
    paragraphs: [
      'Online check-in usually opens 24 hours before departure until about 1 hour before (varies by airline). You need your PNR and passenger name.',
      'After check-in you can select a seat (if not already chosen) and receive a mobile boarding pass in the app or by email.',
      'At the airport, use your ID and boarding pass QR to pass security and board.',
    ],
  },
  support: {
    title: 'Support & contact',
    paragraphs: [
      'SkyBook hotline (demo): 1900-xxxx, 8:00–22:00 daily.',
      'Email: support@skybook.demo — we aim to reply within 24 hours.',
      'The AI Assistant tab can suggest flights and seats. For refunds or changes, please follow your fare rules with the airline.',
    ],
  },
};

export function getHelpTopic(lang: Language, topic: HelpTopicId): TopicBlock {
  if (lang === 'vi') return vi[topic];
  return en[topic];
}
