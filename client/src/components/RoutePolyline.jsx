import { Polyline, Popup } from 'react-leaflet';

const RoutePolyline = ({ coordinates, name, color }) => {
  return (
    <Polyline 
      positions={coordinates} 
      pathOptions={{
        color: color || '#0078D7',
        weight: 4,
        opacity: 0.8
      }}
    >
      <Popup>
        <b>{name}</b>
      </Popup>
    </Polyline>
  );
};

export default RoutePolyline;
