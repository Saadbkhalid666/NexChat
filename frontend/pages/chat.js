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
  TouchableWithoutFeedback,
  Keyboard,
  Easing,
} from "react-native";
import api from "../axios";

export const Chat = (props) => {
  const selectedUser = props.route?.params?.selectedUser;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;

  // ✅ INIT
  useEffect(() => {
    const init = async () => {
      const userData = await AsyncStorage.getItem("user");
      const parsedUser = JSON.parse(userData);

      setCurrentUser(parsedUser);

      await fetchMessages(parsedUser, selectedUser);
    };

    init();

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ✅ FETCH MESSAGES
  const fetchMessages = async (me, other) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await api.get("/message/get", {
        params: {
          sender: me._id,
          receiver: other._id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessages(res.data);
    } catch (err) {
      console.log("Fetch error:", err.response?.data || err);
    }
  };

  // ✅ SEND MESSAGE
  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      const token = await AsyncStorage.getItem("token");

      await api.post(
        "/message/send",
        {
          sender: currentUser._id,
          receiver: selectedUser._id,
          message: message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("");
      fetchMessages(currentUser, selectedUser);
    } catch (err) {
      console.log("Send error:", err.response?.data || err);
    }
  };

  // ✅ MESSAGE RENDER
  const renderItem = ({ item }) => {
    const isMine = item.sender === currentUser?._id;

    return (
      <View style={[styles.bubble, isMine ? styles.mine : styles.other]}>
        <Text style={styles.bubbleText}>{item.message}</Text>
      </View>
    );
  };

  if (!selectedUser) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No user selected</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.screen}>
          {/* HEADER */}
          <Animated.View
            style={[
              styles.header,
              { opacity: fade, transform: [{ translateY: slide }] },
            ]}
          >
            <Text style={styles.name}>{selectedUser.username}</Text>
          </Animated.View>

          {/* MESSAGES */}
          <FlatList
            data={messages}
            keyExtractor={(item) => item._id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />

          {/* INPUT */}
          <View style={styles.inputBar}>
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
    color: "white",
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
