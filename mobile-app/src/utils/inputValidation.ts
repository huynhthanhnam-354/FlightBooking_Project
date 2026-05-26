const GMAIL_RE = /^[A-Z0-9](?:[A-Z0-9._%+-]{0,62}[A-Z0-9])?@gmail\.com$/i;
const PHONE_RE = /^(0[0-9]{9}|\+84[0-9]{9})$/;
const ID_RE = /^[A-Z0-9]{6,20}$/i;
const NAME_RE = /^[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N} .,'-]{1,199}$/u;
const UNSAFE_NAME_RE = /[\u0000-\u001F\u007F<>"`{}\\]|https?:\/\/|www\.|<script|javascript:/i;

export function isValidEmail(value: string): boolean {
  const email = value.trim().toLowerCase();
  return GMAIL_RE.test(email) && !email.includes('..');
}

export function isValidFullName(value: string): boolean {
  const name = value.trim().replace(/\s+/g, ' ');
  return NAME_RE.test(name) && !UNSAFE_NAME_RE.test(name);
}

export function isValidPhone(value: string): boolean {
  return PHONE_RE.test(value.trim().replace(/\s+/g, ''));
}

export function isValidOptionalPhone(value: string): boolean {
  return !value.trim() || isValidPhone(value);
}

export function isStrongPassword(value: string): boolean {
  return /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value) && value.length >= 8 && value.length <= 100;
}

export function isValidOptionalIdCard(value: string): boolean {
  const id = value.trim().replace(/\s+/g, '');
  return !id || ID_RE.test(id);
}

export const validationMessages = {
  email: 'Email không hợp lệ. Vui lòng dùng địa chỉ @gmail.com.',
  fullName: 'Họ tên không hợp lệ.',
  phone: 'Số điện thoại không hợp lệ.',
  password: 'Mật khẩu cần ít nhất 8 ký tự, có chữ hoa, chữ thường và số.',
  idCard: 'CCCD hoặc hộ chiếu không hợp lệ.',
};
