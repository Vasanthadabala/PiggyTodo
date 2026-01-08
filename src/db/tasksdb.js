import * as SQLite from 'expo-sqlite';

let db = null;

/* ---------------- DATE HELPERS ---------------- */
export const todayISO = () =>
  new Date().toISOString().split('T')[0];

export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

/* ---------------- DB INIT ---------------- */
export const initDB = async () => {
  db = await SQLite.openDatabaseAsync('tasks.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL,
      repeat TEXT,
      dueDate TEXT
    );
  `);
};

/* ---------------- QUERIES ---------------- */

// Get all tasks from today onwards
export const getTasksFromDate = async (date) => {
  return await db.getAllAsync(
    'SELECT * FROM tasks WHERE dueDate >= ? ORDER BY dueDate, id DESC;',
    [date]
  );
};

export const insertTask = async (title, repeat) => {
  await db.runAsync(
    'INSERT INTO tasks (title, completed, repeat, dueDate) VALUES (?, ?, ?, ?);',
    [title, 0, repeat, todayISO()]
  );
};

export const insertNextRepeatedTask = async (title, repeat, dueDate) => {
  await db.runAsync(
    'INSERT INTO tasks (title, completed, repeat, dueDate) VALUES (?, ?, ?, ?);',
    [title, 0, repeat, dueDate]
  );
};

export const updateTask = async (id, completed) => {
  await db.runAsync(
    'UPDATE tasks SET completed = ? WHERE id = ?;',
    [completed ? 1 : 0, id]
  );
};

export const deleteTask = async (id) => {
  await db.runAsync(
    'DELETE FROM tasks WHERE id = ?;',
    [id]
  );
};