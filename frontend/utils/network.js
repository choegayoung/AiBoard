import axios from "axios"

const api = axios.create({
  baseURL: "http://aiedu.tplinkdns.com:6091",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

export default api;