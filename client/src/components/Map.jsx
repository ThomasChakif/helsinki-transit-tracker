import { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import {
  fetchTrainStations, fetchMetroStations, fetchTramStations, fetchLightRailStations,
  fetchTrainRoutes, fetchMetroRoutes, fetchTramRoutes, fetchLightRailRoutes
} from '../api/transportApi';
import TransportLayer from './TransportLayer';
import Controls from './Controls';
import { TextField, MenuItem, Box, Button, Stack, Grid, Modal, Typography } from '@mui/material'
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
  borderRadius: '12px',
  boxShadow: 24,
  p: 4,
  margin: '20px',
};

const style2 = {
  position: 'relative',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  borderRadius: '12px',
  boxShadow: 24,
  p: 4,
  margin: '20px',
};

const Map = () => {
  // Firebase configuration for Google OAuth2 sign in
  const firebaseConfig = {
    apiKey: "AIzaSyCnB2Dn0c3uJ78CeS9rOGLtVoFKkfIRqfM",
    authDomain: "helsinki-test-ecbb2.firebaseapp.com",
    projectId: "helsinki-test-ecbb2",
    storageBucket: "helsinki-test-ecbb2.firebasestorage.app",
    messagingSenderId: "734554427133",
    appId: "1:734554427133:web:8aa4bb4e65529957f0f894",
    measurementId: "G-2NBC6V42XP"
  };

  //the different states we have for the various stations and routes that appear on the map
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

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  //we use these states for when a user wants to enable/disable different routes on the map
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

  //for setting users
  const [user, setUser] = useState(null);
  const [showLoginButton, setShowLoginButton] = useState(true);

  //various variables for reporting or checking reports
  const [vehicleStationData, setVehicleStationData] = useState([]);
  const [vehicleStationName, setVehicleStationName] = useState("");
  const [vehicleStationNameToSearch, setVehicleStationNameToSearch] = useState("");
  const [searchResults, setSearchResults] = useState("");
  const [reportType, setReportType] = useState("");
  const [inspectorCount, setInspectorCount] = useState(0);
  const [notes, setNotes] = useState("");

  const [banModalOpen, setBanModalOpen] = useState(false);
  const [successfulReportModal, setSuccessfulReportModal] = useState(false);
  const [banReason, setBanReason] = useState("");


  //function for checking the 5 most recent reports made today for a particular vehicle or station
  const viewReports = async () => {
    if (!vehicleStationNameToSearch) { //if no vehicle/station was chosen, alert the user to pick one
      alert('Please fill out the vehicle/station name.');
      return;
    }
    // structure the reponse to send to the database
    try {
      const viewTheReports = {
        name: vehicleStationNameToSearch,
        todayDate: dayjs().format('YYYY-MM-DD'),
        tomDate: dayjs().add(1, 'day').format('YYYY-MM-DD')
      }
      //fetch the average count of 5 most recent votes made today
      const response = await fetch('http://localhost:3000/adminGetRecentVotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(viewTheReports)
      })
      const data = await response.json()
      setSearchResults(data[0]?.average ?? '0.00') //set average here
    } catch (err) {
      console.error(err)
    }
  }

  //function for adding in a new report
  const addReport = async () => {
    if (!vehicleStationName || !reportType) {
      alert('Please fill out all required fields.');
      return;
    } else if (inspectorCount >= 10) {
      alert('Inspector count must not be more than 10.');
      return;
    }

    //get the latest list of bans in case the admin bans/unbans a user mid report
    const latestBans = await fetch('http://localhost:3000/adminGetBans')
    .then(res => res.json())
    .catch(err => {
      console.error("Error fetching bans:", err);
      return [];
    });

  
    //checks if there's an instance in the table with the same banned email as the current user
    const userEmail = user.email;
    const bannedUser = latestBans.find(ban => ban.user_email.trim().toLowerCase() === userEmail.trim().toLowerCase());

    //if a user is banned, open up a modal for 3 seconds that lets them know they can't make a report
    if (bannedUser) {
      setBanReason(bannedUser.ban_notes);
      setBanModalOpen(true);
      setTimeout(() => {
        setBanModalOpen(false);
      }, 3000);
      return;
    }

    try {
      const newReport = {
        email: user.email,
        type: reportType,
        name: vehicleStationName,
        notes: notes || 'No Notes',
        count: inspectorCount,
        time: dayjs().format('YYYY-MM-DD HH:mm:ss')
      };
      await fetch('http://localhost:3000/newReport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport)
      });
      // if report is succesful, open a success modal for 3 seconds
      setSuccessfulReportModal(true);
      setTimeout(() => {
        setSuccessfulReportModal(false);
      }, 3000);
    } catch (err) {
      console.error(err);
    }
  }


  //update the color of the status based on the number of inspectors
  const getStatusColor = () => {
    const numValue = parseFloat(searchResults)
    if (numValue === 0) {
      return 'green'
    } else if (numValue > 0.0 && numValue < 2.0) {
      return '#D5B60A'
    } else if (numValue >= 2.0 && numValue < 4.0) {
      return 'orange'
    } else if (numValue >= 4.0) {
      return 'red'
    } else {
      return 'black'
    }
  }

  //update the text of the status based on the number of inspectors
  const getStatusText = () => {
    const numValue = parseFloat(searchResults)
    if (numValue === 0) {
      return 'STATUS: SAFE'
    } else if (numValue > 0.0 && numValue < 2.0) {
      return 'STATUS: LOW RISK'
    } else if (numValue >= 2.0 && numValue < 4.0) {
      return 'STATUS: CAUTION'
    } else if (numValue >= 4.0) {
      return 'STATUS: HIGH ALERT'
    } else {
      return 'STATUS: N/A'
    }
  }

  //firebase initialization
  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    auth.languageCode = 'en';

    //on a successful sign in, set the user's info and remove the log in button
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setShowLoginButton(false);
      } else {
        setUser(null);
        setShowLoginButton(true);
      }
    });

    return () => unsubscribe(); //clean up subscription
  }, []);

  //handle user signing in with Google Oauth. must be signed in to make a new report
  const handleGoogleSignIn = async () => {
    try {
      const auth = getAuth();
      await setPersistence(auth, browserSessionPersistence);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      //set user info
      const user = result.user;
      setUser(user);
      setShowLoginButton(false);
    } catch (error) {
      console.error("Error during sign-in:", error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      await signOut(auth); //signOut is a firebase function used to handle signing out with Google
      //successful sign out
      setUser(null);
      setShowLoginButton(true);
      //reset user-selections in new report menu
      setVehicleStationName("");
      setNotes("");
      setInspectorCount(0);
    } catch (error) {
      console.error(error);
      alert("Failed to sign out. Please try again.");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        //load all train, metro, tram, station data
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

        //update state with all data
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

  //togglt the handler
  const handleToggle = (layerId) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  };

  //create the controls/toggles for viewing different routes
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
    // the following div deals with the Google OAuth. If show login button is true (not signed in yet), we display the button and allow users to sign in
    // if it's false, we display the signed-in user's name and a sign out button
    <div>
      <Stack direction={'column'} spacing={2} alignItems={'center'}>
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
          style={{ height: "850px", width: "75%", borderRadius: "20px", margin: "12px" }}
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

        {/* grid for new report box and view report box */}
        <Grid container direction="row"
          sx={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* only display in new report form if a user is signed in */}
          {user && (
            <Box sx={style2}>
              <h3 className='newReportH3'>Make a new report</h3>
              <Stack spacing={2}>
                <TextField
                  style={{ marginBottom: '20px', width: '400px' }}
                  select
                  label='Select a vehicle or station'
                  variant='outlined'
                  required
                  value={vehicleStationName}
                  onChange={(event) => {
                    //first set the name 
                    const selectedPlatform = vehicleStationData.find(platform => platform.name === event.target.value)
                    setVehicleStationName(event.target.value)
                    // then use the json data to find the type (vehicle or station)
                    const rt = selectedPlatform?.type;
                    setReportType(rt)
                  }}
                >
                  {/* have a dropdown menu of all vehicle/station names */}
                  {vehicleStationData.map((vsData) => (
                    <MenuItem key={vsData.name} value={vsData.name}>
                      {vsData.name}
                    </MenuItem>
                  ))}
                </TextField>
                {/* report the number of inspectors (minimum 0, must be whole positive numbers) */}
                <TextField style={{ marginBottom: '20px', width: '400px' }} required label="Number of inspectors" type="text" value={inspectorCount} onChange={event => {
                  const ic = event.target.value
                  if (/^\d*$/.test(ic)) { // regex to allow only whole numbers
                    setInspectorCount(ic)
                  }
                }}
                />
                {/* optional notes */}
                <TextField style={{ marginBottom: '20px', width: '400px' }} label="Notes (optional)" onChange={event => setNotes(event.target.value)} />
              </Stack>
              <Button onClick={addReport}>Submit report</Button>
            </Box>
          )}
          {/* used to view reports for a station or vehicle */}
          <Box sx={style}>
            <h3 className='newReportH3'>View the results of the 5 most recent reports for a station or vehicle</h3>
            <Stack spacing={2}>
              <TextField
                style={{ marginBottom: '20px', width: '400px' }}
                select
                label='Select a vehicle or station'
                variant='outlined'
                required
                value={vehicleStationNameToSearch}
                onChange={(event) => {
                  //set the name of the vehcile or station to search
                  setVehicleStationNameToSearch(event.target.value)
                }}
              >
                {/* have a dropdown menu of all vehicle/station names */}
                {vehicleStationData.map((vsData) => (
                  <MenuItem key={vsData.name} value={vsData.name}>
                    {vsData.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            {/* update the status text and color depending on the results of the 5 most recent votes */}
            <p style={{ color: getStatusColor() }}>{getStatusText()}</p>
            <p style={{ color: 'black' }}>Of the 5 most recent votes from today, the average amount of reported inspectors is: {searchResults}</p>
            <Button onClick={viewReports}>View reports</Button>
          </Box>
        </Grid>

        {/* modal that appears for 3 seconds if a banned user tries making a new report */}
        <Modal
          open={banModalOpen}
          onClose={() => setBanModalOpen(false)}
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'white',
            color: 'red',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            textAlign: 'center'
          }}>
            <Typography sx={{ mb: 2 }}>
              🚫 You are banned from making new reports!
            </Typography>
            <Typography>
              Reason: {banReason}
            </Typography>
          </Box>
        </Modal>

        {/* modal for when a user successfully submits a report */}
        <Modal
          open={successfulReportModal}
          onClose={() => setSuccessfulReportModal(false)}
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'white',
            border: '2px solid #000',
            boxShadow: 24,
            color: 'green',
            p: 4,
            borderRadius: 2,
            textAlign: 'center'
          }}>
            <Typography>
              ✅ Report successfully submitted!
            </Typography>
          </Box>
        </Modal>
      </Stack>
    </div>
  );
};

export default Map;