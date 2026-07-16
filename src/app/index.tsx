import "../../global.css";
import { Text, View, TouchableOpacity, ImageBackground } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";

export default function HomeScreen() {

  const fullText = "Master the Game of Kings ";

  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let index = 0;

    const timer = setInterval(() => {

      setDisplayText(fullText.slice(0, index));

      index++;

      if (index > fullText.length) {
        clearInterval(timer);
      }

    }, 50);

    return () => clearInterval(timer);

  }, []);


  return (
    <ImageBackground
      source={require("../../assets/images/knight-image.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <View
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      />
      <View className="flex-1 justify-center items-center">

        <Text className="text-4xl font-extrabold text-white text-center mb-4">
          {displayText}
        </Text>

        <Text className="text-xl text-yellow-300 text-center mb-8 font-bold">
          Think ahead. Make your move.
        </Text>

        <TouchableOpacity
          className="bg-gray-50 px-8 py-4 rounded-lg tra"
          onPress={() => router.push("/board")}
        >
          <Text className="text-xl font-bold text-purple-900">
            Let's Play Chess ♟️
          </Text>
        </TouchableOpacity>

      </View>
      <Text className="text-center text-gray-300 italic text-sm leading-6">
  "Without the element of enjoyment, it is not worth trying to excel at anything."
</Text>

<Text className="text-center text-gray-400 text-xs mt-2 font-semibold">
  — Magnus Carlsen
</Text>

    </ImageBackground>
  );
}