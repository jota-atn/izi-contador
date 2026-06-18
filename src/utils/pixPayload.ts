export function sanitizarChavePix(raw: string): string {
  const v = raw.trim().replace(/\s+/g, '');
  if (!v) return '';

  // E-mail
  if (v.includes('@')) return v.toLowerCase();

  // Chave aleatória (UUID)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) {
    return v.toLowerCase();
  }

  const digits = v.replace(/\D/g, '');

  // Telefone com + prefixo: remove formatação, mantém +
  if (v.startsWith('+')) return '+' + digits;

  // 13 dígitos começando com 55 → usuário esqueceu o + (ex: 5511999999999)
  if (digits.length === 13 && digits.startsWith('55')) return '+' + digits;

  // CPF com formatação: XXX.XXX.XXX-XX → só dígitos
  if (/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v)) return digits;

  // CNPJ com formatação: XX.XXX.XXX/XXXX-XX → só dígitos
  if (/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(v)) return digits;

  // Telefone com parênteses: (11) 99999-9999 → +5511999999999
  if (/^\(\d{2}\)/.test(v) && digits.length >= 10) return '+55' + digits;

  return v;
}

function tlv(id: string, value: string): string {
  return `${id}${String(value.length).padStart(2, '0')}${value}`;
}

function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
}

export function gerarPixPayload(key: string, name: string, amount: number): string {
  const safeName = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .substring(0, 25)
    .toUpperCase() || 'NOME';

  const merchantAccount = tlv('00', 'br.gov.bcb.pix') + tlv('01', key);
  const additionalData = tlv('05', '***');

  const payload =
    tlv('00', '01') +
    tlv('26', merchantAccount) +
    tlv('52', '0000') +
    tlv('53', '986') +
    tlv('54', amount.toFixed(2)) +
    tlv('58', 'BR') +
    tlv('59', safeName) +
    tlv('60', 'BRASIL') +
    tlv('62', additionalData) +
    '6304';

  return payload + crc16(payload);
}
