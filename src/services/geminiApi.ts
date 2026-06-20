const MODEL = 'gemini-2.5-flash';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export interface GeminiMessage {
  role: 'user' | 'model';
  text: string;
}

export function streamGemini(
  apiKey: string,
  systemPrompt: string,
  messages: GeminiMessage[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
): () => void {
  const url = `${BASE_URL}/${MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
  });

  const xhr = new XMLHttpRequest();
  let offset = 0;
  let buffer = '';

  xhr.onprogress = () => {
    buffer += xhr.responseText.slice(offset);
    offset = xhr.responseText.length;

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (!json) continue;
      try {
        const obj = JSON.parse(json);
        const text = obj?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) onChunk(text);
      } catch {
        // fragmento JSON incompleto, aguardar próximo chunk
      }
    }
  };

  xhr.onload = () => {
    if (xhr.status >= 400) {
      try {
        const err = JSON.parse(xhr.responseText);
        onError(err?.error?.message ?? `Erro ${xhr.status}`);
      } catch {
        onError(`Erro ${xhr.status}`);
      }
    } else {
      onDone();
    }
  };

  xhr.onerror = () => onError('Falha na conexão. Verifique sua internet.');
  xhr.onabort = () => {};

  xhr.open('POST', url);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(body);

  return () => xhr.abort();
}
