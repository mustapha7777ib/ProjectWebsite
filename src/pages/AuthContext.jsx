import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [isArtisan, setIsArtisan] = useState(() => {
    return localStorage.getItem("isArtisan") === "true";
  });



  const login = (userData) => {
    console.log("Logging in user:", userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };
  

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isArtisan");
    setUser(null);
    setIsArtisan(false);
  };

  const setArtisanStatus = (status) => {
    localStorage.setItem("isArtisan", status);
    setIsArtisan(status === "true");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isArtisan, setArtisanStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Add this:
export function useAuth() {
  return useContext(AuthContext);
}
