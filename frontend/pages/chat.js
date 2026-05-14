import React, { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
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
  Easing,
} from "react-native";
import api from "../axios";
import { initSocket, getSocket } from "../socket";
import { LinearGradient } from "expo-linear-gradient";

export const Chat = (props) => {
  const { id } = props.route.params.selectedUser;
  const [name, setName] = useState("User");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const flatListRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;

  // 1. Initial Load
  useEffect(() => {
    const init = async () => {
      const { selectedUser } = props.route.params;
      setName(selectedUser.username);

      const userData = await AsyncStorage.getItem("user");
      const parsedUser = JSON.parse(userData);
      setCurrentUser(parsedUser);

      const rId = [parsedUser._id, selectedUser._id].sort().join("_");
      setRoomId(rId);

      await fetchMessages(parsedUser, selectedUser);
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

  // 2. Setup Socket
  useEffect(() => {
    if (!roomId) return;

    const setupSocket = async () => {
      const s = await initSocket();

      s.emit("join_room", roomId);

      s.on("receiveMessage", (msg) => {
        setMessages((prev) => {
          if (prev.find((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      });

      s.on("showTyping", () => setIsTyping(true));
      s.on("hideTyping", () => setIsTyping(false));
    };

    setupSocket();

    return () => {
      const s = getSocket();
      if (s) {
        s.off("receiveMessage");
        s.off("showTyping");
        s.off("hideTyping");
      }
    };
  }, [roomId]);

  const fetchMessages = async (me, other) => {
    if (!me || !other) return;

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

      console.log("MESSAGES:", res.data);

      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("Fetch messages error:", err.response?.data || err.message);
    }
  };

  const handleTyping = (text) => {
    setMessage(text);
    const s = getSocket();
    if (s && roomId) {
      if (text.length > 0) {
        s.emit("typing", roomId);
      } else {
        s.emit("stopTyping", roomId);
      }
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !currentUser || !roomId) return;

    try {
      const { selectedUser } = props.route.params;
      const s = getSocket();

      if (s) {
        s.emit("sendMessage", {
          roomId: roomId,
          sender: currentUser._id,
          receiver: selectedUser._id,
          message: message,
        });
        s.emit("stopTyping", roomId);
      }

      setMessage("");
    } catch (err) {
      console.log("Send message error:", err);
    }
  };

  const deleteMessage = async (msgId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await api.delete(`/message/delete/${msgId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
      setSelectedMessageId(null);
    } catch (err) {
      console.log("Delete message error:", err.response?.data || err.message);
    }
  };

  const renderItem = ({ item }) => {
    const isMine = item.sender?.toString() === currentUser?._id?.toString();
    const isSelected = selectedMessageId === item._id;

    return (
      <TouchableOpacity
        onPress={() => setSelectedMessageId(isSelected ? null : item._id)}
        activeOpacity={0.8}
        style={{ marginBottom: 12 }}
      >
        <View
          style={[
            styles.messageRow,
            isMine ? styles.messageRowMine : styles.messageRowOther,
          ]}
        >
          {!isMine && (
            <LinearGradient
              colors={["#ff9a9e", "#fecfef"]}
              style={styles.tinyAvatar}
            >
              <Text style={styles.tinyAvatarText}>
                {name.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          )}
          <View>
            {isMine ? (
              <LinearGradient
                colors={["#4facfe", "#00f2fe"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.bubble, styles.bubbleMine]}
              >
                <Text style={styles.bubbleTextMine}>{item.message}</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.bubble, styles.bubbleOther]}>
                <Text style={styles.bubbleTextOther}>{item.message}</Text>
              </View>
            )}
          </View>
        </View>

        {isSelected && (
          <TouchableOpacity
            onPress={() => deleteMessage(item._id)}
            style={[
              styles.deleteBtn,
              {
                alignSelf: isMine ? "flex-end" : "flex-start",
                marginLeft: isMine ? 0 : 36,
                marginRight: isMine ? 10 : 0,
              },
            ]}
          >
            <Ionicons name="trash-outline" size={14} color="#e74c3c" />
            <Text style={styles.deleteTxt}>Delete for everyone</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 90}
      >
        <LinearGradient
          colors={["#fdfbfb", "#ebedee"]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* HEADER */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fade, transform: [{ translateY: slide }] },
          ]}
        >
          <LinearGradient
            colors={["#ff9a9e", "#fecfef"]}
            style={styles.profileWrap}
          >
            <Text style={styles.profileInitials}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>

          <View style={styles.headerInfo}>
            <Text style={styles.name}>{name}</Text>
            {isTyping ? (
              <Text style={styles.statusTyping}>typing...</Text>
            ) : (
              <Text style={styles.statusOnline}>Online</Text>
            )}
          </View>
        </Animated.View>

        <View style={{ flex: 1 }}>
          {/* MESSAGES */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) =>
              item._id?.toString() || Math.random().toString()
            }
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />

          {/* INPUT */}
          <View style={styles.inputContainerWrapper}>
            <View style={styles.inputBar}>
              <TextInput
                value={message}
                onChangeText={handleTyping}
                placeholder="Type your message..."
                placeholderTextColor="#999"
                style={styles.input}
                multiline
              />

              <TouchableOpacity onPress={sendMessage}>
                <LinearGradient
                  colors={["#4facfe", "#00f2fe"]}
                  style={styles.sendBtn}
                >
                  <Ionicons
                    name="send"
                    size={18}
                    color="#fff"
                    style={{ marginLeft: 3 }}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ebedee",
  },
  header: {
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 5,
    padding: 12,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  profileWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ff9a9e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  profileInitials: {
    fontFamily: "Fugaz",
    color: "#fff",
    fontSize: 20,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    color: "#2c3e50",
    fontSize: 18,
    fontFamily: "Fugaz",
  },
  statusTyping: {
    color: "#4facfe",
    fontSize: 12,
    fontFamily: "Fugaz",
    fontStyle: "italic",
  },
  statusOnline: {
    color: "#2ecc71",
    fontSize: 12,
    fontFamily: "Fugaz",
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(79, 172, 254, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  list: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 20,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 2,
  },
  messageRowMine: {
    justifyContent: "flex-end",
  },
  messageRowOther: {
    justifyContent: "flex-start",
  },
  tinyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  tinyAvatarText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Fugaz",
  },
  bubble: {
    maxWidth: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleMine: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 4,
    shadowColor: "#4facfe",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  bubbleOther: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  bubbleTextMine: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleTextOther: {
    color: "#2c3e50",
    fontSize: 15,
    lineHeight: 22,
  },
  timeTextMine: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.8)",
    alignSelf: "flex-end",
    marginTop: 2,
  },
  timeTextOther: {
    fontSize: 10,
    color: "#999",
    alignSelf: "flex-end",
    marginTop: 2,
  },
  inputContainerWrapper: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 30,
    paddingHorizontal: 5,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  attachBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    color: "#333",
    fontSize: 16,
    paddingHorizontal: 10,
    maxHeight: 100,
    minHeight: 40,
  },
  micBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4facfe",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(231, 76, 60, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 6,
  },
  deleteTxt: {
    color: "#e74c3c",
    fontSize: 13,
    fontFamily: "Fugaz",
  },
});
