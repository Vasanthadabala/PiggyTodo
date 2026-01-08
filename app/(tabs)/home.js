import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  addDays,
  deleteTask,
  getTasksFromDate,
  initDB,
  insertNextRepeatedTask,
  insertTask,
  todayISO,
  updateTask
} from "../../src/db/tasksdb";


export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [showTasks, setShowTasks] = useState(true);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [showAddTaskSheet, setShowAddTaskSheet] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [repeat, setRepeat] = useState("none");
  const [taskToDelete, setTaskToDelete] = useState(null);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    const init = async () => {
      await initDB();
      loadTasks();
    };
    init();
  }, []);

  const loadTasks = async () => {
    const data = await getTasksFromDate(todayISO());

    setTasks(
      data.map(t => ({
        id: t.id,
        title: t.title,
        completed: t.completed === 1,
        repeat: t.repeat,
        dueDate: t.dueDate,
        justCompleted: false,
      }))
    );
  };

  /* ---------------- ACTIONS ---------------- */

  const toggleTask = (task) => {
    // 1️⃣ Visual check only
    setTasks(prev =>
      prev.map(t =>
        t.id === task.id ? { ...t, justCompleted: true } : t
      )
    );

    // 2️⃣ After delay → remove task
    setTimeout(async () => {
      // mark completed
      await updateTask(task.id, true);

      // reload WITHOUT new task yet
      loadTasks();

      // 3️⃣ AFTER removal → insert next repeated task
      if (task.repeat !== "none") {
        setTimeout(async () => {
          let nextDate = null;

          if (task.repeat === "daily" || task.repeat === "1day") {
            nextDate = addDays(task.dueDate, 1);
          } else if (task.repeat === "1week") {
            nextDate = addDays(task.dueDate, 7);
          }

          if (nextDate) {
            await insertNextRepeatedTask(task.title, task.repeat, nextDate);
            loadTasks(); // now new task pops in
          }
        }, 300); // small gap before new task appears
      }
    }, 600);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;

    await deleteTask(taskToDelete.id);
    setTaskToDelete(null);
    loadTasks();
  };



  const addTask = async () => {
    if (!newTaskTitle.trim()) return;

    await insertTask(newTaskTitle, repeat);

    setNewTaskTitle("");
    setRepeat("none");
    setShowAddTaskSheet(false);

    loadTasks();
  };

  /* ---------------- FILTERS ---------------- */

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const getDateLabel = (dueDate) => {
    const today = todayISO();
    const tomorrow = addDays(today, 1);

    if (dueDate === today) return "Today";
    if (dueDate === tomorrow) return "Tomorrow";

    const d = new Date(dueDate);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  /* ---------------- UI ---------------- */
  return (
    <SafeAreaView style={styles.container}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <View style={styles.left}>
          <Image
            style={styles.logo}
            source={require("../../src/assets/piggytodo.png")}
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

      <ScrollView>
        {/* TASKS */}
        <Section
          title="Tasks"
          open={showTasks}
          onToggle={() => setShowTasks(v => !v)}
        >
          {pendingTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              dateLabel={getDateLabel(task.dueDate)}
              onToggle={toggleTask}
              onDelete={setTaskToDelete}
            />
          ))}
        </Section>

        {/* COMPLETED */}
        <Section
          title="Completed"
          open={showCompletedTasks}
          onToggle={() => setShowCompletedTasks(v => !v)}
        >
          {completedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              dateLabel={getDateLabel(task.dueDate)}
              onToggle={toggleTask}
              onDelete={setTaskToDelete}
            />
          ))}
        </Section>
      </ScrollView>

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => setShowAddTaskSheet(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      {/* ADD TASK */}
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

          <Text style={styles.repeatLabel}>Repeat</Text>
          <View style={styles.repeatRow}>
            <RepeatOption label="Everyday" value="daily" selected={repeat} onSelect={setRepeat} />
            <RepeatOption label="In 1 Day" value="1day" selected={repeat} onSelect={setRepeat} />
            <RepeatOption label="In 1 Week" value="1week" selected={repeat} onSelect={setRepeat} />
          </View>

          <Pressable style={styles.addBtn} onPress={addTask}>
            <Text style={styles.addText}>Add</Text>
          </Pressable>
        </View>
      </Modal>

      <Modal
        visible={!!taskToDelete}
        transparent
        animationType="fade"
      >
        <View style={styles.overlay}>
          <View style={styles.deleteBox}>
            <Text style={styles.deleteTitle}>
              Delete this task?
            </Text>

            <View style={{ flexDirection: "row", marginTop: 16 }}>
              <Pressable
                style={[styles.deleteBtn, { backgroundColor: "#eee" }]}
                onPress={() => setTaskToDelete(null)}
              >
                <Text>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.deleteBtn, { backgroundColor: "#e63946" }]}
                onPress={confirmDelete}
              >
                <Text style={{ color: "#fff" }}>Delete</Text>
              </Pressable>
            </View>
          </View>
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

const TaskCard = ({ task, dateLabel, onToggle, onDelete }) => {
  const scale = new Animated.Value(1);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    onToggle(task);
  };

  return (
    <Pressable
      onLongPress={() => onDelete(task)}
      delayLongPress={300}
      style={styles.card}
    >

      {/* ANIMATED CHECKBOX */}
      <Pressable onPress={handlePress}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons
            name={
              task.justCompleted || task.completed
                ? "checkbox"
                : "square-outline"
            }
            size={22}
            color={
              task.justCompleted || task.completed ? "#2a9d8f" : "#555"
            }
            style={{ marginRight: 12 }}
          />
        </Animated.View>
      </Pressable>

      {/* TASK CONTENT */}
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.cardText,
            (task.justCompleted || task.completed) && styles.done,
          ]}
        >
          {task.title}
        </Text>
        <Text style={styles.dateLabel}>{dateLabel}</Text>
      </View>
    </Pressable>
  );
};

const RepeatOption = ({ label, value, selected, onSelect }) => (
  <Pressable
    onPress={() => onSelect(value)}
    style={[
      styles.repeatOption,
      selected === value && styles.repeatActive,
    ]}
  >
    <Text
      style={[
        styles.repeatText,
        selected === value && styles.repeatTextActive,
      ]}
    >
      {label}
    </Text>
  </Pressable>
);

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    alignItems: "center",
  },

  left: { flexDirection: "row", alignItems: "center" },

  greeting: { fontSize: 14, color: "#666" },
  username: { fontSize: 16, fontWeight: "600" },

  logo: { width: 44, height: 44, borderRadius: 22, marginRight: 10 },

  iconBox: {
    width: 40,
    height: 40,
    backgroundColor: "#eee",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionBtn: {
    flexDirection: "row",
    alignSelf: "flex-start",
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 12,
  },

  sectionText: { color: "#fff", marginRight: 6 },

  card: {
    flexDirection: "row",
    backgroundColor: "#f1f3f5",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
  },

  cardText: { fontSize: 15 },
  dateLabel: { fontSize: 12, color: "#999", marginTop: 2 },
  done: { textDecorationLine: "line-through", color: "#999" },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },

  sheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  sheetTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },

  repeatLabel: { fontSize: 14, fontWeight: "500", marginBottom: 8 },

  repeatRow: { flexDirection: "row", marginBottom: 16 },

  repeatOption: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },

  repeatActive: { backgroundColor: "#000", borderColor: "#000" },
  repeatText: { fontSize: 13, color: "#555" },
  repeatTextActive: { color: "#fff" },

  addBtn: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  addText: { color: "#fff", fontSize: 16 },

  deleteBox: {
  backgroundColor: "#fff",
  padding: 20,
  borderRadius: 12,
  width: "80%",
  alignSelf: "center",
  marginTop: "50%",
},

deleteTitle: {
  fontSize: 16,
  fontWeight: "600",
  textAlign: "center",
},

deleteBtn: {
  flex: 1,
  padding: 12,
  borderRadius: 8,
  alignItems: "center",
  marginHorizontal: 6,
},

});