// src/components/Vehicle.jsx
import { useEffect, useRef } from 'react';
import L from 'leaflet';

const Vehicle = ({ map, vehicleData, topic }) => {
  const markerRef = useRef(null);
  const { veh, lat, long, desi, spd, hdg } = vehicleData;
  
  // Determine vehicle type from MQTT topic
  const vehicleType = topic.includes('/metro/') 
    ? 'metro' 
    : topic.includes('/tram/') 
      ? 'tram' 
      : 'train';
  
  useEffect(() => {
    // Skip if no map, no vehicle ID, or no location
    if (!map || !veh || !lat || !long) return;
    
    // Create the marker if it doesn't exist
    if (!markerRef.current) {
      const vehicleIcon = L.divIcon({
        html: `<div class="${vehicleType}-icon">${desi || ''}</div>`,
        className: `${vehicleType}-marker`,
        iconSize: [30, 30]
      });
      
      markerRef.current = L.marker([lat, long], { icon: vehicleIcon })
        .addTo(map)
        .bindPopup(`${vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)} ${desi || ''} (Vehicle ${veh})`);
    } else {
      // Update existing marker position
      markerRef.current.setLatLng([lat, long]);
      
      // Update popup content
      markerRef.current.getPopup().setContent(
        `<b>${vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)} ${desi || ''}</b> (Vehicle ${veh})<br>
        Speed: ${spd ? spd.toFixed(1) : 0} km/h<br>
        Heading: ${hdg || 0}°`
      );
      
      // Update the icon's inner HTML in case the designation has changed
      const markerElement = markerRef.current.getElement();
      if (markerElement) {
        const iconElement = markerElement.querySelector(`.${vehicleType}-icon`);
        if (iconElement) {
          iconElement.textContent = desi || '';
        }
      }
    }
    
    // Rotate marker according to heading if available
    if (hdg) {
      const markerElement = markerRef.current.getElement();
      if (markerElement) {
        const iconElement = markerElement.querySelector(`.${vehicleType}-icon`);
        if (iconElement) {
          iconElement.style.transform = `rotate(${hdg}deg)`;
        }
      }
    }
    
  }, [map, veh, lat, long, desi, spd, hdg, vehicleType]);
  
  // This component doesn't render anything visible in the React tree
  return null;
};

export default Vehicle;
