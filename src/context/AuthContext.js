import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function restore() {
      const storedToken = await SecureStore.getItemAsync("tala_token");
      const storedUser = await SecureStore.getItemAsync("tala_user");
      setToken(storedToken || "");
      setUser(storedUser ? JSON.parse(storedUser) : null);
      setReady(true);
    }
    restore();
  }, []);

  async function saveSession(data) {
    await SecureStore.setItemAsync("tala_token", data.token);
    await SecureStore.setItemAsync("tala_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  async function login(phone, password) {
    const data = await api("/login", {
      method: "POST",
      body: JSON.stringify({ phone, password })
    });
    await saveSession(data);
  }

  async function register(name, phone, password) {
    const data = await api("/register", {
      method: "POST",
      body: JSON.stringify({ name, phone, password })
    });
    await saveSession(data);
  }

  async function logout() {
    await SecureStore.deleteItemAsync("tala_token");
    await SecureStore.deleteItemAsync("tala_user");
    setToken("");
    setUser(null);
  }

  const value = useMemo(
    () => ({ ready, token, user, isAuthenticated: Boolean(token), login, register, logout }),
    [ready, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
