import { Text, View, TextInput, Alert, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from "react-native";
import { useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "../context/UserContext";
import api from "../axios";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export const Login = (props) => {
  const { setUser, setToken } = useContext(UserContext);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "All Fields are Required!");
    }
    if (!email.includes("@") || !email.endsWith("gmail.com")) {
      return Alert.alert("Error", "Invalid Email");
    }

    setLoading(true);

    try {
      const res = await api.post("/user/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      if (token) {
        setUser(user);
        setToken(token);
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("user", JSON.stringify(user));
   
        setLoading(false);
        props.navigation.replace("Contact");
      }
    } catch (err) {
      setLoading(false);
      console.log("AXIOS ERROR:", err);

      if (err.response) {
        Alert.alert("Error", err.response.data?.message || "Server error");
      } else if (err.request) {
        Alert.alert("Error", "Server not reachable (check IP / backend)");
      } else {
        Alert.alert("Error", err.message);
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={['#4facfe', '#00f2fe']}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Login to continue</Text>
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
            <Pressable onPress={togglePassword} style={styles.showButton}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#888" />
            </Pressable>
          </View>

          <Pressable style={styles.forgotPassword}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </Pressable>

          <Pressable
            onPress={handleLogin}
            disabled={loading}
          >
            {({ pressed }) => (
              <LinearGradient
                colors={pressed ? ['#00c6fb', '#005bea'] : ['#005bea', '#00c6fb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.button, pressed && styles.buttonPressed]}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Logging in..." : "LOGIN"}
                </Text>
              </LinearGradient>
            )}
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable onPress={() => props.navigation.navigate("SignUp")}>
              <Text style={styles.linkText}>Register</Text>
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 30,
  },
  forgotText: {
    color: "#005bea",
    fontFamily: "Fugaz",
    fontSize: 13,
  },
  button: {
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#005bea",
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
    color: "#005bea",
    fontFamily: "Fugaz",
    fontSize: 14,
  },
});
