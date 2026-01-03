import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  return (
    <SafeAreaView style = {styles.container}>
      <View style = {styles.topBarContainer}>
        <View style = {styles.leftContainer}>
          <Image style = {styles.logo} source = {require('../../src/assets/piggytodo.png')}/>
          
          <View style = {styles.textContainer}>
            <Text style={styles.greeting}> Good Morning </Text>
            <Text style={styles.username}> Guest </Text>
          </View>
        </View>

        <View style = {styles.rightContainer}>
          <Ionicons name= {"notifications-outline"} color={"#000"} size={24} />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#fff'
  },

  topBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rightContainer:{
    width:44,
    height: 44,
    borderRadius: 24,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center'
  },

  textContainer: {
    marginLeft: 10,
  },

  greeting: {
    fontSize: 14,
    color: '#666',
  },

  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },

  logo: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
    borderRadius:24,
    overflow: 'hidden'
  },
});