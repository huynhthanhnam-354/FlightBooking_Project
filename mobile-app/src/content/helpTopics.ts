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
    title: 'Trung tâm hỗ trợ',
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
    title: 'Support center',
    paragraphs: [
      'SkyBook hotline (demo): 1900-xxxx, 8:00–22:00 daily.',
      'Email: support@skybook.demo — we aim to reply within 24 hours.',
      'The AI Assistant tab can suggest flights and seats. For refunds or changes, please follow your fare rules with the airline.',
    ],
  },
};

const localizedCheckin: Partial<Record<Language, TopicBlock>> = {
  ko: {
    title: '온라인 체크인',
    paragraphs: [
      '온라인 체크인은 보통 출발 24시간 전부터 약 1시간 전까지 가능합니다. 항공사별로 다를 수 있으며 PNR과 승객 이름이 필요합니다.',
      '체크인 후 좌석을 확인하고 앱 또는 이메일로 모바일 탑승권을 받을 수 있습니다.',
      '공항에서는 신분증과 탑승권 QR 코드를 제시해 보안 검색과 탑승을 진행합니다.',
    ],
  },
  ja: {
    title: 'オンラインチェックイン',
    paragraphs: [
      'オンラインチェックインは通常、出発24時間前から約1時間前まで利用できます。航空会社により異なり、PNRと搭乗者名が必要です。',
      'チェックイン後、座席を確認し、アプリまたはメールでモバイル搭乗券を受け取れます。',
      '空港では身分証明書と搭乗券のQRコードを提示して保安検査と搭乗を行います。',
    ],
  },
  zh: {
    title: '网上值机',
    paragraphs: [
      '网上值机通常在起飞前24小时开放，并在起飞前约1小时关闭，具体时间取决于航空公司。你需要预订代码 PNR 和乘客姓名。',
      '值机后可以确认座位，并在应用或邮箱中获取电子登机牌。',
      '到达机场后，使用身份证件和登机牌二维码通过安检并登机。',
    ],
  },
  th: {
    title: 'เช็คอินออนไลน์',
    paragraphs: [
      'เช็คอินออนไลน์มักเปิดตั้งแต่ 24 ชั่วโมงก่อนออกเดินทางจนถึงประมาณ 1 ชั่วโมงก่อนบิน ขึ้นอยู่กับสายการบิน โดยต้องใช้รหัส PNR และชื่อผู้โดยสาร',
      'หลังเช็คอิน คุณสามารถตรวจสอบที่นั่งและรับบอร์ดดิ้งพาสบนแอปหรือทางอีเมล',
      'ที่สนามบิน ให้ใช้เอกสารประจำตัวและ QR บนบอร์ดดิ้งพาสเพื่อผ่านจุดตรวจและขึ้นเครื่อง',
    ],
  },
  es: {
    title: 'Check-in en línea',
    paragraphs: [
      'El check-in en línea suele abrir 24 horas antes de la salida y cerrar aproximadamente 1 hora antes, según la aerolínea. Necesitas el PNR y el nombre del pasajero.',
      'Después del check-in puedes confirmar el asiento y recibir la tarjeta de embarque móvil en la app o por correo.',
      'En el aeropuerto, usa tu documento de identidad y el QR de la tarjeta de embarque para pasar seguridad y abordar.',
    ],
  },
};

export function getHelpTopic(lang: Language, topic: HelpTopicId): TopicBlock {
  if (lang === 'vi') return vi[topic];
  if (topic === 'checkin' && localizedCheckin[lang]) return localizedCheckin[lang]!;
  return en[topic];
}
