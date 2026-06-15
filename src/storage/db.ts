import * as SQLite from 'expo-sqlite';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;

  _db = await SQLite.openDatabaseAsync('izicont.db');

  await _db.execAsync(`
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
  `);

  return _db;
}
