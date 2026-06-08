import React, { createContext, useContext, useEffect, useState } from "react";
import plantsData from "../data/plants";

const PlantContext = createContext();

export const PlantProvider = ({ children }) => {
  const [plants, setPlants] = useState([]);

  // ✅ Load from localStorage 
  useEffect(() => {
    const storedPlants = localStorage.getItem("plants");

    if (storedPlants) {
      setPlants(JSON.parse(storedPlants));
    } else {
      localStorage.setItem("plants", JSON.stringify(plantsData));
      setPlants(plantsData);
    }
  }, []);

  // ✅ Persist changes
  useEffect(() => {
    localStorage.setItem("plants", JSON.stringify(plants));
  }, [plants]);

  return (
    <PlantContext.Provider value={{ plants, setPlants }}>
      {children}
    </PlantContext.Provider>
  );
};

// Custom hook (clean usage)
export const usePlants = () => useContext(PlantContext);
