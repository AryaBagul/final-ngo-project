import axios from "axios";

const instance = axios.create({
  baseURL: "https://ngoconnect-backend-xnyv.onrender.com/api",
});

// Automatically attach JWT token to every request
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
