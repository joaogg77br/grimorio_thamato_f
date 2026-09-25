import axios from "axios"
import { localDB } from "../lib/localDB.js"
import { API_BASE_URL } from "./config.js"

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

client.interceptors.request.use(config => {
  const token = localDB.getSession()?.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localDB.clearSession()
      window.dispatchEvent(new Event("grimorio:unauthorized"))
    }
    return Promise.reject(error)
  }
)

export default client
