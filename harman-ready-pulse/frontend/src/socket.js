import { io } from "socket.io-client";

const getSocketUrl = () => {
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    const paramUrl = urlParams.get("backend");
    if (paramUrl) {
      localStorage.setItem("drivesync_backend_url", paramUrl);
      return paramUrl;
    }
    const cachedUrl = localStorage.getItem("drivesync_backend_url");
    if (cachedUrl) return cachedUrl;
  }
  return import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";
};

const SOCKET_URL = getSocketUrl();

export const socket = io(SOCKET_URL, {
  autoConnect: true,
});