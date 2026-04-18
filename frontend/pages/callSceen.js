import React, { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StyleSheet, Text, View, Animated, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export const CallScreen = (props) => {
  const [name, setName] = useState("User");

  const pulse = useRef(new Animated.Value(1)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const load = async () => {
      const stored = await AsyncStorage.getItem("name");
      if (stored) setName(stored);
    };

    load();

    // Fade in animation
    Animated.timing(fade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Pulse animation (ring effect)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const firstLetter = name?.charAt(0)?.toUpperCase();

  return (
    <View style={styles.container}>
      
      {/* Call Status */}
      <Animated.Text style={[styles.status, { opacity: fade }]}>
        Calling...
      </Animated.Text>

      {/* Profile Circle */}
      <Animated.View
        style={[
          styles.profile,
          {
            transform: [{ scale: pulse }],
          },
        ]}
      >
        <Text style={styles.text}>{firstLetter}</Text>
      </Animated.View>

      {/* Name */}
      <Text style={styles.name}>{name}</Text>

      {/* Call Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: "red" }]} onPress={()=> props.navigation.navigate("Chat")}>
          <FontAwesome name="phone" size={22} color="#fff" />
        </TouchableOpacity>
 
      </View>

    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },

  status: {
    color: "#aaa",
    fontSize: 18,
    marginBottom: 30,
    letterSpacing: 1,
  },

  profile: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#86e72b",
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    fontSize: 50,
    color: "#fff",
    fontWeight: "bold",
  },

  name: {
    color: "#fff",
    fontSize: 22,
    marginTop: 20,
    fontWeight: "600",
  },

  actions: {
    flexDirection: "row",
    marginTop: 60,
    gap: 30,
  },

  btn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});