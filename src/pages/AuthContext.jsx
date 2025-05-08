import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isArtisan, setIsArtisan] = useState(() => {
    return localStorage.getItem("isArtisan") === "true";
  });
  const [artisanId, setArtisanId] = useState(() => {
    return localStorage.getItem("artisanId") || null;
  });
  const [coins, setCoins] = useState(() => {
    const storedCoins = localStorage.getItem("coins");
    return storedCoins ? parseInt(storedCoins) : null;
  });

  const login = async (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    try {
      const response = await fetch(`http://localhost:8080/artisan/${userData.id}`);
      if (response.ok) {
        const artisanData = await response.json();
        const isRegistered = artisanData && artisanData.id;
        localStorage.setItem("isArtisan", isRegistered ? "true" : "false");
        localStorage.setItem("artisanId", artisanData.id || null);
        localStorage.setItem("coins", artisanData.coins || 0);
        setIsArtisan(isRegistered);
        setArtisanId(artisanData.id || null);
        setCoins(artisanData.coins || 0);
      } else {
        localStorage.setItem("isArtisan", "false");
        localStorage.setItem("artisanId", null);
        localStorage.setItem("coins", "0");
        setIsArtisan(false);
        setArtisanId(null);
        setCoins(0);
      }
    } catch (error) {
      console.error("Error checking artisan status:", error);
      localStorage.setItem("isArtisan", "false");
      localStorage.setItem("artisanId", null);
      localStorage.setItem("coins", "0");
      setIsArtisan(false);
      setArtisanId(null);
      setCoins(0);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isArtisan");
    localStorage.removeItem("artisanId");
    localStorage.removeItem("coins");
    setUser(null);
    setIsArtisan(false);
    setArtisanId(null);
    setCoins(null);
  };

  const setArtisanStatus = (status) => {
    localStorage.setItem("isArtisan", status);
    setIsArtisan(status === "true");
  };

  const setArtisan = (id) => {
    localStorage.setItem("artisanId", id);
    localStorage.setItem("isArtisan", "true");
    setArtisanId(id);
    setIsArtisan(true);
  };

  const updateCoins = (newCoins) => {
    setCoins(newCoins);
    localStorage.setItem("coins", newCoins);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, setArtisan, isArtisan, artisanId, setArtisanStatus, coins, updateCoins }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};