import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const onboardingData = [
  {
    title: "Welcome to PiggyTodo",
    subtitle: "Manage your tasks and stay productive every day.",
  },
  {
    title: "Organize Easily",
    subtitle: "Create, track, and complete tasks effortlessly.",
  },
  {
    title: "Stay Focused",
    subtitle: "Boost productivity with simple and clean design.",
  },
];

export default function Index() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  return (
    <SafeAreaView style = {styles.container}>
      <Image style = {styles.image} source = {require('../src/assets/piggytodo.png')}/>
      
      <View style = {styles.bottomContainer}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          snapToInterval={width}
          snapToAlignment="center"
          decelerationRate="fast"
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const pageIndex = Math.round(
              event.nativeEvent.contentOffset.x / width
            );
            setCurrentIndex(pageIndex);
          }}
        >

        {onboardingData.map((item, index) => (
            <View key={index} style={styles.page}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
        ))}
        </ScrollView>

        {/* DOTS */}
        <View style={styles.dotsContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <Pressable 
          style={styles.button} 
          onPress={ async () => {
            await AsyncStorage.setItem("hasSeenOnboarding", "true");
            router.replace("/(tabs)/home")
          }}>
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  image: {
    width: "100%",
    height: "55%",
    resizeMode: 'contain'
  },

  bottomContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,

    // Optional: lift container slightly over image
    marginTop: -60,
  },

   page: {
    width,
    alignItems: "center",
    paddingHorizontal: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop:40,
    marginBottom: 10,
    textAlign:'center'
  },

  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    marginBottom: 30,
    textAlign:'center',
    width:'90%'
  },

  /* DOTS */
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 6,
  },

  activeDot: {
    backgroundColor: "#000",
    width: 10,
    height: 10,
  },

  button: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
  },

  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color:'#fff'
  },
});
