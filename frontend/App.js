import {
  Text,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { Home } from "./pages/Home";
import { SignUp } from "./pages/Signup";
import { Contact } from "./pages/contacts";

import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer, useNavigation } from "@react-navigation/native";

import { useFonts } from "expo-font";
import { useContext, useEffect, useRef, useState } from "react";
import * as SplashScreen from "expo-splash-screen";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Chat } from "./pages/chat";
import { UserContext, UserProvider } from "./context/UserContext";
import { Login } from "./pages/Login";
import { AdminPanel } from "./pages/adminPanel";

SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

function AvatarMenu({ firstLetter }) {
  const [visible, setVisible] = useState(false);
  const [btnLayout, setBtnLayout] = useState(null);
  const btnRef = useRef(null);
  const navigation = useNavigation();
  const { user } = useContext(UserContext);

  const isAdmin = user?.role === "admin";

  const openMenu = () => {
    if (btnRef.current) {
      btnRef.current.measureInWindow((x, y, width, height) => {
        setBtnLayout({ x, y, width, height });
        setVisible(true);
      });
    }
  };

  const goToAdmin = () => {
    setVisible(false);
    if (isAdmin) {
      navigation.navigate("Admin Panel");
    } else {
      Alert.alert("Access Denied", "You do not have admin privileges.", [
        { text: "OK" },
      ]);
    }
  };

  return (
    <>
      <TouchableOpacity
        ref={btnRef}
        onPress={openMenu}
        activeOpacity={0.75}
        style={styles.avatar}
      >
        <Text style={styles.avatarText}>{firstLetter}</Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        {/* Full-screen invisible backdrop */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setVisible(false)}
        />

        {/* Dropdown card positioned below the avatar */}
        {btnLayout && (
          <View
            style={[
              styles.dropdown,
              {
                top: btnLayout.y + btnLayout.height + 6,
                right: 12,
              },
            ]}
          >
            {/* Admin Panel row */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={goToAdmin}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>🛡️</Text>
              <View>
                <Text style={styles.menuLabel}>Admin Panel</Text>
                {!isAdmin && <Text style={styles.menuSub}>Not authorized</Text>}
              </View>
              {isAdmin && <Text style={styles.menuArrow}>›</Text>}
            </TouchableOpacity>
          </View>
        )}
      </Modal>
    </>
  );
}

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

  const firstLetter = username[0] ?? "?";
  if (!loaded) return null;

  const avatarHeader = () => <AvatarMenu firstLetter={firstLetter} />;

  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={Home}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Contact"
            component={Contact}
            options={{
              headerTitle: "Contacts",
              headerTitleStyle: { fontFamily: "Fugaz" },
              headerRight: avatarHeader,
            }}
          />

          <Stack.Screen
            name="Chat"
            component={Chat}
            options={{
              headerTitle: "Chat",
              headerTitleStyle: { fontFamily: "Fugaz" },
              headerRight: avatarHeader,
            }}
          />

          <Stack.Screen
            name="Admin Panel"
            component={AdminPanel}
            options={{
              headerTitle: "Admin",
              headerTitleStyle: { fontFamily: "Fugaz" },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  avatar: {
    marginRight: 12,
    backgroundColor: "#86e72b",
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontFamily: "Fugaz",
    color: "#fff",
    fontSize: 16,
  },
  dropdown: {
    position: "absolute",
    minWidth: 190,
    backgroundColor: "#1e1e2e",
    borderRadius: 12,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(134,231,43,0.18)",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 14,
    gap: 10,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuLabel: {
    color: "#fff",
    fontFamily: "Fugaz",
    fontSize: 14,
  },
  menuSub: {
    color: "#ff6b6b",
    fontSize: 11,
    marginTop: 1,
  },
  menuArrow: {
    color: "#86e72b",
    fontSize: 22,
    marginLeft: "auto",
  },
});
