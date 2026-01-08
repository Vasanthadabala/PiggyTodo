import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Pomodoro() {
  const [mode, setMode] = useState('pomodoro') // pomodoro | break
  const [breakType, setBreakType] = useState('short') // short | long

  const [settings, setSettings] = useState({
    pomodoroTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    longBreakInterval: 4,
    autoPomodoro: true,
    autoBreaks: false,
    notificationSound: true,
  })

  const [secondsLeft, setSecondsLeft] = useState(settings.pomodoroTime * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [pomodoroCount, setPomodoroCount] = useState(0)

  const intervalRef = useRef(null)

  /* ---------------- FORMAT TIME ---------------- */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  /* ---------------- LOAD SETTINGS ---------------- */
  useFocusEffect(
    useCallback(() => {
      const loadSettings = async () => {
        const data = await AsyncStorage.getItem('pomodoro_settings')
        if (data) setSettings(JSON.parse(data))
      }
      loadSettings()
    }, [])
  )

  /* ---------------- RESET TIME WHEN MODE CHANGES ---------------- */
  useEffect(() => {
    if (isRunning) return

    if (mode === 'pomodoro') {
      setSecondsLeft(settings.pomodoroTime * 60)
    } else {
      setSecondsLeft(
        breakType === 'long'
          ? settings.longBreakTime * 60
          : settings.shortBreakTime * 60
      )
    }
  }, [mode, breakType, settings])

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (!isRunning) return

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          handleSessionEnd()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  /* ---------------- SESSION END ---------------- */
  const handleSessionEnd = () => {
    setIsRunning(false)

    let nextMode = mode

    if (mode === 'pomodoro') {
      nextMode = 'break'

      setPomodoroCount((prev) => {
        const nextCount = prev + 1

        if (nextCount % settings.longBreakInterval === 0) {
          setBreakType('long')
          setSecondsLeft(settings.longBreakTime * 60)
        } else {
          setBreakType('short')
          setSecondsLeft(settings.shortBreakTime * 60)
        }

        return nextCount
      })

      setMode('break')
    } else {
      nextMode = 'pomodoro'
      setMode('pomodoro')
      setSecondsLeft(settings.pomodoroTime * 60)
    }

    // Auto start next session
    if (
      (nextMode === 'break' && settings.autoBreaks) ||
      (nextMode === 'pomodoro' && settings.autoPomodoro)
    ) {
      setTimeout(() => setIsRunning(true), 300)
    }
  }

  /* ---------------- SKIP ---------------- */
  const handleSkip = () => {
    setIsRunning(false)

    if (mode === 'pomodoro') {
      handleSessionEnd() // counts as completed
    } else {
      setMode('pomodoro')
      setSecondsLeft(settings.pomodoroTime * 60)

      if (settings.autoPomodoro) {
        setTimeout(() => setIsRunning(true), 300)
      }
    }
  }

  const isPomodoro = mode === 'pomodoro'
  const timeText = formatTime(secondsLeft)

  /* ---------------- UI ---------------- */
  return (
    <SafeAreaView style={styles.container}>
      {/* MODE SWITCH */}
      <View style={styles.modeContainer}>
        {['pomodoro', 'break'].map((item) => (
          <Pressable
            key={item}
            style={[styles.modeButton, mode === item && styles.activeMode]}
            onPress={() => !isRunning && setMode(item)}
          >
            <Text style={[styles.modeText, mode === item && styles.activeText]}>
              {item === 'pomodoro' ? 'Pomodoro' : 'Break'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* TIMER */}
      <View
        style={[
          styles.timerCard,
          { backgroundColor: isPomodoro ? '#E63946' : '#2A9D8F' },
        ]}
      >
        <Text style={styles.timerText}>{timeText}</Text>
      </View>

      {/* CONTROLS */}
      {isRunning ? (
        <View style={styles.runningButtons}>
          <Pressable
            style={styles.pauseButton}
            onPress={() => setIsRunning(false)}
          >
            <Text style={styles.buttonText}>Pause</Text>
          </Pressable>

          <Pressable style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.buttonText}>Skip</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={styles.startButton}
          onPress={() => setIsRunning(true)}
        >
          <Text style={styles.startButtonText}>Start</Text>
        </Pressable>
      )}

      {/* DEBUG (remove later) */}
      <Text style={styles.debug}>
        Sessions: {pomodoroCount} | Break: {breakType}
      </Text>

      {/* SETTINGS FAB */}
      <Pressable style={styles.fab} onPress={() => router.push('/pomodoro_add')}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </SafeAreaView>
  )
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
  },

  modeContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },

  modeButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },

  activeMode: { backgroundColor: '#000' },

  modeText: { fontSize: 16, color: '#666', fontWeight: '500' },
  activeText: { color: '#FFF' },

  timerCard: {
    height: 220,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  timerText: { fontSize: 56, fontWeight: '700', color: '#fff' },

  startButton: {
    marginTop: 40,
    height: 40,
    borderRadius: 28,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },

  startButtonText: { color: '#FFF', fontSize: 20 },

  runningButtons: {
    flexDirection: 'row',
    marginTop: 40,
  },

  pauseButton: {
    flex: 1,
    height: 40,
    borderRadius: 28,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  skipButton: {
    flex: 1,
    height: 40,
    borderRadius: 28,
    backgroundColor: '#d00000',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },

  buttonText: { color: '#FFF', fontSize: 16 },

  debug: {
    marginTop: 14,
    textAlign: 'center',
    color: '#777',
    fontSize: 13,
  },

  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
})