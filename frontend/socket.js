import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";

let socket = null;

export const initSocket = async () => {
  const user = await AsyncStorage.getItem("user");
  const parsedUser = user ? JSON.parse(user) : null;

  socket = io("http://192.168.1.8:3000", {
    transports: ["websocket"],
    withCredentials: true,
    query: {
      userId: parsedUser?._id || "guest",
    },
  });

  return socket;
};

export const getSocket = () => socket;