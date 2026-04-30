import { Text, View, Button, TextInput, Alert } from "react-native";
import { useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "../context/UserContext";
import api from "../axios";

export const Login = (props) => {
  const { setUser } = useContext(UserContext);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    if (!email || !password)
      return Alert.alert("error", "All Fields are Required!");
    if (!email.includes("@") || !email.endsWith("gmail.com"))
      return Alert.alert("error", "Invalid Email");

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
        props.navigation.navigate("Contact");
      }
    } catch (err) {
      console.log("AXIOS ERROR:", err);

      if (err.response) {
        console.log("STATUS:", err.response.status);
        console.log("DATA:", error.response.data);

        Alert.alert("Error", error.response.data?.message || "Server error");
      } else if (error.request) {
        console.log("NO RESPONSE:", error.request);

        Alert.alert("Error", "Server not reachable (check IP / backend)");
      } else {
        console.log("ERROR MESSAGE:", error.message);
        
        Alert.alert("Error", error.message);
      }
    }
  };
};
