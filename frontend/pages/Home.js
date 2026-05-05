import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export const Home = (props) => {
  const [authStatus, setAuthStatus] = useState("loading");

    AsyncStorage.removeItem("user")
    AsyncStorage.removeItem("token")

  useFocusEffect(
    useCallback(() => {
      checkAuth();
    }, [])
  );

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setAuthStatus("first_time");
        return;
      }

      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        await AsyncStorage.removeItem("token");
        setAuthStatus("expired");
      } else {
        props.navigation.navigate("Contact");
      }

    } catch (err) {
      console.log("Auth Check Error:", err);
      setAuthStatus("expired");
    }
  };

  return (
    <View style={styles.container}>
      <Image style={styles.image} source={require("../assets/icon.png")} />

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

{authStatus !== "expired" && (
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            { marginTop: 10 }
          ]}
          onPress={() => props.navigation.navigate("Contact")}
        >
          <Text style={styles.buttonText}>Contacts</Text>
        </Pressable>
      )}
      {authStatus === "expired" && (
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            { marginTop: 10 }
          ]}
          onPress={() => props.navigation.navigate("Login")}
        >
          <Text style={styles.buttonText}>Login</Text>
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