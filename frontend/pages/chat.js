import React, { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import {
  Animated,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Easing,
} from "react-native";

export const Chat = () => {
  const [name, setName] = useState("User");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const init = async () => {
      const stored = await AsyncStorage.getItem("name");
      if (stored) setName(stored);

      await fetchMessages();
    };

    init();

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch("YOUR_API_URL/messages");
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.log("Fetch messages error:", err);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      await fetch("YOUR_API_URL/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: message,
          sender: name,
        }),
      });

      setMessage("");
      await fetchMessages();
    } catch (err) {
      console.log("Send message error:", err);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.bubble, item.mine ? styles.mine : styles.other]}>
      <Text style={styles.bubbleText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={90}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.screen}>
          {/* HEADER */}
          <Animated.View
            style={[
              styles.header,
              { opacity: fade, transform: [{ translateY: slide }] },
            ]}
          >
            <View style={styles.profileWrap}>
              <FontAwesome name="user" size={22} color="#111" />
            </View>

            <View>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.status}>Online</Text>
            </View>

            <TouchableOpacity style={styles.callBtn}>
              <FontAwesome name="phone" size={18} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
          <View style={{ flex: 1 }}>
            {/* MESSAGES */}
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id?.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.list}
              keyboardShouldPersistTaps="handled"
            />

            {/* INPUT */}
            <View style={styles.inputBar}>
              <TouchableOpacity>
                <FontAwesome name="smile-o" size={22} color="#888" />
              </TouchableOpacity>

              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Type message..."
                placeholderTextColor="#777"
                style={styles.input}
              />

              <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                <FontAwesome name="send" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0f0f10",
  },

  header: {
    margin: 14,
    padding: 14,
    borderRadius: 20,
    backgroundColor: "#86e72b",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  profileWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  name: {
    color: "#111",
    fontSize: 18,
    fontWeight: "700",
  },

  status: {
    color: "#1d3b00",
    fontSize: 12,
  },

  callBtn: {
    marginLeft: "auto",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },

  list: {
    paddingHorizontal: 14,
    paddingBottom: 10,
  },

  bubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 18,
    marginVertical: 6,
  },

  mine: {
    alignSelf: "flex-end",
    backgroundColor: "#86e72b",
  },

  other: {
    alignSelf: "flex-start",
    backgroundColor: "#222",
  },

  bubbleText: {
    color: "#fff",
  },

  inputBar: {
    margin: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "#1b1b1d",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },

  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#86e72b",
    alignItems: "center",
    justifyContent: "center",
  },
});
