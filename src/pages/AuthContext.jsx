
import React, { createContext, useContext, useState } from "react";
const AuthContext = createContext(null);

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [isArtisan, setIsArtisan] = useState(() => {
    return localStorage.getItem("isArtisan") === "true";
  });

  const [artisanId, setArtisanId] = useState((id) => {
    return localStorage.getItem("artisanId") === id;
  });

  const login = async (userData) => {
    console.log("Logging in user:", userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    try {
      const response = await fetch(`http://localhost:8080/artisan/${userData.id}`);
      if (response.ok) {
        const artisanData = await response.json();
        const isRegistered = artisanData && artisanData.id;
        localStorage.setItem("isArtisan", isRegistered ? "true" : "false");
        setIsArtisan(isRegistered);
      } else {
        localStorage.setItem("isArtisan", "false");
        setIsArtisan(false);
      }
    } catch (error) {
      console.error("Error checking artisan status:", error);
      localStorage.setItem("isArtisan", "false");
      setIsArtisan(false);
    }
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

  const setArtisan = (id) => {
    localStorage.setItem("artisanId", id);
    setArtisanId(id);
    setIsArtisan(true);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, setArtisan, isArtisan, artisanId, setArtisanStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  return useContext(AuthContext);
};
