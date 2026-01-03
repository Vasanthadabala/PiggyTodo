import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Pomodoro_Add() {
  const [mode, setMode] = useState('pomodoro')

  const [pomodoroTime, setPomodoroTime] = useState(25)
  const [shortBreakTime, setShortBreakTime] = useState(5)
  const [longBreakTime, setLongBreakTime] = useState(15)

  const [longBreakInterval, setLongBreakInterval] = useState(4)

  const [autoPomodoro, setAutoPomodoro] = useState(true)
  const [autoBreaks, setAutoBreaks] = useState(false)
  const [notificationSound, setNotificationSound] = useState(true)

  useEffect(() => {
  const loadSettings = async () => {
    const data = await AsyncStorage.getItem('pomodoro_settings')

    if (data) {
      const settings = JSON.parse(data)

      setPomodoroTime(settings.pomodoroTime ?? 25)
      setShortBreakTime(settings.shortBreakTime ?? 5)
      setLongBreakTime(settings.longBreakTime ?? 15)
      setLongBreakInterval(settings.longBreakInterval ?? 4)
      setAutoPomodoro(settings.autoPomodoro ?? true)
      setAutoBreaks(settings.autoBreaks ?? false)
      setNotificationSound(settings.notificationSound ?? true)
    }
  }

    loadSettings()
  }, [])


  // 💾 Save when leaving screen
  useEffect(() => {
  const saveSettings = async () => {
    await AsyncStorage.setItem(
      'pomodoro_settings',
      JSON.stringify({
        pomodoroTime,
        shortBreakTime,
        longBreakTime,
        longBreakInterval,
        autoPomodoro,
        autoBreaks,
        notificationSound,
      })
    )
  }

  saveSettings()
  }, [
    pomodoroTime,
    shortBreakTime,
    longBreakTime,
    longBreakInterval,
    autoPomodoro,
    autoBreaks,
    notificationSound,
  ])



  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>

      {/* 🔝 Timer Type Selector */}
      <View style={styles.modeContainer}>
        {['pomodoro', 'short', 'long'].map((item) => (
          <Pressable
            key={item}
            style={[
              styles.modeButton, mode === item && styles.activeMode,
            ]}
            onPress={() => setMode(item)}
          >
            <Text
              style={[
                styles.modeText,
                mode === item && styles.activeText,
              ]}
            >
              {item === 'pomodoro'
                ? 'Pomodoro'
                : item === 'short'
                ? 'Short Break'
                : 'Long Break'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ⏱ Duration Selector (based on mode) */}
    <View style={styles.settingsCard}>
        <DurationPicker
          value={
            mode === 'pomodoro'
              ? pomodoroTime
              : mode === 'short'
              ? shortBreakTime
              : longBreakTime
          }
          onChange={
            mode === 'pomodoro'
              ? setPomodoroTime
              : mode === 'short'
              ? setShortBreakTime
              : setLongBreakTime
          }
        />
      </View>

    {/* Long break interval */}
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Long break interval</Text>
            <View style={styles.intervalInline}>
              <Pressable onPress={() => longBreakInterval > 1 && setLongBreakInterval(longBreakInterval - 1)}>
                <Text style={styles.adjust}>−</Text>
              </Pressable>
              <Text style={styles.intervalNumber}>{longBreakInterval}</Text>
              <Pressable onPress={() => setLongBreakInterval(longBreakInterval + 1)}>
                <Text style={styles.adjust}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>


      {/* ⚙️ Settings */}
      <View style={styles.settingsCard}>

        <SettingRow
          label="Auto start Pomodoro"
          value={autoPomodoro}
          onChange={setAutoPomodoro}
        />

        <SettingRow
          label="Auto start Breaks"
          value={autoBreaks}
          onChange={setAutoBreaks}
        />

        <SettingRow
          label="Notification Sound"
          value={notificationSound}
          onChange={setNotificationSound}
          isLast
        />

      </View>

    </SafeAreaView>
  )
}

function DurationPicker({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <View style={styles.durationContainer}>
      <Pressable
        style={styles.timeButton}
        onPress={() => value > 1 && onChange(value - 1)}
      >
        <Text style={styles.timeButtonText}>−</Text>
      </Pressable>

      <Text style={styles.bigTime}>{value} min</Text>

      <Pressable
        style={styles.timeButton}
        onPress={() => onChange(value + 1)}
      >
        <Text style={styles.timeButtonText}>+</Text>
      </Pressable>
    </View>
  )
}


function SettingRow({
  label,
  value,
  onChange,
  isLast = false,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
  isLast?: boolean
}) {
  return (
    <View
      style={[
        styles.settingRow,
        isLast && { borderBottomWidth: 0 },
      ]}
    >
      <Text style={styles.settingText}>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop:24
  },

  modeContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 24,
    padding: 4,
    marginBottom: 24,
  },

  modeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },

  activeMode: {
    backgroundColor: '#000',
  },

  modeText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },

  activeText: {
    color: '#FFF',
  },

  timeControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24
  },

  bigTime: {
    marginHorizontal: 24,
    fontSize: 24,
    fontWeight: '600',
  },

  adjust: {
    fontSize: 22,
    paddingHorizontal: 10
  },

  timeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  timeButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },

  timeValue: {
    marginHorizontal: 12,
    fontSize: 15,
    fontWeight: '500',
  },


  settingsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginBottom: 24
  },

  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },

  settingText: {
    fontSize: 16,
    color: '#000',
  },

  intervalInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  intervalNumber: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
  },

})