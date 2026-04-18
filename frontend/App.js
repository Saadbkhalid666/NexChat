import { Text } from "react-native";
import { Home } from "./pages/Home";
import { Register } from "./pages/Register";
import { Contact } from "./pages/contacts";

import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";

import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Chat } from "./pages/chat";

SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

export default function App() {
  const [username, setUsername] = useState("");

  const [loaded] = useFonts({
    Fugaz: require("./assets/fonts/FugazOne-Regular.ttf"),
  });

  useEffect(() => {
    const loadData = async () => {
      const savedName = await AsyncStorage.getItem("name");

      if (savedName) {
        setUsername(savedName);
      }

      if (loaded) {
        SplashScreen.hideAsync();
      }
    };

    loadData();
  }, [loaded]);
  const firstLetter = username[0];
  if (!loaded) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Register"
          component={Register}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Contact"
          component={Contact}
          options={{
            headerTitle: "Contacts",
            headerTitleStyle: { fontFamily: "Fugaz" },

            headerRight: () => (
              <Text
                style={{
                  marginRight: 12,
                  fontFamily: "Fugaz",
                  backgroundColor:"#86e72bff",
                  color:"#fff",
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  borderRadius: 20,
                }}
              >{firstLetter}</Text>
            ),
          }}
        />
        <Stack.Screen
          name="Chat"
          component={Chat}
          options={{
            headerTitle: "Contacts",
            headerTitleStyle: { fontFamily: "Fugaz" },

            headerRight: () => (
              <Text
                style={{
                  marginRight: 12,
                  fontFamily: "Fugaz",
                  backgroundColor:"#86e72bff",
                  color:"#fff",
                  paddingVertical: 5,
                  paddingHorizontal: 12,
                  borderRadius: 20,
                }}
              >{firstLetter}</Text>
            ),
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
