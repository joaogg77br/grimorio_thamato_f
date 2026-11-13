import { io } from "socket.io-client"
import { API_BASE_URL } from "../useApi/config.js"

const socket = io(API_BASE_URL, {
  transports: ["websocket"]
})

export default socket
