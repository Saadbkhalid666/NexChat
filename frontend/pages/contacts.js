import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { UserContext } from "../context/UserContext";
import api from "../axios";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export const Contact = (props) => {
  const { user, setSelectedUser } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          Alert.alert("Error", "Login Please, Token not found!");
          props.navigation.replace("Login");
          return;
        }
        const res = await api.get("/user/get-users", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUserClick = (selected) => {
    props.navigation.navigate("Chat", {
      selectedUser: selected,
    });
  };

  const renderItem = ({ item, index }) => (
    <Pressable
      style={({ pressed }) => [
        styles.contactCard,
        pressed && styles.contactCardPressed,
      ]}
      onPress={() => handleUserClick(item)}
    >
      <LinearGradient
        colors={index % 2 === 0 ? ['#4facfe', '#00f2fe'] : ['#ff9a9e', '#fecfef']}
        style={styles.avatar}
      >
        <Text style={styles.avatarText}>
          {item.username ? item.username.charAt(0).toUpperCase() : "?"}
        </Text>
      </LinearGradient>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.username}</Text>
        <Text style={styles.contactSub}>Tap to start chatting</Text>
      </View>
      <Ionicons name="chatbubble-ellipses-outline" size={24} color="#ccc" style={styles.chatIcon} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#fdfbfb', '#ebedee']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSubtitle}>Connect with your friends</Text>
        </View>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#4facfe" />
          </View>
        ) : users.length === 0 ? (
          <View style={styles.centerContent}>
            <Ionicons name="people-outline" size={64} color="#ccc" style={{ marginBottom: 15 }} />
            <Text style={styles.emptyText}>No contacts found.</Text>
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: "transparent",
  },
  headerTitle: {
    fontSize: 34,
    fontFamily: "Fugaz",
    color: "#1a1a1a",
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Fugaz",
    marginTop: 4,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    fontFamily: "Fugaz",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  contactCardPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: "rgba(255, 255, 255, 1)",
    shadowOpacity: 0.1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  avatarText: {
    fontSize: 24,
    color: "#fff",
    fontFamily: "Fugaz",
  },
  contactInfo: {
    flex: 1,
    justifyContent: "center",
  },
  contactName: {
    fontSize: 18,
    color: "#2c3e50",
    fontFamily: "Fugaz",
    marginBottom: 4,
  },
  contactSub: {
    fontSize: 13,
    color: "#8e9eab",
    fontFamily: "Fugaz",
  },
  chatIcon: {
    marginLeft: 10,
  },
});
