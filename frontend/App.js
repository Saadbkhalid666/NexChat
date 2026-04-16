import { View } from "react-native";
import { Home } from "./pages/Home";
import { createStackNavigator } from "@react-navigation/stack";
import { Register } from "./pages/Register";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function App() {
  
  const Stack = createStackNavigator();

  const [loaded] = useFonts({
      Fugaz: require('./assets/fonts/FugazOne-Regular.ttf'),
});

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" options={{headerShown:false}} component={Home} />
        <Stack.Screen name="Register" options={{headerShown:false}} component={Register} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
