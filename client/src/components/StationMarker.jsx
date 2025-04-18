import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { TRANSPORT_COLORS } from '../constants/mapConfig';

const StationMarker = ({ position, name, mode }) => {
  const getMarkerIcon = (markerMode) => {
    let color = '#333333'; // Default color
    const modeType = markerMode.split('_')[0]; // Extract mode type (SUBWAY, TRAM, etc.)
    
    // Use colors from constants
    color = TRANSPORT_COLORS[modeType] || color;

    return L.divIcon({
      className: 'custom-station-marker',
      html: `<div style="
        width: 10px;
        height: 10px;
        background-color: white;
        border: 2px solid ${color};
        border-radius: 50%;
      "></div>`,
      iconSize: [10, 10],
      iconAnchor: [5, 5]
    });
  };

  return (
    <Marker position={position} icon={getMarkerIcon(mode)}>
      <Popup>
        <b>{name}</b>
        <br />
        {mode.replace('_', ' ')}
      </Popup>
    </Marker>
  );
};

export default StationMarker;
