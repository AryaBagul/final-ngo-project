import { io } from "socket.io-client";

const socket = io("https://ngoconnect-backend-xnyv.onrender.com", {});

export default socket;