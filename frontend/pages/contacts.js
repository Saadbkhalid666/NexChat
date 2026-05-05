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
        // Filter out the currently logged-in user
        const otherUsers = res.data.filter(
          (u) => u._id !== user?._id && u.id !== user?.id
        );
        setUsers(otherUsers);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUserClick = (selected) => {
    setSelectedUser(selected);
    props.navigation.navigate("Chat", {
      selectedUser: selected,
    });
  };

  const renderItem = ({ item }) => (
    <Pressable
      style={({ pressed }) => [
        styles.contactCard,
        pressed && styles.contactCardPressed,
      ]}
      onPress={() => handleUserClick(item)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.username ? item.username.charAt(0).toUpperCase() : "?"}
        </Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.username}</Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Contacts</Text>
        </View>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#86e72bff" />
          </View>
        ) : users.length === 0 ? (
          <View style={styles.centerContent}>
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
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Fugaz",
    color: "#333",
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
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactCardPressed: {
    opacity: 0.7,
    backgroundColor: "#f0f0f0",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#86e72bff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "Fugaz",
  },
  contactInfo: {
    flex: 1,
    justifyContent: "center",
  },
  contactName: {
    fontSize: 18,
    color: "#333",
    fontWeight: "600",
    fontFamily: "Fugaz",
  },
});
