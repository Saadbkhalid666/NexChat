import { Text, View } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useState } from "react"
import jwtDecode from "jwt-decode"
import { API_URL } from "../config/api"

export const Login  = () => {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        setLoading(true)
        setError("")

        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        })

        const data = await res.json()

        if (res.ok) {
            await AsyncStorage.setItem("token", data.token)
            props.navigation.replace("Contact")
        } else {
            setError(data.message || "Login failed")
        }

        setLoading(false)
    }
   
   
   
   
   return <View> 
    
    <TextInput
    style={styles.input}
    placeholder="Email"
    value={email}
    onChangeText={setEmail}
/>
<TextInput
    style={styles.input}
    placeholder="Password"
    value={password}
    onChangeText={setPassword}
/>
<Button
    title={loading ? "Logging In..." : "Login"}
    onPress={handleLogin}
    disabled={loading}
/>

        <Text>Hello How are You?</Text>
    </View>
}