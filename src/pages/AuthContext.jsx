import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isArtisan, setIsArtisan] = useState(false);
  const [artisanId, setArtisanId] = useState(null);
  const [coins, setCoins] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
  const checkSessionAndFetchUser = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/check-session", {
        credentials: "include",
      });
      console.log("Auth check status:", response.status);
      if (!response.ok) {
        console.error("Auth check failed:", response.status);
        localStorage.removeItem("user");
        localStorage.removeItem("coins");
        setLoading(false);
        return;
      }
      const sessionUser = await response.json();
      console.log("Session user:", sessionUser);
      localStorage.setItem("user", JSON.stringify(sessionUser));
      setUser(sessionUser);
      // Continue with artisan and coins fetching as before
      if (sessionUser.artisanId) {
        const response = await fetch(`http://localhost:8080/artisan/${sessionUser.artisanId}`);
        if (response.ok) {
          const artisanData = await response.json();
          setIsArtisan(!!artisanData.id);
          setArtisanId(artisanData.id || null);
          if (artisanData.id) {
            const coinsResponse = await fetch(`http://localhost:8080/artisan/${artisanData.id}/coins`);
            if (coinsResponse.ok) {
              const { coins: newCoins } = await coinsResponse.json();
              setCoins(newCoins);
              localStorage.setItem("coins", newCoins.toString());
            } else {
              setCoins(null);
              localStorage.removeItem("coins");
            }
          }
        } else {
          setIsArtisan(false);
          setArtisanId(null);
          setCoins(null);
          localStorage.removeItem("coins");
        }
      }
    } catch (err) {
      console.error("Error checking session or fetching user:", err);
      setError("Failed to load user data");
      localStorage.removeItem("user");
      localStorage.removeItem("coins");
    } finally {
      setLoading(false);
    }
  };

  const storedUserRaw = localStorage.getItem("user");
  if (storedUserRaw) {
    checkSessionAndFetchUser();
  } else {
    setLoading(false);
  }
}, []);

  const login = useCallback(async (userData) => {
    if (!userData || !userData.id || !userData.email) {
      setError("Invalid user data");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      if (userData.artisanId) {
        const response = await fetch(`http://localhost:8080/artisan/${userData.artisanId}`);
        if (response.ok) {
          const artisanData = await response.json();
          setIsArtisan(!!artisanData.id);
          setArtisanId(artisanData.id || null);
          if (artisanData.id) {
            const coinsResponse = await fetch(`http://localhost:8080/artisan/${artisanData.id}/coins`);
            if (coinsResponse.ok) {
              const { coins: newCoins } = await coinsResponse.json();
              setCoins(newCoins);
              localStorage.setItem("coins", newCoins.toString());
            } else {
              setCoins(null);
              localStorage.removeItem("coins");
            }
          }
        } else {
          setIsArtisan(false);
          setArtisanId(null);
          setCoins(null);
          localStorage.removeItem("coins");
        }
      } else {
        setIsArtisan(false);
        setArtisanId(null);
        setCoins(null);
        localStorage.removeItem("coins");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to log in");
      localStorage.removeItem("user");
      localStorage.removeItem("coins");
      setUser(null);
      setIsArtisan(false);
      setArtisanId(null);
      setCoins(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("coins");
    setUser(null);
    setIsArtisan(false);
    setArtisanId(null);
    setCoins(null);
    setError(null);
    navigate("/signin");
  }, [navigate]);

  const setArtisan = useCallback(async (id) => {
    if (!id) {
      setError("Invalid artisan ID");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:8080/artisan/${id}`);
      if (response.ok) {
        const artisanData = await response.json();
        setIsArtisan(!!artisanData.id);
        setArtisanId(artisanData.id || null);
        if (artisanData.id) {
          const coinsResponse = await fetch(`http://localhost:8080/artisan/${artisanData.id}/coins`);
          if (coinsResponse.ok) {
            const { coins: newCoins } = await coinsResponse.json();
            setCoins(newCoins);
            localStorage.setItem("coins", newCoins.toString());
          } else {
            setCoins(null);
            localStorage.removeItem("coins");
          }
        }
      } else {
        setError("Failed to fetch artisan data");
        setIsArtisan(false);
        setArtisanId(null);
        setCoins(null);
        localStorage.removeItem("coins");
      }
    } catch (err) {
      console.error("Error setting artisan:", err);
      setError("Failed to set artisan");
      setIsArtisan(false);
      setArtisanId(null);
      setCoins(null);
      localStorage.removeItem("coins");
    } finally {
      setLoading(false);
    }
  }, []);

  const setArtisanStatus = useCallback((status) => {
    const isArtisanStatus = status === "true" || status === true;
    setIsArtisan(isArtisanStatus);
  }, []);

  const updateCoins = useCallback((newCoins) => {
    if (typeof newCoins !== "number" || newCoins < 0) {
      setError("Invalid coin amount");
      return;
    }
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
        setArtisanStatus,
        isArtisan,
        artisanId,
        coins,
        updateCoins,
        loading,
        error,
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