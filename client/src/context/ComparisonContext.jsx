import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const ComparisonContext = createContext(null);

export const ComparisonProvider = ({ children }) => {
  const [selectedVehicles, setSelectedVehicles] = useState(() => {
    try {
      const stored = localStorage.getItem('ridex_comparison');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const { warning, info } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem('ridex_comparison', JSON.stringify(selectedVehicles));
    } catch {
      // Ignore storage errors
    }
  }, [selectedVehicles]);

  const addVehicle = (vehicle) => {
    if (!vehicle || !vehicle._id) return false;

    if (selectedVehicles.some((v) => v._id === vehicle._id)) {
      warning('This vehicle is already in your comparison list');
      return false;
    }

    if (selectedVehicles.length >= 5) {
      warning('You can compare a maximum of 5 vehicles at once');
      return false;
    }

    setSelectedVehicles((prev) => [...prev, vehicle]);
    info(`Added ${vehicle.make} ${vehicle.model} to comparison`);
    return true;
  };

  const removeVehicle = (vehicleId) => {
    setSelectedVehicles((prev) => prev.filter((v) => v._id !== vehicleId));
  };

  const toggleVehicle = (vehicle) => {
    if (isInComparison(vehicle._id)) {
      removeVehicle(vehicle._id);
    } else {
      addVehicle(vehicle);
    }
  };

  const clearComparison = () => {
    setSelectedVehicles([]);
  };

  const isInComparison = (vehicleId) => {
    return selectedVehicles.some((v) => v._id === vehicleId);
  };

  return (
    <ComparisonContext.Provider
      value={{
        selectedVehicles,
        addVehicle,
        removeVehicle,
        toggleVehicle,
        clearComparison,
        isInComparison,
        count: selectedVehicles.length,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};

export default ComparisonContext;
