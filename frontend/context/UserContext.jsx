import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { useState } from "react";
import { createContext } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(null);

  useEffect(async () => {
    const storedUser = await AsyncStorage.getItem("user");
    const storedToken = await AsyncStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (error) {
        console.error("Error parsing user from localStorage", err);
        setUser(null);
        setToken(null);
        await AsyncStorage.removeItem("user");
       await AsyncStorage.removeItem("token");
      }
    } else {
      setUser(null);
      setToken(null);
    }
    setLoading(false);
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        selectedChat,
        setSelectedChat,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
