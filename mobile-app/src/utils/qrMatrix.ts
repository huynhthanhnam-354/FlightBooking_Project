declare const require: any;

const QRCode = require('qrcode-terminal/vendor/QRCode');
const QRErrorCorrectLevel = require('qrcode-terminal/vendor/QRCode/QRErrorCorrectLevel');

export function createQrMatrix(value: string): boolean[][] {
  const qr = new QRCode(-1, QRErrorCorrectLevel.M);
  qr.addData(value || 'ticket');
  qr.make();
  return qr.modules.map((row: boolean[]) => row.map(Boolean));
}
