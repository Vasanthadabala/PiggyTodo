import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
    screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#000",   // 🟡 Yellow
        tabBarInactiveTintColor: "#999",

        tabBarLabelStyle:{
          fontSize: 14,
          fontWeight: '500'
        }
      }}
    >
      <Tabs.Screen 
        name="home" 
        options={{ 
          tabBarLabel: "Home",
          headerShown: false,
          tabBarIcon: ({color, size, focused}) => (
            <Ionicons name= {focused ? "home" : "home-outline"} color={color} size={size} />
          ),
          }} />

      <Tabs.Screen 
        name="pomodoro" 
        options={{ 
          tabBarLabel: "Pomodoro",
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name= {focused ? "timer" : "timer-outline"} color={color} size={size} />
            ),
            }} />
    </Tabs>
  );
}