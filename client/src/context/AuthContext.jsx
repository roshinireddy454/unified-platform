import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get("/api/v1/user/profile", { withCredentials: true });
      if (data.success) setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const login = async (email, password) => {
    const { data } = await axios.post("/api/v1/user/login", { email, password }, { withCredentials: true });
    if (data.success) { setUser(data.user); return data; }
    throw new Error(data.message);
  };

  const register = async (name, email, password, role = "student") => {
    const { data } = await axios.post("/api/v1/user/register", { name, email, password, role }, { withCredentials: true });
    return data;
  };

  const logout = async () => {
    await axios.get("/api/v1/user/logout", { withCredentials: true });
    setUser(null);
  };

  const updateUser = (u) => setUser(u);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refetch: fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
