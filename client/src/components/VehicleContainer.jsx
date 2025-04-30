// src/components/VehicleContainer.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import useVehicleSocket from '../services/useVehicleSocket';
import Vehicle from './Vehicle';

const VehicleContainer = ({ map }) => {
  // Use a ref to maintain a stable reference to the vehicles map
  const vehiclesRef = useRef(new Map());
  // State to trigger re-renders when vehicles are updated
  const [vehicleIds, setVehicleIds] = useState([]);
  
  // Callback for handling vehicle updates
  const handleVehicleUpdate = useCallback((vehicleData, topic) => {
    const { veh } = vehicleData;
    
    if (!veh) return;
    
    // Update the vehicle data in our ref
    vehiclesRef.current.set(veh, { 
      data: vehicleData, 
      topic, 
      timestamp: Date.now(),
      lastUpdated: Date.now()
    });
    
    // Update the state with the current list of vehicle IDs to trigger a re-render
    setVehicleIds(Array.from(vehiclesRef.current.keys()));
  }, []);
  
  // Use the socket hook
  const { isConnected } = useVehicleSocket(handleVehicleUpdate);
  
  // Optional cleanup to hide stopped vehicles
  useEffect(() => {
    const longTermCleanupInterval = setInterval(() => {
      const now = Date.now();
      const veryStaleTimeout = 3600000; // 1 hour - only remove if truly inactive
      let hasChanges = false;
      
      vehiclesRef.current.forEach((vehicle, vehicleId) => {
        if (now - vehicle.lastUpdated > veryStaleTimeout) {
          vehiclesRef.current.delete(vehicleId);
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        setVehicleIds(Array.from(vehiclesRef.current.keys()));
      }
    }, 300000); // Check every 5 minutes
    
    return () => clearInterval(longTermCleanupInterval);
  }, []);
  
  return (
    <>
      {vehicleIds.map(veh => {
        const vehicle = vehiclesRef.current.get(veh);
        if (!vehicle) return null;
        
        return (
          <Vehicle 
            key={veh} 
            map={map} 
            vehicleData={vehicle.data} 
            topic={vehicle.topic} 
          />
        );
      })}
      
      {!isConnected && (
        <div className="connection-status">
          Connecting to vehicle tracking service...
        </div>
      )}
    </>
  );
};

export default VehicleContainer;
