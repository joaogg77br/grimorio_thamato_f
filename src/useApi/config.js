export const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:3000"
  : import.meta.env.VITE_API_URL ?? "https://grimorioback-rnkt.vercel.app/"
