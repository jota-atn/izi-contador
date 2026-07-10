import { SQLiteDatabase } from 'expo-sqlite';

export interface ChatRow {
  id: number;
  role: 'user' | 'bot';
  content: string;
  is_hidden: number;
}

export async function loadChatHistory(
  db: SQLiteDatabase,
  userEmail: string,
  mes: string,
): Promise<ChatRow[]> {
  return db.getAllAsync<ChatRow>(
    "SELECT id, role, content, is_hidden FROM chat_v1 WHERE user_id = ? AND mes = ? AND role != 'chips' ORDER BY created_at ASC, id ASC",
    [userEmail, mes],
  );
}

export async function loadChips(
  db: SQLiteDatabase,
  userEmail: string,
  mes: string,
): Promise<string[]> {
  const row = await db.getFirstAsync<{ content: string }>(
    "SELECT content FROM chat_v1 WHERE user_id = ? AND mes = ? AND role = 'chips'",
    [userEmail, mes],
  );
  if (!row) return [];
  try {
    const parsed = JSON.parse(row.content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveChips(
  db: SQLiteDatabase,
  userEmail: string,
  mes: string,
  chips: string[],
): Promise<void> {
  await db.runAsync("DELETE FROM chat_v1 WHERE user_id = ? AND mes = ? AND role = 'chips'", [
    userEmail,
    mes,
  ]);
  if (chips.length > 0) {
    await db.runAsync(
      "INSERT INTO chat_v1 (user_id, mes, role, content, is_hidden, created_at) VALUES (?, ?, 'chips', ?, 0, ?)",
      [userEmail, mes, JSON.stringify(chips), Date.now()],
    );
  }
}

export async function clearChatHistory(
  db: SQLiteDatabase,
  userEmail: string,
  mes: string,
): Promise<void> {
  await db.runAsync('DELETE FROM chat_v1 WHERE user_id = ? AND mes = ?', [userEmail, mes]);
}

export async function saveChatMessages(
  db: SQLiteDatabase,
  userEmail: string,
  mes: string,
  messages: Array<{ role: 'user' | 'bot'; content: string; isHidden?: boolean }>,
): Promise<void> {
  const now = Date.now();
  await db.withTransactionAsync(async () => {
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      await db.runAsync(
        'INSERT INTO chat_v1 (user_id, mes, role, content, is_hidden, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [userEmail, mes, m.role, m.content, m.isHidden ? 1 : 0, now + i],
      );
    }
  });
}
