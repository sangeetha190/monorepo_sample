import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || "https://example.com",
  timeout: 30000
});

export function setAuthToken(token) {
  if (token) http.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete http.defaults.headers.common.Authorization;
}