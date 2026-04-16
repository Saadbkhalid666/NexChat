import AsyncStorage from "@react-native-async-storage/async-storage";
import { StyleSheet, Text, View, Pressable } from "react-native";

export const Contact = () => {
    const name = AsyncStorage.getItem("name")
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Contacts</Text>

      <View style={styles.contact}>
        <Pressable style={({pressed}) => [styles.contact, pressed && styles.contactPressed]}>
          <Text style={styles.contactText}>{name}</Text>
        </Pressable>
      </View>

      <View style={styles.contact}>
        <Pressable style={({pressed}) => [styles.contact, pressed && styles.contactPressed]}>
          <Text style={styles.contactText}>Contact 2</Text>
        </Pressable>
      </View>

      <View style={styles.contact}>
        <Pressable style={({pressed}) => [styles.contact, pressed && styles.contactPressed]}>
          <Text style={styles.contactText}>Contact 3</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 30,
    fontFamily: "Fugaz",
    color: "#000",
  },
  contact: {
    width: "80%",
    height: 50,
    backgroundColor: "#86e72bff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  contactText: {
    width: "100%",
    fontSize: 20,
    fontFamily: "Fugaz",
    color: "#fff",
    textAlign: "center",
  },
  contactPressed:{
    opacity:0.6
  }
});
