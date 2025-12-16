import { http, setAuthToken } from "../lib/http.js";

export async function login(payload) {
  const res = await http.post("/login", payload);
  const token = res?.data?.token;
  setAuthToken(token);
  return res.data;
}