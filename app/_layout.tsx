import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      const value = await AsyncStorage.getItem("hasSeenOnboarding");
      setHasSeenOnboarding(value === "true");
      setIsReady(true);
    };

    checkOnboarding();
  }, []);

  // ⛔ Prevent flicker
  if (!isReady) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>

      { hasSeenOnboarding ? (
        <Stack.Screen name = "(tabs)" options={{headerShown:false}}/>
      ) : (
          <Stack.Screen name = "index" options={{headerShown:false}}/>
          )
      }

      <Stack.Screen name = "pomodoro_add" options={{headerShown:true, title: '', headerBackTitle: 'Back'}}/>
    </Stack>
  );
}