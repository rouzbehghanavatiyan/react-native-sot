import { io } from "socket.io-client";

export const socketClient = io("http://192.168.133.157:4005", {
  transports: ["websocket"],
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  timeout: 20000,
});
