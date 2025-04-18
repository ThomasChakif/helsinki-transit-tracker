import { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { 
  fetchTrainStations, fetchMetroStations, fetchTramStations, fetchLightRailStations,
  fetchTrainRoutes, fetchMetroRoutes, fetchTramRoutes, fetchLightRailRoutes 
} from '../api/transportApi';
import TransportLayer from './TransportLayer';
import Controls from './Controls';
import { DEFAULT_POSITION, DEFAULT_ZOOM, TILE_LAYER, TRANSPORT_COLORS } from '../constants/mapConfig';
import './Map.css';

// Firebase imports
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";

const Map = () => {
  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCnB2Dn0c3uJ78CeS9rOGLtVoFKkfIRqfM",
    authDomain: "helsinki-test-ecbb2.firebaseapp.com",
    projectId: "helsinki-test-ecbb2",
    storageBucket: "helsinki-test-ecbb2.firebasestorage.app",
    messagingSenderId: "734554427133",
    appId: "1:734554427133:web:8aa4bb4e65529957f0f894",
    measurementId: "G-2NBC6V42XP"
  };

  // States for data
  const [transportData, setTransportData] = useState({
    stations: {
      train: [],
      metro: [],
      tram: [],
      lightRail: []
    },
    routes: {
      train: [],
      metro: [],
      tram: [],
      lightRail: []
    }
  });

  // States for UI
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // States for visibility
  const [layerVisibility, setLayerVisibility] = useState({
    trainStations: false,
    metroStations: false,
    tramStations: false,
    lightRailStations: false,
    trainRoutes: false,
    metroRoutes: false,
    tramRoutes: true,
    lightRailRoutes: false
  });

  // User authentication state
  const [user, setUser] = useState(null);
  const [showLoginButton, setShowLoginButton] = useState(true);

  // Initialize Firebase
  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    auth.languageCode = 'en';

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setShowLoginButton(false);
      } else {
        setUser(null);
        setShowLoginButton(true);
      }
    });

    return () => unsubscribe(); // Clean up subscription
  }, []);

  // Google sign-in handler
  const handleGoogleSignIn = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // The signed-in user info
      const user = result.user;
      setUser(user);
      setShowLoginButton(false);
    } catch (error) {
      console.error("Error during sign-in:", error.message);
    }
  };

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load all data
        const [
          trainStationsData, metroStationsData, tramStationsData, lightRailStationsData,
          trainRoutesData, metroRoutesData, tramRoutesData, lightRailRoutesData
        ] = await Promise.all([
          fetchTrainStations(),
          fetchMetroStations(),
          fetchTramStations(),
          fetchLightRailStations(),
          fetchTrainRoutes(),
          fetchMetroRoutes(),
          fetchTramRoutes(),
          fetchLightRailRoutes()
        ]);

        // Update state with all data
        setTransportData({
          stations: {
            train: trainStationsData,
            metro: metroStationsData,
            tram: tramStationsData,
            lightRail: lightRailStationsData
          },
          routes: {
            train: trainRoutesData,
            metro: metroRoutesData,
            tram: tramRoutesData,
            lightRail: lightRailRoutesData
          }
        });

        setError(null);
      } catch (error) {
        setError('Failed to load data');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Toggle handler
  const handleToggle = (layerId) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  };

  // Create toggle controls configuration
  const toggleControls = [
    { id: 'metroStations', label: 'Show Metro Stations', checked: layerVisibility.metroStations },
    { id: 'metroRoutes', label: 'Show Metro Routes', checked: layerVisibility.metroRoutes },
    { id: 'trainStations', label: 'Show Train Stations', checked: layerVisibility.trainStations },
    { id: 'trainRoutes', label: 'Show Train Routes', checked: layerVisibility.trainRoutes },
    { id: 'lightRailStations', label: 'Show Light Rail Stations', checked: layerVisibility.lightRailStations },
    { id: 'lightRailRoutes', label: 'Show Light Rail Routes', checked: layerVisibility.lightRailRoutes },
    { id: 'tramStations', label: 'Show Tram Stations', checked: layerVisibility.tramStations },
    { id: 'tramRoutes', label: 'Show Tram Routes', checked: layerVisibility.tramRoutes }
  ];

  return (
    <div>
      <div className="auth-container">
        {showLoginButton ? (
          <button 
            id="google-login-btn" 
            className="google-button" 
            onClick={handleGoogleSignIn}
          >
            <i className="fab fa-google"></i> Login With Google
          </button>
        ) : (
          <div id="displayUserInfo" className="user-info">
            <p id="userName">Hi, {user?.displayName}</p>
          </div>
        )}
      </div>
      
      {isLoading && <p>Loading data...</p>}
      {error && <p className="error">{error}</p>}
      
      <Controls toggles={toggleControls} onToggle={handleToggle} />

      <MapContainer 
        className='mapcontainer'
        center={DEFAULT_POSITION}
        zoom={DEFAULT_ZOOM}
        style={{ height: "850px", width: "100%" }}
      >
        <TileLayer
          url={TILE_LAYER.url}
          attribution={TILE_LAYER.attribution}
          maxZoom={TILE_LAYER.maxZoom}
        />

        {/* Metro layers */}
        {layerVisibility.metroRoutes && (
          <TransportLayer 
            type="metro" 
            data={transportData.routes.metro} 
            isRoute={true} 
            color={TRANSPORT_COLORS.SUBWAY} 
          />
        )}
        {layerVisibility.metroStations && (
          <TransportLayer 
            type="metro" 
            data={transportData.stations.metro} 
          />
        )}

        {/* Train layers */}
        {layerVisibility.trainRoutes && (
          <TransportLayer 
            type="train" 
            data={transportData.routes.train} 
            isRoute={true} 
            color={TRANSPORT_COLORS.RAIL} 
          />
        )}
        {layerVisibility.trainStations && (
          <TransportLayer 
            type="train" 
            data={transportData.stations.train} 
          />
        )}

        {/* Tram layers */}
        {layerVisibility.tramRoutes && (
          <TransportLayer 
            type="tram" 
            data={transportData.routes.tram} 
            isRoute={true} 
            color={TRANSPORT_COLORS.TRAM} 
          />
        )}
        {layerVisibility.tramStations && (
          <TransportLayer 
            type="tram" 
            data={transportData.stations.tram} 
          />
        )}

        {/* Light Rail layers */}
        {layerVisibility.lightRailRoutes && (
          <TransportLayer 
            type="lightRail" 
            data={transportData.routes.lightRail} 
            isRoute={true} 
            color={TRANSPORT_COLORS.LIGHTRAIL} 
          />
        )}
        {layerVisibility.lightRailStations && (
          <TransportLayer 
            type="lightRail" 
            data={transportData.stations.lightRail} 
          />
        )}
      </MapContainer>
    </div>
  );
};

export default Map;