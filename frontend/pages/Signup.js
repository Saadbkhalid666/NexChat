import { useContext } from "react";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Alert,
  Modal,
} from "react-native";
import api from "../axios";

import { UserContext } from "../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
export const SignUp = (props) => {
  const { setUser, setToken } = useContext(UserContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [sending, setSending] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Invalid email address");
      return;
    }

    setSending(true);

    try {
      const res = await api.post("/user/register", {
        name,
        email,
        password,
      });
console.log("DATA SENT:", { name, email, password });

      if (res.status === 201) {
        setUser(res.data.user);
        setToken(res.data.token);

        await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
        await AsyncStorage.setItem("token", res.data.token);

        setModalVisible(true);

        setName("");
        setEmail("");
        setPassword("");
        
        setTimeout(() => {
          setModalVisible(false);
          props.navigation.navigate("Contact");
        }, 1500);
      }
    } catch (error) {
      console.log("REGISTER ERROR:", error?.response?.data || error.message);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Registration failed",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>Registration Successful</Text>
          </View>
        </View>
      </Modal>

      <Text style={styles.heading}>Register Your Account</Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter Your Name"
        placeholderTextColor="#888"
      />

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter Your Email"
        placeholderTextColor="#888"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Enter Your Password"
        placeholderTextColor="#888"
        secureTextEntry
      />

      <Pressable
        onPress={handleRegister}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        disabled={sending}
      >
        <Text style={styles.buttonText}>
          {sending ? "Registering..." : "Register"}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },

  heading: {
    fontSize: 28,
    fontFamily: "Fugaz",
    color: "#000",
    marginBottom: 30,
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 14,
    marginVertical: 10,
    fontFamily: "Fugaz",
    fontSize: 14,
    color: "#000",
  },

  button: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },

  buttonPressed: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Fugaz",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "80%",
    backgroundColor: "green",
    padding: 25,
    borderRadius: 10,
    alignItems: "center",
  },

  modalText: {
    fontSize: 15,
    fontFamily: "Fugaz",
    color: "white",
  },

  closeText: {
    color: "#fff",
    fontFamily: "Fugaz",
  },
});
