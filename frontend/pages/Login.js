import { Text, View, TextInput, Alert, StyleSheet, Pressable } from "react-native";
import { useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "../context/UserContext";
import api from "../axios";

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
        console.log("STATUS:", err.response.status);
        console.log("DATA:", err.response.data);

        Alert.alert("Error", err.response.data?.message || "Server error");
      } else if (err.request) {
        console.log("NO RESPONSE:", err.request);

        Alert.alert("Error", "Server not reachable (check IP / backend)");
      } else {
        console.log("ERROR MESSAGE:", err.message);
        
        Alert.alert("Error", err.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Login to Your Account</Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter Your Email"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1, borderWidth: 0, marginVertical: 0 }]}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter Your Password"
          placeholderTextColor="#888"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <Pressable onPress={togglePassword} style={styles.showButton}>
          <Text style={styles.showButtonText}>{showPassword ? "Hide" : "Show"}</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={handleLogin}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </Pressable>

      <Pressable onPress={() => props.navigation.navigate("SignUp")} style={styles.linkContainer}>
        <Text style={styles.linkText}>Don't have an account? Register</Text>
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginVertical: 10,
  },
  showButton: {
    padding: 14,
  },
  showButtonText: {
    fontFamily: "Fugaz",
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
  linkContainer: {
    marginTop: 20,
  },
  linkText: {
    color: "#000",
    fontFamily: "Fugaz",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
