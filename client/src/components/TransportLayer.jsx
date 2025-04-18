import { LayerGroup } from 'react-leaflet';
import StationMarker from './StationMarker';
import RoutePolyline from './RoutePolyline';

// A generic component that can be used for any transport type layer
const TransportLayer = ({ type, data, isRoute = false, color }) => {
  return (
    <LayerGroup>
      {isRoute ? (
        // Render routes
        data.map((route, index) => (
          <RoutePolyline 
            key={`${type}-${route.id}-${route.directionId || ''}-${index}`}
            coordinates={route.coordinates}
            name={route.name}
            color={color}
          />
        ))
      ) : (
        // Render stations
        data.map(station => (
          <StationMarker 
            key={station.id} 
            name={station.name} 
            position={station.position} 
            mode={station.mode} 
          />
        ))
      )}
    </LayerGroup>
  );
};

export default TransportLayer;
