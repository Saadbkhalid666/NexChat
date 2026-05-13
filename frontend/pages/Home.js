import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {jwtDecode} from "jwt-decode";
import { Image, Pressable, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import api from "../axios";
export const Home = (props) => {
  const [authStatus, setAuthStatus] = useState("loading");

  useFocusEffect(
    useCallback(() => {
      checkAuth();
    }, [])
  );

const checkAuth = async () => {
  try {
    const hasLaunched = await AsyncStorage.getItem("has_launched");

    if (!hasLaunched) {
      await AsyncStorage.setItem("has_launched", "true");
      setAuthStatus("first_time");
      return;
    }

    const token = await AsyncStorage.getItem("token");

    if (!token) {
      setAuthStatus("first_time");
      return;
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (e) {
      await AsyncStorage.removeItem("token");
      setAuthStatus("first_time");
      return;
    }

    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      await AsyncStorage.removeItem("token");
      setAuthStatus("expired");
      return;
    }

    try {
      await api.get("/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuthStatus("authenticated");
      props.navigation.replace("Contact");
    } catch (err) {
      await AsyncStorage.multiRemove(["token", "user"]);
      setAuthStatus("first_time");  
    }

  } catch (err) {
    console.log("Auth Check Error:", err);
    setAuthStatus("first_time");
  }
};

  return (
    <View style={styles.container}>
      <Image style={styles.image} source={require("../assets/icon.png")} />

      {authStatus === "loading" && (
        <ActivityIndicator size="large" color="#86e72bff" />
      )}

      {authStatus === "first_time" && (
        <Pressable 
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => props.navigation.navigate("SignUp")}
        >
          <Text style={styles.buttonText}>Register</Text>
        </Pressable>
      )}

      {authStatus === "expired" && (
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => props.navigation.navigate("Login")}
        >
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>
      )}

      {authStatus === "authenticated" && (
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => props.navigation.replace("Contact")}
        >
          <Text style={styles.buttonText}>Go to Contacts</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },

  image: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },

  button: {
    backgroundColor: "#86e72bff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 20,
  },

  buttonPressed: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});