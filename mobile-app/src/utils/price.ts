import { Currency } from '../i18n/currencies';

/**
 * Quy đổi giá từ VND sang tiền tệ đích và định dạng hiển thị.
 * @param amountVND  Số tiền gốc tính bằng VND
 * @param currency   Đối tượng tiền tệ đích từ context
 * @returns          Chuỗi đã định dạng, ví dụ: "$49.21" | "₩54,644" | "1.250.000₫"
 */
export function formatPrice(amountVND: number, currency: Currency): string {
  const converted = amountVND / currency.vndPerUnit;

  // Tiền tệ số lớn (VND, KRW, JPY) → không có thập phân
  const noDecimal = ['VND', 'KRW', 'JPY', 'IDR'];
  const decimals  = noDecimal.includes(currency.code) ? 0 : 2;

  const formatted = converted.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  // Đặt ký hiệu sau số với VND, trước số với các đồng khác
  if (currency.code === 'VND') {
    return `${formatted}₫`;
  }
  return `${currency.symbol}${formatted}`;
}

/**
 * Hook-free helper: tính tiền thuế (10%) và trả về các dòng giá
 */
export function buildPriceRows(baseFareVND: number, currency: Currency) {
  const tax   = Math.round(baseFareVND * 0.1);
  const total = baseFareVND + tax;
  return {
    baseFare: formatPrice(baseFareVND, currency),
    tax:      formatPrice(tax, currency),
    total:    formatPrice(total, currency),
  };
}
