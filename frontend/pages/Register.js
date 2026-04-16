import { StyleSheet, Text, TextInput, View, Pressable } from "react-native";

export const Register = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Register Your Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Your Name"
        placeholderTextColor="#888"
      />

      <TextInput
        style={styles.input}
        placeholder="Enter Your Email"
        placeholderTextColor="#888"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Enter Your Password"
        placeholderTextColor="#888"
        secureTextEntry
      />

      <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
        <Text style={styles.buttonText}>Register</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },

  heading: {
    fontSize: 28,
    fontFamily: "Fugaz",
    color: "#000",
    marginBottom: 30,
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 14,
    marginVertical: 10,
    fontFamily: "serif",
    fontSize: 14,
    color: "#000",
  },

  button: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },

  buttonPressed: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "PoppinsBold",
  },
});