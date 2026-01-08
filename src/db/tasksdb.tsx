import * as SQLite from 'expo-sqlite';

let db = null;

/**
 * Like RoomDatabase init
 */
export const initDB = async () => {
  db = await SQLite.openDatabaseAsync('tasks.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL
    );
  `);
};

/**
 * DAO: SELECT
 */
export const getAllTasks = async () => {
  return await db.getAllAsync(
    'SELECT * FROM tasks ORDER BY id DESC;'
  );
};

/**
 * DAO: INSERT
 */
export const insertTask = async (title) => {
  await db.runAsync(
    'INSERT INTO tasks (title, completed) VALUES (?, ?);',
    [title, 0]
  );
};

/**
 * DAO: UPDATE
 */
export const updateTask = async (id, completed) => {
  await db.runAsync(
    'UPDATE tasks SET completed = ? WHERE id = ?;',
    [completed ? 1 : 0, id]
  );
};