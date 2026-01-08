import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getAllTasks,
  initDB,
  insertTask,
  updateTask
} from "../../src/db/tasksdb";

export default function Home() {
  const [showTasks, setShowTasks] = useState(true);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [showAddTaskSheet, setShowAddTaskSheet] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const [tasks, setTasks] = useState([]);

  /* ---------------- DB INIT ---------------- */
  useEffect(() => {
  const init = async () => {
    await initDB();
    loadTasks();
  };
  init();
}, []);


  const loadTasks = async () => {
    const data = await getAllTasks();
    setTasks(
      data.map(t => ({
        id: t.id,
        title: t.title,
        completed: t.completed === 1,
      }))
    );
  };

  /* ---------------- ACTIONS ---------------- */
  const toggleTask = async (task) => {
    await updateTask(task.id, !task.completed);
    loadTasks();
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    await insertTask(newTaskTitle);
    setNewTaskTitle('');
    setShowAddTaskSheet(false);
    loadTasks();
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  /* ---------------- UI ---------------- */
  return (
    <SafeAreaView style={styles.container}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <View style={styles.left}>
          <Image
            style={styles.logo}
            source={require('../../src/assets/piggytodo.png')}
          />
          <View>
            <Text style={styles.greeting}>Good Morning</Text>
            <Text style={styles.username}>Guest</Text>
          </View>
        </View>

        <View style={styles.iconBox}>
          <Ionicons name="notifications-outline" size={22} />
        </View>
      </View>

      {/* TASKS */}
      <Section
        title="Tasks"
        open={showTasks}
        onToggle={() => setShowTasks(v => !v)}
      >
        {pendingTasks.map(task => (
          <TaskCard key={task.id} task={task} onToggle={toggleTask} />
        ))}
      </Section>

      {/* COMPLETED */}
      <Section
        title="Completed"
        open={showCompletedTasks}
        onToggle={() => setShowCompletedTasks(v => !v)}
      >
        {completedTasks.map(task => (
          <TaskCard key={task.id} task={task} onToggle={toggleTask} />
        ))}
      </Section>

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => setShowAddTaskSheet(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      {/* ADD TASK SHEET */}
      <Modal visible={showAddTaskSheet} transparent animationType="slide">
        <Pressable
          style={styles.overlay}
          onPress={() => setShowAddTaskSheet(false)}
        />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Add Task</Text>
          <TextInput
            placeholder="Task title"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            style={styles.input}
          />
          <Pressable style={styles.addBtn} onPress={addTask}>
            <Text style={styles.addText}>Add</Text>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------------- COMPONENTS ---------------- */

const Section = ({ title, open, onToggle, children }) => (
  <View style={{ marginTop: 10 }}>
    <Pressable style={styles.sectionBtn} onPress={onToggle}>
      <Text style={styles.sectionText}>{title}</Text>
      <Ionicons
        name={open ? "chevron-up" : "chevron-down"}
        size={18}
        color="#fff"
      />
    </Pressable>
    {open && <View style={{ padding: 12 }}>{children}</View>}
  </View>
);

const TaskCard = ({ task, onToggle }) => (
  <Pressable style={styles.card} onPress={() => onToggle(task)}>
    <Ionicons
      name={task.completed ? 'checkbox' : 'square-outline'}
      size={22}
      color={task.completed ? '#2a9d8f' : '#555'}
      style={{ marginRight: 12 }}
    />
    <Text style={[styles.cardText, task.completed && styles.done]}>
      {task.title}
    </Text>
  </Pressable>
);

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    alignItems: 'center',
  },

  left: { flexDirection: 'row', alignItems: 'center' },
  greeting: { fontSize: 14, color: '#666' },
  username: { fontSize: 16, fontWeight: '600' },

  logo: { width: 44, height: 44, marginRight: 10 },

  iconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#eee',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionBtn: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 12,
  },

  sectionText: { color: '#fff', marginRight: 6 },

  card: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f5',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },

  cardText: { fontSize: 15, flex: 1 },
  done: { textDecorationLine: 'line-through', color: '#999' },

  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },

  sheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  sheetTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },

  addBtn: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  addText: { color: '#fff', fontSize: 16 },
});