import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, Image, Pressable, StyleSheet, Text, View } from "react-native";

export const Home = (props) => {

    const name = AsyncStorage.getItem("name")

  return (
    <View>
      <View style={styles.container}>
        <Image style={styles.image} source={require("../assets/icon.png")} />
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text
            style={styles.button}
            onPress={() => name ? props.navigation.navigate("Contact") : props.navigation.navigate("Register")}
          >
             {name ? "Continue" : "Press To Register"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
    backgroundColor: "#000",
  },

  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  button: {
    backgroundColor: "#86e72bff",
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
