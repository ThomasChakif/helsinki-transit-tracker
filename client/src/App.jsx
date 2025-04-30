import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, LayerGroup } from 'react-leaflet';
import L, { divIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css';

const fetchTramStationsData = async () => {
  try {
    const response = await fetch('../public/cleaned-tram-stops.json');
    if (!response.ok) {
      throw new Error("Error fetching station data");
    }
    return await response.json();
  } catch (error) {
    console.log("Error fetching station data: ", error)
    return []
  }
}


const fetchTrainStationsData = async () => {
  try {
    const response = await fetch('../public/cleaned-train-stops.json');
    if (!response.ok) {
      throw new Error("Error fetching station data");
    }
    return await response.json();
  } catch (error) {
    console.log("Error fetching station data: ", error)
    return []
  }
}


const fetchMetroStationsData = async () => {
  try {
    const response = await fetch('../public/cleaned-metro-stops.json');
    if (!response.ok) {
      throw new Error("Error fetching station data");
    }
    return await response.json();
  } catch (error) {
    console.log("Error fetching station data: ", error)
    return []
  }
}

const fetchLightRailStationsData = async () => {
  try {
    const response = await fetch('../public/cleaned-lightrail-stops.json');
    if (!response.ok) {
      throw new Error("Error fetching station data");
    }
    return await response.json();
  } catch (error) {
    console.log("Error fetching station data: ", error)
    return []
  }
}



const fetchTrainRoutesData = async () => {
  try {
    const [trainRoute1Response, trainRoute2Response, trainRoute3Response] = await Promise.all([
      fetch('../train_patterns/train-H-U-1.json'),
      fetch('../train_patterns/train-I-U-1.json'),
      fetch('../train_patterns/train-K-U-1.json')
    ])
    if (!trainRoute1Response.ok || !trainRoute2Response.ok || !trainRoute3Response.ok) {
      throw new Error("Error fetching route data")
    }
    const trainRoute1Data = await trainRoute1Response.json();
    const trainRoute2Data = await trainRoute2Response.json();
    const trainRoute3Data = await trainRoute3Response.json();

    // Combine both route arrays
    return [...trainRoute1Data, ...trainRoute2Data, ...trainRoute3Data];

  } catch (error) {
    console.log("Error fetching route data: ", error)
    return []
  }
}


const fetchMetroRoutesData = async () => {
  try {
    const [metroRoute1Response, metroRoute2Response] = await Promise.all([
      fetch('../individual/metro-route-1-kiv-vuo.json'),
      fetch('../individual/metro-route-2-itis-mell.json')
    ])
    if (!metroRoute1Response.ok || !metroRoute2Response.ok) {
      throw new Error("Error fetching route data")
    }
    const metroRoute1Data = await metroRoute1Response.json();
    const metroRoute2Data = await metroRoute2Response.json();

    // Combine both route arrays
    return [...metroRoute1Data, ...metroRoute2Data];

  } catch (error) {
    console.log("Error fetching route data: ", error)
    return []
  }
}

const fetchTramRoutesData = async () => {
  try {
    const tramFiles = [
      "tram-1.json",
      "tram-10.json",
      "tram-10H.json",
      "tram-13.json",
      "tram-13H.json",
      "tram-15.json",
      "tram-1H.json",
      "tram-1T.json",
      "tram-2.json",
      "tram-2H.json",
      "tram-3.json",
      "tram-3H.json",
      "tram-3N.json",
      "tram-4.json",
      "tram-4H.json",
      "tram-6B.json",
      "tram-6H.json",
      "tram-6T.json",
      "tram-7B.json",
      "tram-7H.json",
      "tram-7T.json",
      "tram-8.json",
      "tram-8H.json",
      "tram-8T.json",
      "tram-9B.json",
      "tram-9H.json",
      "tram-9N.json",
      "tram-9T.json"
    ];

    // Create an array of promises for all file fetches
    const filePromises = tramFiles.map(filename => 
      fetch(`../tram_patterns/${filename}`)
        .then(response => {
          if (!response.ok) {
            console.log(`Failed to fetch ${filename}: ${response.status}`);
            return null;
          }
          return response.json();
        })
        .catch(error => {
          console.log(`Error fetching ${filename}:`, error);
          return null;
        })
    );

    // Wait for all promises to resolve
    const results = await Promise.all(filePromises);
    
    // Filter out nulls and flatten the array of route arrays
    const allRoutes = results
      .filter(result => result !== null)
      .flat();
    
    return allRoutes;

  } catch (error) {
    console.log("Error fetching tram route data:", error);
    return [];
  }
};

const fetchLightRailRoutesData = async () => {
  try {
    const lightRailRouteResponse = await fetch('../lightrail_patterns/lightrail-route.json')
    if (!lightRailRouteResponse.ok) {
      throw new Error("Error fetching route data");
    }
    const lightRailRouteData = await lightRailRouteResponse.json();
    return lightRailRouteData
  } catch (error) {
    console.log("Error fetching route data: ", error)
    return []
  }
}

const StationMarker = ({ position, name, mode }) => {
  // each marker needs a positon (long, lat), a name and a type (SUBWAY, tram, train, SUBWAY-stop, tram-stop, train-stop)
  const getMarkerIcon = (markerMode) => {
    // Create a switch statement for different kinds of markers
    let className = '';
    // Initialize each className to an empty string
    let color = '#333333'; // Default color
    switch (markerMode) {
      // these markertypes will be hardcoded later on to reduce the need for logic. actually, I'm not sure if there is a way.
      // add color for each
      
      case 'SUBWAY_stop':
        className = 'SUBWAY_stop'
        color = '#ff6600'; // Orange for SUBWAY
        break;
    
      case 'TRAM_stop':
        className = 'TRAM_stop'
        color = '#00AA66'; // Green for tram
        break;

      case 'RAIL_stop':
        className = 'RAIL_stop'
        color = '#ff0000'; // Red for train
        break;

      case 'LIGHTRAIL_stop':
        className = 'LIGHTRAIL_stop'
        color = 'purple';
        break;
    }

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
  }
  return (
    <Marker position={position} icon={getMarkerIcon(mode)}>
      <Popup>
        <b>{name}</b>
        <br />
        {mode.replace('_', ' ')}
      </Popup>
    </Marker>
  );
}

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
  )
}

const SimpleMap = () => {
  // Helsinki coordinates
  const helsinkiPosition = [60.1699, 24.9384];
  const defaultZoom = 12;

  const [trainStations, setTrainStations] = useState([])
  const [metroStations, setMetroStations] = useState([])
  const [tramStations, setTramStations] = useState([])
  const [lightRailStations, setLightRailStations] = useState([])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [metroRoutes, setMetroRoutes] = useState([])
  const [trainRoutes, setTrainRoutes] = useState([])
  const [tramRoutes, setTramRoutes] = useState([])
  const [lightRailRoutes, setLightRailRoutes] = useState([])

  const [showTrainStations, setShowTrainStations] = useState(true)
  const [showMetroStations, setShowMetroStations] = useState(true)
  const [showTramStations, setShowTramStations] = useState(true)
  const [showLightRailStations, setShowLightRailStations] = useState(true)

  const [showMetroRoutes, setShowMetroRoutes] = useState(true)
  const [showTrainRoutes, setShowTrainRoutes] = useState(true)
  const [showTramRoutes, setShowTramRoutes] = useState(true)
  const [showLightRailRoutes, setShowLightRailRoutes] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const trainStationsData = await fetchTrainStationsData();
        const formattedTrainStations = trainStationsData.map(station => ({
          id: station.id,
          name: station.name,
          position: [station.lat, station.lon],
          mode: `${station.mode}_stop`
        }))
        setTrainStations(formattedTrainStations)

        const metroStationsData = await fetchMetroStationsData();
        const formattedMetroStations = metroStationsData.map(station => ({
          id: station.id,
          name: station.name,
          position: [station.lat, station.lon],
          mode: `${station.mode}_stop`
        }))
        setMetroStations(formattedMetroStations)

        const tramStationsData = await fetchTramStationsData();
        const formattedTramStations = tramStationsData.map(station => ({
          id: station.id,
          name: station.name,
          position: [station.lat, station.lon],
          mode: `${station.mode}_stop`
        }))
        setTramStations(formattedTramStations)

        const lightRailStationsData = await fetchLightRailStationsData();
        const formattedLightRailStations = lightRailStationsData.map(station => ({
          id: station.id,
          name: station.name,
          position: [station.lat, station.lon],
          mode: `${station.mode}_stop`
        }))
        setLightRailStations(formattedLightRailStations)

        // Fetch metro routes
        const metroRoutesData = await fetchMetroRoutesData();
        setMetroRoutes(metroRoutesData);

        // Fetch train routes
        const trainRoutesData = await fetchTrainRoutesData();
        setTrainRoutes(trainRoutesData)

        // Fetch tram routes
        const tramRoutesData = await fetchTramRoutesData();
        setTramRoutes(tramRoutesData)

        // Fetch light rail routes
        const lightRailRoutesData = await fetchLightRailRoutesData();
        setLightRailRoutes(lightRailRoutesData)

        setError(null)
      } catch (error) {
        setError('Failed to load data')
        console.error(error);
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Modify the render section with the toggle controls and layers
  return (
    <div>
      {isLoading && <p>Loading data...</p>}
      {error && <p className="error">{error}</p>}
      <div className='map-controls'>
      <label>
          <input type="checkbox" 
          checked={showMetroStations}
          onChange={(e) => setShowMetroStations(e.target.checked)}/>
          Show Metro Stations
      </label>
      <label>
          <input type="checkbox"
          checked={showMetroRoutes}
          onChange={(e) => setShowMetroRoutes(e.target.checked)} />
          Show Metro Routes
      </label>
      <label>
          <input type="checkbox" 
          checked={showTrainStations}
          onChange={(e) => setShowTrainStations(e.target.checked)}/>
          Show Train Stations
      </label>
      <label>
          <input type="checkbox"
          checked={showTrainRoutes}
          onChange={(e) => setShowTrainRoutes(e.target.checked)} />
          Show Train Routes
      </label>
      <label>
          <input type="checkbox"
          checked={showLightRailStations}
          onChange={(e) => setShowLightRailStations(e.target.checked)} />
          Show Light Rail Stations
      </label>
      <label>
          <input type="checkbox"
          checked={showLightRailRoutes}
          onChange={(e) => setShowLightRailRoutes(e.target.checked)} />
          Show Light Rail Routes
      </label>
      <label>
          <input type="checkbox"
          checked={showTramStations}
          onChange={(e) => setShowTramStations(e.target.checked)} />
          Show Tram Stations
      </label>
      <label>
          <input type="checkbox"
          checked={showTramRoutes}
          onChange={(e) => setShowTramRoutes(e.target.checked)} />
          Show Tram Routes
      </label>
    </div>

      <MapContainer className='mapcontainer'
        center={helsinkiPosition} 
        zoom={defaultZoom} 
        style={{ height: "850px", width: "100%" }}
      >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        maxZoom={19}
      />

        {/* Metro Routes Layer */}
        {showMetroRoutes && (
          <LayerGroup>
            {metroRoutes.map((route, index) => (
              <RoutePolyline 
                key={`metro-${route.id}-${route.directionId}-${index}`}
                coordinates={route.coordinates}
                name={`${route.name}`}
                color="#ff6600"
              />
            ))}
          </LayerGroup>
        )}

        {/* Train Routes Layer */}
        {showTrainRoutes && (
          <LayerGroup>
            {trainRoutes.map((route, index) => (
              <RoutePolyline 
                key={`train-${route.id}-${route.directionId}-${index}`}
                coordinates={route.coordinates}
                name={`${route.name}`}
                color="#8C4799"
              />
            ))}
          </LayerGroup>
        )}
        {/* Tram Routes Layer */}
        {showTramRoutes && (
          <LayerGroup>
            {tramRoutes.map((route, index) => (
              <RoutePolyline 
                key={`tram-${route.id}-${route.directionId}-${index}`}
                coordinates={route.coordinates}
                name={`${route.name}`}
                color="#8C4799"
              />
            ))}
          </LayerGroup>
        )}
        {/* Light Rail Routes Layer */}
        {showLightRailRoutes && (
          <LayerGroup>
            {lightRailRoutes.map((route, index) => (
              <RoutePolyline 
                key={`lightrail-${route.id}-${route.directionId}-${index}`}
                coordinates={route.coordinates}
                name={`${route.name}`}
                color="#8C4799"
              />
            ))}
          </LayerGroup>
        )}

        {/* Metro Stations Layer */}
        {showMetroStations && (
          <LayerGroup>
            {metroStations.map(station => (
              <StationMarker 
                key={station.id} 
                name={station.name} 
                position={station.position} 
                mode={station.mode} 
              />
            ))}
          </LayerGroup>
        )}

        {/* Train Stations Layer */}
        {showTrainStations && (
          <LayerGroup>
            {trainStations.map(station => (
              <StationMarker 
                key={station.id} 
                name={station.name} 
                position={station.position} 
                mode={station.mode} 
              />
            ))}
          </LayerGroup>
        )}

        {/* Tram Stations Layer */}
        {showTramStations && (
          <LayerGroup>
            {tramStations.map(station => (
              <StationMarker 
                key={station.id} 
                name={station.name} 
                position={station.position} 
                mode={station.mode} 
              />
            ))}
          </LayerGroup>
        )}

        {/* Light Rail Stations Layer */}
        {showLightRailStations && (
          <LayerGroup>
            {lightRailStations.map(station => (
              <StationMarker 
                key={station.id} 
                name={station.name} 
                position={station.position} 
                mode={station.mode} 
              />
            ))}
          </LayerGroup>
        )}
      </MapContainer>
    </div> 
  );
}

function App() {
  return (
    <div className="App">
      <h1>Helsinki Transit Tracker</h1>
      <SimpleMap />
    </div>
  );
}

export default App
