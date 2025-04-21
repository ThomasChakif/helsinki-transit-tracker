import { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { 
  fetchTrainStations, fetchMetroStations, fetchTramStations, fetchLightRailStations,
  fetchTrainRoutes, fetchMetroRoutes, fetchTramRoutes, fetchLightRailRoutes 
} from '../api/transportApi';
import TransportLayer from './TransportLayer';
import Controls from './Controls';
import {TextField, MenuItem, Box, Button, Stack, Grid} from '@mui/material'
import { DEFAULT_POSITION, DEFAULT_ZOOM, TILE_LAYER, TRANSPORT_COLORS } from '../constants/mapConfig';
import './Map.css';
import dayjs from 'dayjs'

// Firebase imports
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, setPersistence, browserSessionPersistence, signOut } from "firebase/auth";

const style = {
  position: 'relative',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  margin: '20px',
};

const style2 = {
  position: 'relative',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  margin: '20px',
};

const Map = ({getTransactions, getVehicleResults, getStationResults, getTodaysVotes, getTopVehicle}) => {
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

  const [vehicleStationData, setVehicleStationData] = useState([]);
  const [vehicleStationName, setVehicleStationName] = useState("");
  const [vehicleStationNameToSearch, setVehicleStationNameToSearch] = useState("");
  const [searchResults, setSearchResults] = useState("");
  const [reportType, setReportType] = useState("");
  const [inspectorCount, setInspectorCount] = useState(0);
  const [notes, setNotes] = useState("");


  const viewReports = async() => {
    if(!vehicleStationNameToSearch) {
      alert('Please fill out the vehicle/station name.');
      return;
    }
    try{
      const viewTheReports = {
        name: vehicleStationNameToSearch,
        todayDate: dayjs().format('YYYY-MM-DD'),
        tomDate: dayjs().add(1, 'day').format('YYYY-MM-DD')
      }
      const response = await fetch('http://localhost:3000/adminGetRecentVotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }, 
        body: JSON.stringify(viewTheReports)
      })
      const data = await response.json()
      setSearchResults(data[0]?.average ?? '0.00')
    }catch(err){
      console.error(err)
    }
  }

  const addReport = async() => {
    if(!vehicleStationName || !reportType) {
      alert('Please fill out all required fields.');
      return;
    }
    try{
      const newReport = {
        email: user.email,
        type: reportType,
        name: vehicleStationName,
        notes: notes || 'No Notes',
        count: inspectorCount,
        time: dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
  
      await fetch('http://localhost:3000/newReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newReport)
      })
      alert('Report successfully submitted!')
    }catch(err){
      console.error(err)
    }
  }


  //update the color of the status based on the number of inspectors
  const getStatusColor = () => {
    const numValue = parseFloat(searchResults)
    if (numValue === 0){
      return 'green'
    }else if (numValue >= 0.5 && numValue < 2.0){
      return '#D5B60A'
    }else if (numValue >= 2.0 && numValue < 4.0){
      return 'orange'
    }else if (numValue >= 4.0){
      return 'red'
    }else {
      return 'black'
    }
  }

  //update the text of the status based on the number of inspectors
  const getStatusText = () => {
    const numValue = parseFloat(searchResults)
    if (numValue === 0){
      return 'STATUS: SAFE'
    }else if (numValue >= 0.5 && numValue < 2.0){
      return 'STATUS: LOW RISK'
    }else if (numValue >= 2.0 && numValue < 4.0){
      return 'STATUS: CAUTION'
    }else if (numValue >= 4.0){
      return 'STATUS: High Alert'
    }else{
      return 'STATUS: N/A'
    }
  }

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
      await setPersistence(auth, browserSessionPersistence);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // The signed-in user info
      const user = result.user;
      setUser(user);
      console.log(getAuth()._persistenceManager.persistence.type);
      setShowLoginButton(false);
    } catch (error) {
      console.error("Error during sign-in:", error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      // Sign-out successful
      setUser(null);
      setShowLoginButton(true);
      // Reset user-specific state if needed
      setVehicleStationName("");
      setNotes("");
      setInspectorCount(0);
    } catch (error) {
      console.error("Error during sign-out:", error.message);
      alert("Failed to sign out. Please try again.");
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

  //get all vehicle and station names and types from json file
  useEffect(() => {
    fetch('../../vehicleAndStationData/vehicleStationData.json')
    .then(res => res.json())
    .then(data => setVehicleStationData(data.data))
  })

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
            <button id="sign-out-btn" onClick={handleSignOut}>Sign Out</button>
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

      <Grid container direction="row" 
        sx={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* only add in new report form if a user is signed in */}
        {user && (
          <Box sx = {style2}>
          <h3 className='newReportH3'>Make a new report</h3>
          <Stack spacing={2}>
            <TextField
              style={{marginBottom: '20px', width: '400px'}}
              select
              label = 'Select a vehicle or station'
              variant = 'outlined'
              required
              value = {vehicleStationName}
              onChange = {(event) => {
                //first set the name 
                const selectedPlatform = vehicleStationData.find(platform => platform.name === event.target.value)
                setVehicleStationName(event.target.value)
                const rt = selectedPlatform?.type;
                setReportType(rt)
              }}
            >
              {vehicleStationData.map((vsData) => (
                <MenuItem key={vsData.name} value={vsData.name}>
                  {vsData.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField style={{marginBottom: '20px', width: '400px'}} required label="Number of inspectors" type="text" inputProps={{min: 0, step: 1, pattern: '[0-9]*',}} value={inspectorCount} onChange={event => {
              const ic = event.target.value
              if (/^\d*$/.test(ic)) { // regex to allow only whole numbers
                setInspectorCount(ic)
              }
            }}
            />
            <TextField style={{marginBottom: '20px', width: '400px'}} label="Notes (optional)" onChange={event => setNotes(event.target.value)}/>
          </Stack>
          <Button onClick={addReport}>Submit report</Button>
      </Box>
        )}
        <Box sx = {style}>
          <h3 className='newReportH3'>View the results of the 5 most recent reports for a station or vehicle</h3>
          <Stack spacing={2}>
            <TextField
              style={{marginBottom: '20px', width: '400px'}}
              select
              label = 'Select a vehicle or station'
              variant = 'outlined'
              required
              value = {vehicleStationNameToSearch}
              onChange = {(event) => {
                //first set the name 
                setVehicleStationNameToSearch(event.target.value)
              }}
            >
              {vehicleStationData.map((vsData) => (
                <MenuItem key={vsData.name} value={vsData.name}>
                  {vsData.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <p style={{color: getStatusColor()}}>{getStatusText()}</p>
          <p id = 'results'>Of the 5 most recent votes from today, the average amount of reported inspectors for {vehicleStationNameToSearch} is: {searchResults}</p>
          <Button onClick={viewReports}>View reports</Button>
      </Box>
      </Grid>
    </div>
  );
};

export default Map;