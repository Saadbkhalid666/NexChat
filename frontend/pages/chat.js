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
  ScrollView,
} from "react-native";
import api from "../axios";
import { initSocket, getSocket } from "../socket";

export const Chat = (props) => {
  const { id } = props.route.params.selectedUser;
  const [name, setName] = useState("User");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const flatListRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [selectedMessageId,setSelectedMessageId] = useState(null)

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
      setMessages(res.data);
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
  try{
    const token  = await AsyncStorage.getItem("token")
    await api.delete(`/message/delete/${msgId}`,{
      headers: {Authorization: `Bearer ${token}`}
    })
    setMessages((prev)=>prev.filter((m)=>m._id !== msgId))
    setSelectedMessageId(null)

  }
  catch(err){
    console.log("Delete message error:", err.response?.data || err.message);
  }
}

  const renderItem = ({ item }) => {
  const isMine = item.sender === currentUser?._id;
  const isSelected = selectedMessageId === item._id;

  return (
    <TouchableOpacity
      onPress={() =>
        setSelectedMessageId(isSelected ? null : item._id)
      }
      activeOpacity={0.8}
    >
      <View style={[styles.bubble, isMine ? styles.mine : styles.other]}>
        <Text style={styles.bubbleText}>{item.message}</Text>
      </View>

      {isSelected && (
        <TouchableOpacity
          onPress={() => deleteMessage(item._id)}
          style={[
            styles.deleteBtn,
            { alignSelf: isMine ? "flex-end" : "flex-start" },
          ]}
        >
          <FontAwesome name="trash" size={12} color="#fff" />
          <Text style={styles.deleteTxt}>Delete</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
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
            {isTyping && <Text style={styles.status}>Typing...</Text>}
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
            keyboardDismissMode="on-drag"
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() => {
              flatListRef.current?.scrollToEnd({animated:false})
            }}
          />
          {/* INPUT */}
          <View style={styles.inputBar}>
            <TouchableOpacity>
              <FontAwesome name="smile-o" size={22} color="#888" />
            </TouchableOpacity>

            <TextInput
              value={message}
              onChangeText={handleTyping}
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    // backgroundColor: "#0f0f10",
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
    padding: 10,
    borderRadius: 6,
    marginVertical: 6,
  },

  mine: {
    alignSelf: "flex-end",
    backgroundColor: "lightgray",
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
    borderRadius: 20,
    backgroundColor: "lightgray",
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

  deleteBtn: {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
  backgroundColor: "#e74c3c",
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 8,
  marginTop: 3,
  marginHorizontal: 10,
},
deleteTxt: {
  color: "#fff",
  fontSize: 12,
  fontWeight: "600",
},
});
