// Mock notifications for Notification Center
const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'warning',
    title: 'Thay đổi giờ bay',
    message: 'Chuyến VJ123 đã thay đổi giờ khởi hành: 09:00 → 08:30. Vui lòng kiểm tra lại.',
    time: '2026-04-26T12:34:00Z',
    read: false
  },
  {
    id: 'n2',
    type: 'reminder',
    title: 'Nhắc nhở check-in trực tuyến',
    message: 'Check-in trực tuyến cho VN201 đã mở. Bạn có thể hoàn tất trong 24 giờ tới.',
    time: '2026-04-25T05:00:00Z',
    read: false
  },
  {
    id: 'n3',
    type: 'promo',
    title: 'Ưu đãi từ Trợ lý ảo',
    message: 'Giảm 10% cho vé nội địa hôm nay. Mã: AI10',
    time: '2026-04-20T09:00:00Z',
    read: true
  },
  {
    id: 'n4',
    type: 'success',
    title: 'Thanh toán thành công',
    message: 'Bạn đã thanh toán thành công cho PNRABC.',
    time: '2026-04-10T16:20:00Z',
    read: true
  },
  {
    id: 'n5',
    type: 'info',
    title: 'Hạn cuối đổi vé',
    message: 'Bạn có thể đổi vé miễn phí đến 48 giờ trước khởi hành.',
    time: '2026-04-14T08:00:00Z',
    read: false
  }
]

export default MOCK_NOTIFICATIONS
