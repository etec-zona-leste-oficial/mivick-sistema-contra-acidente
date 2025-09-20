// Conexão com o SQLite
// app/database/db.ts
import * as SQLite from "expo-sqlite";

export async function getDbConnection() {
  const db = await SQLite.openDatabaseAsync("seguranca.db");
  await db.execAsync("PRAGMA foreign_keys = ON;");
  return db;
}
