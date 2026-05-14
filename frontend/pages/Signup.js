import { useContext, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import api from "../axios";
import { UserContext } from "../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export const SignUp = (props) => {
  const { setUser, setToken } = useContext(UserContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        await AsyncStorage.setItem("name", name);

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
      console.log("AXIOS ERROR:", error);

      if (error.response) {
        console.log("STATUS:", error.response.status);
        console.log("DATA:", error.response.data);

        Alert.alert(
          "Error",
          error.response.data?.message || "Server error"
        );
      } else if (error.request) {
        console.log("NO RESPONSE:", error.request);

        Alert.alert(
          "Error",
          "Server not reachable (check IP / backend)"
        );
      } else {
        console.log("ERROR MESSAGE:", error.message);

        Alert.alert("Error", error.message);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={['#ff9a9e', '#fecfef']}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Modal */}
        <Modal visible={modalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Ionicons name="checkmark-circle" size={60} color="#4cd137" style={{ marginBottom: 10 }} />
              <Text style={styles.modalText}>Registration Successful!</Text>
            </View>
          </View>
        </Modal>

        <View style={styles.card}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Full Name"
              placeholderTextColor="#888"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email Address"
              placeholderTextColor="#888"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.passwordContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#888"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.showButton}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#888" />
            </Pressable>
          </View>

          <Pressable
            onPress={handleRegister}
            disabled={sending}
            style={{ marginTop: 20 }}
          >
            {({ pressed }) => (
              <LinearGradient
                colors={pressed ? ['#ff758c', '#ff7eb3'] : ['#ff7eb3', '#ff758c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.button, pressed && styles.buttonPressed]}
              >
                <Text style={styles.buttonText}>
                  {sending ? "Registering..." : "SIGN UP"}
                </Text>
              </LinearGradient>
            )}
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => props.navigation.navigate("Login")}>
              <Text style={styles.linkText}>Login</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: "Fugaz",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Fugaz",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f6fa",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: "#e1e5ee",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: "Fugaz",
    fontSize: 15,
    color: "#333",
    height: "100%",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f6fa",
    borderRadius: 12,
    marginBottom: 10,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: "#e1e5ee",
  },
  passwordInput: {
    flex: 1,
    fontFamily: "Fugaz",
    fontSize: 15,
    color: "#333",
    height: "100%",
  },
  showButton: {
    padding: 5,
  },
  button: {
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ff758c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Fugaz",
    letterSpacing: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  footerText: {
    color: "#666",
    fontFamily: "Fugaz",
    fontSize: 14,
  },
  linkText: {
    color: "#ff758c",
    fontFamily: "Fugaz",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalText: {
    fontSize: 18,
    fontFamily: "Fugaz",
    color: "#333",
    textAlign: "center",
  },
});
