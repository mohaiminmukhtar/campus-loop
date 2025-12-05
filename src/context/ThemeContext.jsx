import React, { createContext, useContext, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {

  useEffect(() => {
    const root = document.documentElement;

    // Main colors
    root.style.setProperty("--bg-primary", "#FFFFFF");
    root.style.setProperty("--bg-secondary", "#F2F2F4");

    // Accent (Orange)
    root.style.setProperty("--accent-primary", "#FF6A2A");
    root.style.setProperty("--accent-hover", "#FF8A47");

    // Text
    root.style.setProperty("--text-heading", "#2B2B2C");
    root.style.setProperty("--text-body", "#2B2B2C");

    // Glass
    root.style.setProperty("--glass", "rgba(242, 242, 244, 0.9)");

    // Glow
    root.style.setProperty(
      "--glow-primary",
      "0 0 20px rgba(255, 106, 42, 0.3), 0 0 40px rgba(255, 106, 42, 0.15)"
    );
    root.style.setProperty(
      "--glow-secondary",
      "0 0 15px rgba(255, 138, 71, 0.25), 0 0 30px rgba(255, 138, 71, 0.12)"
    );
    root.style.setProperty(
      "--glow-soft",
      "0 0 10px rgba(255, 106, 42, 0.15)"
    );
    root.style.setProperty(
      "--glow-card",
      "0 4px 20px rgba(0, 0, 0, 0.1), 0 0 10px rgba(255, 106, 42, 0.1)"
    );

    // Body background + gradient
    const gradient =
      "radial-gradient(circle at 20% 50%, rgba(255, 106, 42, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 138, 71, 0.04) 0%, transparent 50%)";

    document.body.style.background = "#FFFFFF";
    document.body.style.backgroundImage = gradient;

    root.style.setProperty("--bg-gradient", gradient);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "light" }}>
      {children}
    </ThemeContext.Provider>
  );
};
