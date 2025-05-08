import React, { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isArtisan, setIsArtisan] = useState(() => localStorage.getItem("isArtisan") === "true");
  const [artisanId, setArtisanId] = useState(() => localStorage.getItem("artisanId") || null);
  const [coins, setCoins] = useState(() => {
    const storedCoins = localStorage.getItem("coins");
    return storedCoins ? parseInt(storedCoins) : null;
  });

  const login = useCallback(async (userData) => {
    try {
      console.log("Logging in user:", userData);
      // Clear stale localStorage to avoid outdated coins
      localStorage.removeItem("coins");
      localStorage.removeItem("isArtisan");
      localStorage.removeItem("artisanId");
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      const response = await fetch(`http://localhost:8080/artisan/${userData.id}`);
      if (!response.ok) {
        console.warn(`Artisan not found for user ${userData.id}: ${response.status}`);
        localStorage.setItem("isArtisan", "false");
        localStorage.setItem("artisanId", null);
        setIsArtisan(false);
        setArtisanId(null);
        setCoins(null);
        return;
      }

      const artisanData = await response.json();
      const isRegistered = artisanData && artisanData.id;
      console.log("Artisan data:", artisanData);
      localStorage.setItem("isArtisan", isRegistered ? "true" : "false");
      localStorage.setItem("artisanId", artisanData.id || null);
      setIsArtisan(isRegistered);
      setArtisanId(artisanData.id || null);

      if (isRegistered) {
        const coinsResponse = await fetch(`http://localhost:8080/artisan/${artisanData.id}/coins`);
        console.log("Coins fetch status:", coinsResponse.status);
        if (coinsResponse.ok) {
          const { coins: newCoins } = await coinsResponse.json();
          console.log("Fetched coins:", newCoins);
          setCoins(newCoins);
          localStorage.setItem("coins", newCoins.toString());
        } else {
          console.error(`Failed to fetch coins: ${coinsResponse.status} ${await coinsResponse.text()}`);
          setCoins(null);
          localStorage.removeItem("coins");
        }
      } else {
        setCoins(null);
        localStorage.removeItem("coins");
      }
    } catch (error) {
      console.error("Error during login:", error);
      localStorage.setItem("isArtisan", "false");
      localStorage.setItem("artisanId", null);
      localStorage.removeItem("coins");
      setIsArtisan(false);
      setArtisanId(null);
      setCoins(null);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("isArtisan");
    localStorage.removeItem("artisanId");
    localStorage.removeItem("coins");
    setUser(null);
    setIsArtisan(false);
    setArtisanId(null);
    setCoins(null);
  }, []);

  const setArtisanStatus = useCallback((status) => {
    localStorage.setItem("isArtisan", status);
    setIsArtisan(status === "true");
  }, []);

  const setArtisan = useCallback(async (id) => {
    try {
      localStorage.setItem("artisanId", id);
      setArtisanId(id);
      setIsArtisan(true);

      const response = await fetch(`http://localhost:8080/artisan/${id}/coins`);
      console.log("Set artisan coins fetch status:", response.status);
      if (response.ok) {
        const { coins: newCoins } = await response.json();
        console.log("Set artisan coins:", newCoins);
        setCoins(newCoins);
        localStorage.setItem("coins", newCoins.toString());
      } else {
        console.error(`Failed to fetch coins for artisan: ${response.status} ${await response.text()}`);
        setCoins(null);
        localStorage.removeItem("coins");
      }
    } catch (error) {
      console.error("Error setting artisan:", error);
      setCoins(null);
      localStorage.removeItem("coins");
    }
  }, []);

  const updateCoins = useCallback((newCoins) => {
    console.log("Updating coins to:", newCoins);
    setCoins(newCoins);
    localStorage.setItem("coins", newCoins.toString());
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        setArtisan,
        isArtisan,
        artisanId,
        setArtisanStatus,
        coins,
        updateCoins,
      }}
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