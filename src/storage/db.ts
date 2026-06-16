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
  `);
}
