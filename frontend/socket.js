import AsyncStorage from "@react-native-async-storage/async-storage"
import {io} from "socket.io-client"

const userID = JSON.parse(AsyncStorage.getItem("usesr"))?._id

const socket = io("http://192.168.1.8:3000",{
    withCredentials:true,
    transports:["websocket"],
    query:{
        userId:userID || "guest"
    }
})
 
export default socket;