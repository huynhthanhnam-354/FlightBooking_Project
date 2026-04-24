export type Language = 'vi' | 'en' | 'ko' | 'ja' | 'zh' | 'th' | 'es';

export const LANGUAGE_LABELS: Record<string, Language> = {
  'Tiếng Việt':  'vi',
  'English':     'en',
  '한국어':        'ko',
  '日本語':        'ja',
  '中文':          'zh',
  'ภาษาไทย':     'th',
  'Español':     'es',
};

type TranslationKeys = {
  // ── Onboarding ──────────────────────────────
  welcome_title: string; welcome_subtitle: string;
  preferred_currency: string; choose_currency: string;
  preferred_language: string; choose_language: string;
  continue_btn: string; skip_now: string;

  // ── Chung ───────────────────────────────────
  search: string; cancel: string; confirm: string;
  back: string; next: string; see_all: string;

  // ── Đăng nhập / Đăng ký ─────────────────────
  login_title: string; email: string; email_placeholder: string;
  password: string; password_placeholder: string; forgot_password: string;
  login_btn: string; or: string; no_account: string; register_link: string;
  register_title: string; register_subtitle: string;
  full_name: string; full_name_placeholder: string;
  phone: string; phone_placeholder: string;
  confirm_password: string; confirm_password_placeholder: string;
  agree_terms: string; terms_service: string; and: string; privacy_policy: string;
  register_btn: string; have_account: string; login_link: string;

  // ── Trang chủ ───────────────────────────────
  greeting: string; home_title: string;
  one_way: string; round_trip: string; from: string; to: string;
  departure_date: string; passengers: string; adult: string;
  search_flight: string;
  todays_deals: string; popular_flights: string;

  // ── 6 danh mục (chỉ máy bay) ────────────────
  quick_access: string;
  cat_book_flight: string; cat_flight_status: string;
  cat_my_tickets: string; cat_baggage: string;
  cat_checkin: string; cat_support: string;

  // ── Tìm kiếm chuyến bay ─────────────────────
  filter_all: string; filter_cheapest: string;
  filter_earliest: string; filter_fastest: string; filter_business: string;
  flights: string; direct: string; economy: string; business_class: string;
  per_person: string; select_flight: string; edit: string; passenger: string;

  // ── Đặt vé (3 bước) ─────────────────────────
  book_ticket: string; step_details: string; step_passenger: string; step_payment: string;
  flight_details: string; choose_seat: string; price_summary: string;
  base_fare: string; tax_fee: string; luggage: string; free: string; total: string;
  passenger_info: string; id_passport: string; id_placeholder: string;
  payment_method: string; credit_card: string; bank_transfer: string;
  e_wallet: string; cod: string; booking_confirm: string;
  airline: string; flight_no: string; seat_class: string; seat: string;
  confirm_book: string; booking_success: string; booking_code: string;

  // ── Hồ sơ / Cài đặt ─────────────────────────
  push_notif: string; edit_info: string; language: string; currency: string;
  security: string; support: string; rate_app: string;
  logout: string; logout_confirm: string; logout_title: string; cancel_btn: string;
  settings_tab: string; history_tab: string; trips: string; member: string;
  confirmed: string; pending_payment: string; completed: string;

  // ── Tab bar ──────────────────────────────────
  tab_home: string; tab_flights: string; tab_bookings: string; tab_profile: string;
};

// ─────────────────────────────────────────────
// 🇻🇳 TIẾNG VIỆT
// ─────────────────────────────────────────────
const vi: TranslationKeys = {
  welcome_title: 'Xin chào! Chào mừng đến với\nSkyBook.',
  welcome_subtitle: 'Ứng dụng đặt vé máy bay nhanh chóng & tiện lợi.',
  preferred_currency: 'Tiền tệ ưa thích', choose_currency: 'Chọn tiền tệ',
  preferred_language: 'Ngôn ngữ ưa thích', choose_language: 'Chọn ngôn ngữ',
  continue_btn: 'Tiếp tục', skip_now: 'Bỏ qua',
  search: 'Tìm kiếm', cancel: 'Hủy', confirm: 'Xác nhận',
  back: 'Quay lại', next: 'Tiếp theo', see_all: 'Xem tất cả',
  login_title: 'Đăng nhập', email: 'Email', email_placeholder: 'Nhập địa chỉ email',
  password: 'Mật khẩu', password_placeholder: 'Nhập mật khẩu',
  forgot_password: 'Quên mật khẩu?', login_btn: 'Đăng nhập', or: 'hoặc',
  no_account: 'Chưa có tài khoản? ', register_link: 'Đăng ký ngay',
  register_title: 'Tạo tài khoản', register_subtitle: 'Đăng ký miễn phí và bắt đầu đặt vé ngay',
  full_name: 'Họ và tên', full_name_placeholder: 'Nhập họ và tên đầy đủ',
  phone: 'Số điện thoại', phone_placeholder: 'Nhập số điện thoại',
  confirm_password: 'Xác nhận mật khẩu', confirm_password_placeholder: 'Nhập lại mật khẩu',
  agree_terms: 'Tôi đồng ý với ', terms_service: 'Điều khoản dịch vụ',
  and: ' và ', privacy_policy: 'Chính sách bảo mật',
  register_btn: 'Tạo tài khoản', have_account: 'Đã có tài khoản? ', login_link: 'Đăng nhập',
  greeting: 'Xin chào', home_title: 'Bạn muốn bay đến đâu?',
  one_way: 'Một chiều', round_trip: 'Khứ hồi', from: 'Từ', to: 'Đến',
  departure_date: 'Ngày đi', passengers: 'Hành khách', adult: 'Người lớn',
  search_flight: 'Tìm chuyến bay',
  todays_deals: 'Ưu đãi hôm nay', popular_flights: 'Chuyến bay phổ biến',
  quick_access: 'Tiện ích',
  cat_book_flight: 'Đặt vé', cat_flight_status: 'Tra cứu\nchuyến bay',
  cat_my_tickets: 'Vé của tôi', cat_baggage: 'Hành lý',
  cat_checkin: 'Check-in\nonline', cat_support: 'Hỗ trợ',
  filter_all: 'Tất cả', filter_cheapest: 'Rẻ nhất',
  filter_earliest: 'Sớm nhất', filter_fastest: 'Nhanh nhất', filter_business: 'Thương gia',
  flights: 'chuyến bay', direct: 'Bay thẳng', economy: 'Phổ thông',
  business_class: 'Thương gia', per_person: '/người',
  select_flight: 'Chọn chuyến này', edit: 'Chỉnh sửa', passenger: 'Hành khách',
  book_ticket: 'Đặt vé', step_details: 'Chi tiết', step_passenger: 'Hành khách', step_payment: 'Thanh toán',
  flight_details: 'Chi tiết chuyến bay', choose_seat: 'Chọn ghế',
  price_summary: 'Tóm tắt giá', base_fare: 'Giá vé cơ bản',
  tax_fee: 'Thuế & phí', luggage: 'Hành lý ký gửi', free: 'Miễn phí', total: 'Tổng cộng',
  passenger_info: 'Thông tin hành khách', id_passport: 'CCCD / Hộ chiếu',
  id_placeholder: 'Nhập số CCCD hoặc hộ chiếu',
  payment_method: 'Phương thức thanh toán', credit_card: 'Thẻ tín dụng / ghi nợ',
  bank_transfer: 'Chuyển khoản ngân hàng', e_wallet: 'Ví điện tử (MoMo, ZaloPay)',
  cod: 'Thanh toán khi nhận vé', booking_confirm: 'Xác nhận đặt chỗ',
  airline: 'Hãng bay', flight_no: 'Số hiệu', seat_class: 'Hạng ghế', seat: 'Ghế',
  confirm_book: 'Xác nhận đặt vé', booking_success: 'Đặt vé thành công!',
  booking_code: 'Mã đặt chỗ: SB-2025-0425\nVui lòng kiểm tra email.',
  push_notif: 'Thông báo đẩy', edit_info: 'Chỉnh sửa thông tin',
  language: 'Ngôn ngữ', currency: 'Tiền tệ',
  security: 'Bảo mật & Quyền riêng tư', support: 'Hỗ trợ & Trợ giúp',
  rate_app: 'Đánh giá ứng dụng', logout: 'Đăng xuất',
  logout_confirm: 'Bạn chắc chắn muốn đăng xuất?', logout_title: 'Đăng xuất', cancel_btn: 'Hủy',
  settings_tab: 'Cài đặt', history_tab: 'Lịch sử đặt vé',
  trips: 'chuyến bay', member: 'Thành viên',
  confirmed: 'Đã xác nhận', pending_payment: 'Chờ thanh toán', completed: 'Đã hoàn thành',
  tab_home: 'Trang chủ', tab_flights: 'Chuyến bay', tab_bookings: 'Đặt chỗ', tab_profile: 'Tài khoản',
};

// ─────────────────────────────────────────────
// 🇬🇧 ENGLISH
// ─────────────────────────────────────────────
const en: TranslationKeys = {
  welcome_title: 'Hello! Welcome to\nSkyBook.',
  welcome_subtitle: 'Fast & easy flight ticket booking app.',
  preferred_currency: 'Preferred Currency', choose_currency: 'Choose currency',
  preferred_language: 'Preferred Language', choose_language: 'Choose language',
  continue_btn: 'Continue', skip_now: 'Skip for now',
  search: 'Search', cancel: 'Cancel', confirm: 'Confirm',
  back: 'Back', next: 'Next', see_all: 'See all',
  login_title: 'Sign In', email: 'Email', email_placeholder: 'Enter email address',
  password: 'Password', password_placeholder: 'Enter password',
  forgot_password: 'Forgot password?', login_btn: 'Sign In', or: 'or',
  no_account: "Don't have an account? ", register_link: 'Register now',
  register_title: 'Create Account', register_subtitle: 'Register for free and start booking now',
  full_name: 'Full Name', full_name_placeholder: 'Enter full name',
  phone: 'Phone Number', phone_placeholder: 'Enter phone number',
  confirm_password: 'Confirm Password', confirm_password_placeholder: 'Re-enter password',
  agree_terms: 'I agree to the ', terms_service: 'Terms of Service',
  and: ' and ', privacy_policy: 'Privacy Policy',
  register_btn: 'Create Account', have_account: 'Already have an account? ', login_link: 'Sign In',
  greeting: 'Hello', home_title: 'Where do you want to fly?',
  one_way: 'One Way', round_trip: 'Round Trip', from: 'From', to: 'To',
  departure_date: 'Departure', passengers: 'Passengers', adult: 'Adult',
  search_flight: 'Search Flights',
  todays_deals: "Today's Deals", popular_flights: 'Popular Flights',
  quick_access: 'Quick Access',
  cat_book_flight: 'Book\nFlight', cat_flight_status: 'Flight\nStatus',
  cat_my_tickets: 'My Tickets', cat_baggage: 'Baggage',
  cat_checkin: 'Online\nCheck-in', cat_support: 'Support',
  filter_all: 'All', filter_cheapest: 'Cheapest',
  filter_earliest: 'Earliest', filter_fastest: 'Fastest', filter_business: 'Business',
  flights: 'flights', direct: 'Direct', economy: 'Economy',
  business_class: 'Business', per_person: '/person',
  select_flight: 'Select this flight', edit: 'Edit', passenger: 'Passenger',
  book_ticket: 'Book Ticket', step_details: 'Details', step_passenger: 'Passenger', step_payment: 'Payment',
  flight_details: 'Flight Details', choose_seat: 'Choose Seat',
  price_summary: 'Price Summary', base_fare: 'Base fare',
  tax_fee: 'Tax & fees', luggage: 'Baggage', free: 'Free', total: 'Total',
  passenger_info: 'Passenger Info', id_passport: 'ID / Passport',
  id_placeholder: 'Enter ID or passport number',
  payment_method: 'Payment Method', credit_card: 'Credit / Debit card',
  bank_transfer: 'Bank transfer', e_wallet: 'E-wallet',
  cod: 'Pay on delivery', booking_confirm: 'Booking Confirmation',
  airline: 'Airline', flight_no: 'Flight No.', seat_class: 'Seat Class', seat: 'Seat',
  confirm_book: 'Confirm Booking', booking_success: 'Booking Successful!',
  booking_code: 'Booking code: SB-2025-0425\nPlease check your email.',
  push_notif: 'Push Notifications', edit_info: 'Edit Profile',
  language: 'Language', currency: 'Currency',
  security: 'Security & Privacy', support: 'Support & Help',
  rate_app: 'Rate the App', logout: 'Logout',
  logout_confirm: 'Are you sure you want to logout?', logout_title: 'Logout', cancel_btn: 'Cancel',
  settings_tab: 'Settings', history_tab: 'Booking History',
  trips: 'trips', member: 'Member',
  confirmed: 'Confirmed', pending_payment: 'Pending Payment', completed: 'Completed',
  tab_home: 'Home', tab_flights: 'Flights', tab_bookings: 'Bookings', tab_profile: 'Account',
};

// ─────────────────────────────────────────────
// 🇰🇷 한국어 (KOREAN)
// ─────────────────────────────────────────────
const ko: TranslationKeys = {
  welcome_title: '안녕하세요! SkyBook에\n오신 것을 환영합니다.',
  welcome_subtitle: '빠르고 편리한 항공권 예약 앱.',
  preferred_currency: '선호 통화', choose_currency: '통화 선택',
  preferred_language: '선호 언어', choose_language: '언어 선택',
  continue_btn: '계속', skip_now: '건너뛰기',
  search: '검색', cancel: '취소', confirm: '확인',
  back: '뒤로', next: '다음', see_all: '전체 보기',
  login_title: '로그인', email: '이메일', email_placeholder: '이메일 주소 입력',
  password: '비밀번호', password_placeholder: '비밀번호 입력',
  forgot_password: '비밀번호를 잊으셨나요?', login_btn: '로그인', or: '또는',
  no_account: '계정이 없으신가요? ', register_link: '지금 가입',
  register_title: '계정 만들기', register_subtitle: '무료로 가입하고 지금 예약을 시작하세요',
  full_name: '성명', full_name_placeholder: '성명을 입력하세요',
  phone: '전화번호', phone_placeholder: '전화번호를 입력하세요',
  confirm_password: '비밀번호 확인', confirm_password_placeholder: '비밀번호를 다시 입력하세요',
  agree_terms: '동의합니다: ', terms_service: '서비스 약관',
  and: ' 및 ', privacy_policy: '개인정보 처리방침',
  register_btn: '계정 만들기', have_account: '이미 계정이 있으신가요? ', login_link: '로그인',
  greeting: '안녕하세요', home_title: '어디로 비행하시겠어요?',
  one_way: '편도', round_trip: '왕복', from: '출발지', to: '목적지',
  departure_date: '출발일', passengers: '승객', adult: '성인',
  search_flight: '항공편 검색',
  todays_deals: '오늘의 특가', popular_flights: '인기 항공편',
  quick_access: '빠른 메뉴',
  cat_book_flight: '항공권\n예약', cat_flight_status: '운항\n현황',
  cat_my_tickets: '내 항공권', cat_baggage: '수하물',
  cat_checkin: '온라인\n체크인', cat_support: '고객센터',
  filter_all: '전체', filter_cheapest: '최저가',
  filter_earliest: '가장 이른', filter_fastest: '가장 빠른', filter_business: '비즈니스',
  flights: '항공편', direct: '직항', economy: '일반석',
  business_class: '비즈니스석', per_person: '/인',
  select_flight: '이 항공편 선택', edit: '수정', passenger: '승객',
  book_ticket: '항공권 예약', step_details: '상세정보', step_passenger: '승객', step_payment: '결제',
  flight_details: '항공편 상세정보', choose_seat: '좌석 선택',
  price_summary: '가격 요약', base_fare: '기본 요금',
  tax_fee: '세금 및 수수료', luggage: '수하물', free: '무료', total: '합계',
  passenger_info: '승객 정보', id_passport: '신분증 / 여권',
  id_placeholder: '신분증 또는 여권 번호 입력',
  payment_method: '결제 수단', credit_card: '신용카드 / 체크카드',
  bank_transfer: '계좌 이체', e_wallet: '전자 지갑',
  cod: '수령 시 결제', booking_confirm: '예약 확인',
  airline: '항공사', flight_no: '항공편 번호', seat_class: '좌석 등급', seat: '좌석',
  confirm_book: '예약 확정', booking_success: '예약 완료!',
  booking_code: '예약 코드: SB-2025-0425\n이메일을 확인해 주세요.',
  push_notif: '푸시 알림', edit_info: '프로필 수정',
  language: '언어', currency: '통화',
  security: '보안 및 개인정보', support: '고객센터',
  rate_app: '앱 평가', logout: '로그아웃',
  logout_confirm: '로그아웃 하시겠습니까?', logout_title: '로그아웃', cancel_btn: '취소',
  settings_tab: '설정', history_tab: '예약 내역',
  trips: '항공편', member: '회원',
  confirmed: '예약 확정', pending_payment: '결제 대기', completed: '완료',
  tab_home: '홈', tab_flights: '항공편', tab_bookings: '예약', tab_profile: '계정',
};

// ─────────────────────────────────────────────
// 🇯🇵 日本語 (JAPANESE)
// ─────────────────────────────────────────────
const ja: TranslationKeys = {
  welcome_title: 'こんにちは！SkyBookへ\nようこそ。',
  welcome_subtitle: '快速・便利な航空券予約アプリ。',
  preferred_currency: '希望通貨', choose_currency: '通貨を選択',
  preferred_language: '希望言語', choose_language: '言語を選択',
  continue_btn: '続ける', skip_now: 'スキップ',
  search: '検索', cancel: 'キャンセル', confirm: '確認',
  back: '戻る', next: '次へ', see_all: 'すべて見る',
  login_title: 'ログイン', email: 'メールアドレス', email_placeholder: 'メールアドレスを入力',
  password: 'パスワード', password_placeholder: 'パスワードを入力',
  forgot_password: 'パスワードをお忘れですか？', login_btn: 'ログイン', or: 'または',
  no_account: 'アカウントをお持ちでないですか？ ', register_link: '今すぐ登録',
  register_title: 'アカウント作成', register_subtitle: '無料登録して今すぐ予約を始めましょう',
  full_name: '氏名', full_name_placeholder: '氏名を入力してください',
  phone: '電話番号', phone_placeholder: '電話番号を入力してください',
  confirm_password: 'パスワード確認', confirm_password_placeholder: 'パスワードを再入力',
  agree_terms: '同意します: ', terms_service: '利用規約',
  and: ' および ', privacy_policy: 'プライバシーポリシー',
  register_btn: 'アカウント作成', have_account: 'すでにアカウントをお持ちですか？ ', login_link: 'ログイン',
  greeting: 'こんにちは', home_title: 'どこへ飛びたいですか？',
  one_way: '片道', round_trip: '往復', from: '出発地', to: '目的地',
  departure_date: '出発日', passengers: '乗客', adult: '大人',
  search_flight: 'フライトを検索',
  todays_deals: '本日の特価', popular_flights: '人気フライト',
  quick_access: 'クイックアクセス',
  cat_book_flight: '航空券\n予約', cat_flight_status: 'フライト\n状況',
  cat_my_tickets: '予約確認', cat_baggage: '手荷物',
  cat_checkin: 'オンライン\nチェックイン', cat_support: 'サポート',
  filter_all: 'すべて', filter_cheapest: '最安値',
  filter_earliest: '最も早い', filter_fastest: '最速', filter_business: 'ビジネス',
  flights: '便', direct: '直行便', economy: 'エコノミー',
  business_class: 'ビジネスクラス', per_person: '/人',
  select_flight: 'このフライトを選択', edit: '編集', passenger: '乗客',
  book_ticket: '航空券予約', step_details: '詳細', step_passenger: '乗客', step_payment: '支払い',
  flight_details: 'フライト詳細', choose_seat: '座席選択',
  price_summary: '料金概要', base_fare: '基本運賃',
  tax_fee: '税金・手数料', luggage: '受託手荷物', free: '無料', total: '合計',
  passenger_info: '乗客情報', id_passport: '身分証 / パスポート',
  id_placeholder: '身分証またはパスポート番号を入力',
  payment_method: '支払い方法', credit_card: 'クレジット / デビットカード',
  bank_transfer: '銀行振込', e_wallet: '電子マネー',
  cod: '受取時支払い', booking_confirm: '予約確認',
  airline: '航空会社', flight_no: '便名', seat_class: '座席クラス', seat: '座席',
  confirm_book: '予約を確定', booking_success: '予約完了！',
  booking_code: '予約コード: SB-2025-0425\nメールをご確認ください。',
  push_notif: 'プッシュ通知', edit_info: 'プロフィール編集',
  language: '言語', currency: '通貨',
  security: 'セキュリティとプライバシー', support: 'サポート',
  rate_app: 'アプリを評価', logout: 'ログアウト',
  logout_confirm: 'ログアウトしてもよろしいですか？', logout_title: 'ログアウト', cancel_btn: 'キャンセル',
  settings_tab: '設定', history_tab: '予約履歴',
  trips: '便', member: 'メンバー',
  confirmed: '予約確定', pending_payment: '支払い待ち', completed: '完了',
  tab_home: 'ホーム', tab_flights: 'フライト', tab_bookings: '予約', tab_profile: 'アカウント',
};

// ─────────────────────────────────────────────
// 🇨🇳 中文 (CHINESE)
// ─────────────────────────────────────────────
const zh: TranslationKeys = {
  welcome_title: '你好！欢迎来到\nSkyBook。',
  welcome_subtitle: '快速便捷的机票预订应用。',
  preferred_currency: '首选货币', choose_currency: '选择货币',
  preferred_language: '首选语言', choose_language: '选择语言',
  continue_btn: '继续', skip_now: '暂时跳过',
  search: '搜索', cancel: '取消', confirm: '确认',
  back: '返回', next: '下一步', see_all: '查看全部',
  login_title: '登录', email: '电子邮件', email_placeholder: '输入电子邮件地址',
  password: '密码', password_placeholder: '输入密码',
  forgot_password: '忘记密码？', login_btn: '登录', or: '或者',
  no_account: '还没有账户？', register_link: '立即注册',
  register_title: '创建账户', register_subtitle: '免费注册，立即开始预订',
  full_name: '姓名', full_name_placeholder: '输入全名',
  phone: '手机号码', phone_placeholder: '输入手机号码',
  confirm_password: '确认密码', confirm_password_placeholder: '再次输入密码',
  agree_terms: '我同意', terms_service: '服务条款',
  and: '和', privacy_policy: '隐私政策',
  register_btn: '创建账户', have_account: '已有账户？', login_link: '登录',
  greeting: '你好', home_title: '您想飞往哪里？',
  one_way: '单程', round_trip: '往返', from: '出发地', to: '目的地',
  departure_date: '出发日期', passengers: '乘客', adult: '成人',
  search_flight: '搜索航班',
  todays_deals: '今日优惠', popular_flights: '热门航班',
  quick_access: '快速入口',
  cat_book_flight: '订机票', cat_flight_status: '航班\n状态',
  cat_my_tickets: '我的机票', cat_baggage: '行李',
  cat_checkin: '网上\n值机', cat_support: '客服',
  filter_all: '全部', filter_cheapest: '最便宜',
  filter_earliest: '最早', filter_fastest: '最快', filter_business: '商务舱',
  flights: '航班', direct: '直达', economy: '经济舱',
  business_class: '商务舱', per_person: '/人',
  select_flight: '选择此航班', edit: '编辑', passenger: '乘客',
  book_ticket: '预订机票', step_details: '详情', step_passenger: '乘客', step_payment: '付款',
  flight_details: '航班详情', choose_seat: '选择座位',
  price_summary: '价格摘要', base_fare: '基础票价',
  tax_fee: '税费', luggage: '托运行李', free: '免费', total: '合计',
  passenger_info: '乘客信息', id_passport: '身份证 / 护照',
  id_placeholder: '输入身份证或护照号码',
  payment_method: '支付方式', credit_card: '信用卡 / 借记卡',
  bank_transfer: '银行转账', e_wallet: '电子钱包',
  cod: '取票时付款', booking_confirm: '预订确认',
  airline: '航空公司', flight_no: '航班号', seat_class: '舱位', seat: '座位',
  confirm_book: '确认预订', booking_success: '预订成功！',
  booking_code: '预订代码：SB-2025-0425\n请查看您的电子邮件。',
  push_notif: '推送通知', edit_info: '编辑资料',
  language: '语言', currency: '货币',
  security: '安全与隐私', support: '客服支持',
  rate_app: '评价应用', logout: '退出登录',
  logout_confirm: '您确定要退出登录吗？', logout_title: '退出登录', cancel_btn: '取消',
  settings_tab: '设置', history_tab: '预订历史',
  trips: '航班', member: '会员',
  confirmed: '已确认', pending_payment: '待付款', completed: '已完成',
  tab_home: '首页', tab_flights: '航班', tab_bookings: '预订', tab_profile: '账户',
};

// ─────────────────────────────────────────────
// 🇹🇭 ภาษาไทย (THAI)
// ─────────────────────────────────────────────
const th: TranslationKeys = {
  welcome_title: 'สวัสดี! ยินดีต้อนรับสู่\nSkyBook',
  welcome_subtitle: 'แอปจองตั๋วเครื่องบินที่รวดเร็วและสะดวก',
  preferred_currency: 'สกุลเงินที่ต้องการ', choose_currency: 'เลือกสกุลเงิน',
  preferred_language: 'ภาษาที่ต้องการ', choose_language: 'เลือกภาษา',
  continue_btn: 'ดำเนินการต่อ', skip_now: 'ข้ามไปก่อน',
  search: 'ค้นหา', cancel: 'ยกเลิก', confirm: 'ยืนยัน',
  back: 'ย้อนกลับ', next: 'ถัดไป', see_all: 'ดูทั้งหมด',
  login_title: 'เข้าสู่ระบบ', email: 'อีเมล', email_placeholder: 'กรอกที่อยู่อีเมล',
  password: 'รหัสผ่าน', password_placeholder: 'กรอกรหัสผ่าน',
  forgot_password: 'ลืมรหัสผ่าน?', login_btn: 'เข้าสู่ระบบ', or: 'หรือ',
  no_account: 'ยังไม่มีบัญชี? ', register_link: 'สมัครสมาชิก',
  register_title: 'สร้างบัญชี', register_subtitle: 'ลงทะเบียนฟรีและเริ่มจองได้เลย',
  full_name: 'ชื่อ-นามสกุล', full_name_placeholder: 'กรอกชื่อ-นามสกุล',
  phone: 'เบอร์โทรศัพท์', phone_placeholder: 'กรอกเบอร์โทรศัพท์',
  confirm_password: 'ยืนยันรหัสผ่าน', confirm_password_placeholder: 'กรอกรหัสผ่านอีกครั้ง',
  agree_terms: 'ฉันยอมรับ ', terms_service: 'ข้อกำหนดการใช้งาน',
  and: ' และ ', privacy_policy: 'นโยบายความเป็นส่วนตัว',
  register_btn: 'สร้างบัญชี', have_account: 'มีบัญชีอยู่แล้ว? ', login_link: 'เข้าสู่ระบบ',
  greeting: 'สวัสดี', home_title: 'คุณอยากบินไปที่ไหน?',
  one_way: 'เที่ยวเดียว', round_trip: 'ไป-กลับ', from: 'จาก', to: 'ไปยัง',
  departure_date: 'วันเดินทาง', passengers: 'ผู้โดยสาร', adult: 'ผู้ใหญ่',
  search_flight: 'ค้นหาเที่ยวบิน',
  todays_deals: 'โปรโมชั่นวันนี้', popular_flights: 'เที่ยวบินยอดนิยม',
  quick_access: 'เมนูด่วน',
  cat_book_flight: 'จองตั๋ว', cat_flight_status: 'สถานะ\nเที่ยวบิน',
  cat_my_tickets: 'ตั๋วของฉัน', cat_baggage: 'กระเป๋า',
  cat_checkin: 'เช็คอิน\nออนไลน์', cat_support: 'บริการ\nลูกค้า',
  filter_all: 'ทั้งหมด', filter_cheapest: 'ราคาถูกสุด',
  filter_earliest: 'เร็วที่สุด', filter_fastest: 'เร็วที่สุด', filter_business: 'ชั้นธุรกิจ',
  flights: 'เที่ยวบิน', direct: 'ตรง', economy: 'ชั้นประหยัด',
  business_class: 'ชั้นธุรกิจ', per_person: '/คน',
  select_flight: 'เลือกเที่ยวบินนี้', edit: 'แก้ไข', passenger: 'ผู้โดยสาร',
  book_ticket: 'จองตั๋ว', step_details: 'รายละเอียด', step_passenger: 'ผู้โดยสาร', step_payment: 'การชำระเงิน',
  flight_details: 'รายละเอียดเที่ยวบิน', choose_seat: 'เลือกที่นั่ง',
  price_summary: 'สรุปราคา', base_fare: 'ราคาตั๋วพื้นฐาน',
  tax_fee: 'ภาษีและค่าธรรมเนียม', luggage: 'กระเป๋าโหลด', free: 'ฟรี', total: 'รวมทั้งหมด',
  passenger_info: 'ข้อมูลผู้โดยสาร', id_passport: 'บัตรประชาชน / พาสปอร์ต',
  id_placeholder: 'กรอกหมายเลขบัตรประชาชนหรือพาสปอร์ต',
  payment_method: 'วิธีการชำระเงิน', credit_card: 'บัตรเครดิต / เดบิต',
  bank_transfer: 'โอนเงินผ่านธนาคาร', e_wallet: 'กระเป๋าเงินอิเล็กทรอนิกส์',
  cod: 'ชำระเงินเมื่อรับตั๋ว', booking_confirm: 'ยืนยันการจอง',
  airline: 'สายการบิน', flight_no: 'หมายเลขเที่ยวบิน', seat_class: 'ชั้นที่นั่ง', seat: 'ที่นั่ง',
  confirm_book: 'ยืนยันการจอง', booking_success: 'จองสำเร็จ!',
  booking_code: 'รหัสการจอง: SB-2025-0425\nกรุณาตรวจสอบอีเมลของคุณ',
  push_notif: 'การแจ้งเตือน', edit_info: 'แก้ไขโปรไฟล์',
  language: 'ภาษา', currency: 'สกุลเงิน',
  security: 'ความปลอดภัยและความเป็นส่วนตัว', support: 'การสนับสนุน',
  rate_app: 'ให้คะแนนแอป', logout: 'ออกจากระบบ',
  logout_confirm: 'คุณแน่ใจว่าต้องการออกจากระบบ?', logout_title: 'ออกจากระบบ', cancel_btn: 'ยกเลิก',
  settings_tab: 'การตั้งค่า', history_tab: 'ประวัติการจอง',
  trips: 'เที่ยวบิน', member: 'สมาชิก',
  confirmed: 'ยืนยันแล้ว', pending_payment: 'รอการชำระเงิน', completed: 'เสร็จสิ้น',
  tab_home: 'หน้าหลัก', tab_flights: 'เที่ยวบิน', tab_bookings: 'การจอง', tab_profile: 'บัญชี',
};

// ─────────────────────────────────────────────
// 🌎 ESPAÑOL (SPANISH)
// ─────────────────────────────────────────────
const es: TranslationKeys = {
  welcome_title: '¡Hola! Bienvenido a\nSkyBook.',
  welcome_subtitle: 'App de reserva de vuelos rápida y conveniente.',
  preferred_currency: 'Moneda preferida', choose_currency: 'Elegir moneda',
  preferred_language: 'Idioma preferido', choose_language: 'Elegir idioma',
  continue_btn: 'Continuar', skip_now: 'Omitir por ahora',
  search: 'Buscar', cancel: 'Cancelar', confirm: 'Confirmar',
  back: 'Volver', next: 'Siguiente', see_all: 'Ver todo',
  login_title: 'Iniciar sesión', email: 'Correo electrónico', email_placeholder: 'Ingresa tu correo',
  password: 'Contraseña', password_placeholder: 'Ingresa tu contraseña',
  forgot_password: '¿Olvidaste tu contraseña?', login_btn: 'Iniciar sesión', or: 'o',
  no_account: '¿No tienes cuenta? ', register_link: 'Regístrate ahora',
  register_title: 'Crear cuenta', register_subtitle: 'Regístrate gratis y empieza a reservar',
  full_name: 'Nombre completo', full_name_placeholder: 'Ingresa tu nombre completo',
  phone: 'Número de teléfono', phone_placeholder: 'Ingresa tu número de teléfono',
  confirm_password: 'Confirmar contraseña', confirm_password_placeholder: 'Vuelve a ingresar la contraseña',
  agree_terms: 'Acepto los ', terms_service: 'Términos de servicio',
  and: ' y la ', privacy_policy: 'Política de privacidad',
  register_btn: 'Crear cuenta', have_account: '¿Ya tienes cuenta? ', login_link: 'Iniciar sesión',
  greeting: '¡Hola', home_title: '¿A dónde quieres volar?',
  one_way: 'Solo ida', round_trip: 'Ida y vuelta', from: 'Desde', to: 'Hasta',
  departure_date: 'Fecha de salida', passengers: 'Pasajeros', adult: 'Adulto',
  search_flight: 'Buscar vuelos',
  todays_deals: 'Ofertas de hoy', popular_flights: 'Vuelos populares',
  quick_access: 'Acceso rápido',
  cat_book_flight: 'Reservar\nvuelo', cat_flight_status: 'Estado\ndel vuelo',
  cat_my_tickets: 'Mis boletos', cat_baggage: 'Equipaje',
  cat_checkin: 'Check-in\nen línea', cat_support: 'Soporte',
  filter_all: 'Todos', filter_cheapest: 'Más barato',
  filter_earliest: 'Más temprano', filter_fastest: 'Más rápido', filter_business: 'Negocios',
  flights: 'vuelos', direct: 'Directo', economy: 'Económica',
  business_class: 'Clase ejecutiva', per_person: '/persona',
  select_flight: 'Seleccionar este vuelo', edit: 'Editar', passenger: 'Pasajero',
  book_ticket: 'Reservar billete', step_details: 'Detalles', step_passenger: 'Pasajero', step_payment: 'Pago',
  flight_details: 'Detalles del vuelo', choose_seat: 'Elegir asiento',
  price_summary: 'Resumen de precio', base_fare: 'Tarifa base',
  tax_fee: 'Impuestos y tasas', luggage: 'Equipaje facturado', free: 'Gratis', total: 'Total',
  passenger_info: 'Información del pasajero', id_passport: 'DNI / Pasaporte',
  id_placeholder: 'Ingresa número de DNI o pasaporte',
  payment_method: 'Método de pago', credit_card: 'Tarjeta de crédito / débito',
  bank_transfer: 'Transferencia bancaria', e_wallet: 'Billetera electrónica',
  cod: 'Pago al recibir el billete', booking_confirm: 'Confirmación de reserva',
  airline: 'Aerolínea', flight_no: 'Número de vuelo', seat_class: 'Clase de asiento', seat: 'Asiento',
  confirm_book: 'Confirmar reserva', booking_success: '¡Reserva exitosa!',
  booking_code: 'Código de reserva: SB-2025-0425\nPor favor revisa tu correo.',
  push_notif: 'Notificaciones push', edit_info: 'Editar perfil',
  language: 'Idioma', currency: 'Moneda',
  security: 'Seguridad y privacidad', support: 'Soporte y ayuda',
  rate_app: 'Calificar la app', logout: 'Cerrar sesión',
  logout_confirm: '¿Estás seguro de que quieres cerrar sesión?', logout_title: 'Cerrar sesión', cancel_btn: 'Cancelar',
  settings_tab: 'Ajustes', history_tab: 'Historial de reservas',
  trips: 'vuelos', member: 'Miembro',
  confirmed: 'Confirmado', pending_payment: 'Pago pendiente', completed: 'Completado',
  tab_home: 'Inicio', tab_flights: 'Vuelos', tab_bookings: 'Reservas', tab_profile: 'Cuenta',
};

export const translations: Record<Language, TranslationKeys> = { vi, en, ko, ja, zh, th, es };
