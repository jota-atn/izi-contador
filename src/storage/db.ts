import { SQLiteDatabase } from 'expo-sqlite';

export async function migrateDbAsync(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS faturas_v2 (
      user_id TEXT NOT NULL,
      mes     TEXT NOT NULL,
      data    TEXT NOT NULL,
      PRIMARY KEY (user_id, mes)
    );
    CREATE TABLE IF NOT EXISTS estado_v2 (
      user_id TEXT    NOT NULL,
      mes     TEXT    NOT NULL,
      dono    TEXT    NOT NULL,
      oculto  INTEGER NOT NULL DEFAULT 0,
      pago    INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, mes, dono)
    );
    CREATE TABLE IF NOT EXISTS edicoes_v1 (
      user_id      TEXT NOT NULL,
      mes          TEXT NOT NULL,
      item_desc    TEXT NOT NULL,
      item_data    TEXT NOT NULL,
      item_valor   REAL NOT NULL,
      novo_dono    TEXT,
      nova_desc    TEXT,
      deletado     INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, mes, item_desc, item_data, item_valor)
    );
    CREATE TABLE IF NOT EXISTS chat_v1 (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    TEXT    NOT NULL,
      mes        TEXT    NOT NULL,
      role       TEXT    NOT NULL,
      content    TEXT    NOT NULL,
      is_hidden  INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_chat_v1_user_mes ON chat_v1 (user_id, mes);
    CREATE TABLE IF NOT EXISTS avisos_dispensados_v1 (
      user_id TEXT NOT NULL,
      mes     TEXT NOT NULL,
      titulo  TEXT NOT NULL,
      valor   REAL NOT NULL,
      soma    REAL NOT NULL,
      PRIMARY KEY (user_id, mes, titulo, valor, soma)
    );
    CREATE TABLE IF NOT EXISTS edicoes_orfas_v1 (
      user_id      TEXT NOT NULL,
      mes          TEXT NOT NULL,
      item_desc    TEXT NOT NULL,
      item_data    TEXT NOT NULL,
      item_valor   REAL NOT NULL,
      novo_dono    TEXT,
      nova_desc    TEXT,
      deletado     INTEGER NOT NULL DEFAULT 0,
      detectado_em TEXT NOT NULL,
      PRIMARY KEY (user_id, mes, item_desc, item_data, item_valor)
    );
    CREATE TABLE IF NOT EXISTS divisoes_v1 (
      user_id    TEXT NOT NULL,
      mes        TEXT NOT NULL,
      item_desc  TEXT NOT NULL,
      item_data  TEXT NOT NULL,
      item_valor REAL NOT NULL,
      pessoa     TEXT NOT NULL,
      valor      REAL NOT NULL,
      PRIMARY KEY (user_id, mes, item_desc, item_data, item_valor, pessoa)
    );
    CREATE TABLE IF NOT EXISTS divisoes_orfas_v1 (
      user_id      TEXT NOT NULL,
      mes          TEXT NOT NULL,
      item_desc    TEXT NOT NULL,
      item_data    TEXT NOT NULL,
      item_valor   REAL NOT NULL,
      pessoa       TEXT NOT NULL,
      valor        REAL NOT NULL,
      detectado_em TEXT NOT NULL,
      PRIMARY KEY (user_id, mes, item_desc, item_data, item_valor, pessoa)
    );
  `);
}
