import "../../global.css";
import { Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-purple-600">
      <Text className="text-2xl font-bold text-white text-center mb-4">
        Welcome to Chess App
      </Text>
      <Text className="text-lg text-yellow-300 text-center mb-8">
        by Ryan & Mohamed
      </Text>
      
      <TouchableOpacity
        className="bg-yellow-400 px-8 py-4 rounded-lg"
        onPress={() => router.push("/board")}
      >
        <Text className="text-xl font-bold text-purple-900">
          Play Chess ♟️
        </Text>
      </TouchableOpacity>
    </View>
  );
}