const BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

async function get<T>(path: string, accessToken: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 401) {
    const err: any = new Error('token_expired');
    err.status = 401;
    throw err;
  }
  if (!res.ok) throw new Error(`Gmail API ${res.status}: ${path}`);
  return res.json();
}

interface MessageRef {
  id: string;
}
interface MessageList {
  messages?: MessageRef[];
}

interface MessagePart {
  filename?: string;
  body: { data?: string; attachmentId?: string };
  parts?: MessagePart[];
}

interface Message {
  id: string;
  payload: MessagePart;
}

interface AttachmentData {
  data: string;
}

export async function findLatestFaturaMessage(accessToken: string): Promise<string | null> {
  const query = 'subject:"Extrato da fatura do Cartão Nubank" has:attachment';
  const list = await get<MessageList>(
    `/messages?q=${encodeURIComponent(query)}&maxResults=1`,
    accessToken,
  );
  return list.messages?.[0]?.id ?? null;
}

function findCsvPart(parts: MessagePart[]): MessagePart | null {
  for (const part of parts) {
    if (part.filename?.endsWith('.csv')) return part;
    if (part.parts) {
      const found = findCsvPart(part.parts);
      if (found) return found;
    }
  }
  return null;
}

export async function downloadCsvAttachment(
  accessToken: string,
  messageId: string,
): Promise<string> {
  const msg = await get<Message>(`/messages/${messageId}`, accessToken);

  const allParts = msg.payload.parts ?? [msg.payload];
  const csvPart = findCsvPart(allParts);
  if (!csvPart) throw new Error('Nenhum CSV encontrado na mensagem.');

  let base64url: string;

  if (csvPart.body.data) {
    base64url = csvPart.body.data;
  } else if (csvPart.body.attachmentId) {
    const att = await get<AttachmentData>(
      `/messages/${messageId}/attachments/${csvPart.body.attachmentId}`,
      accessToken,
    );
    base64url = att.data;
  } else {
    throw new Error('Attachment sem dados.');
  }

  return base64urlToUtf8(base64url);
}

function base64urlToUtf8(base64url: string): string {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder('utf-8').decode(bytes);
}
