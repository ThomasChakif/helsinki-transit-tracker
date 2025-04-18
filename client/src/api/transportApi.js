// Group all fetch functions in this file
export const fetchStations = async (type) => {
    try {
      const response = await fetch(`../public/cleaned-${type.toLowerCase()}-stops.json`);
      if (!response.ok) {
        throw new Error(`Error fetching ${type} station data`);
      }
      const data = await response.json();
      return data.map(station => ({
        id: station.id,
        name: station.name,
        position: [station.lat, station.lon],
        mode: `${station.mode}_stop`
      }));
    } catch (error) {
      console.log(`Error fetching ${type} station data:`, error);
      return [];
    }
  };
  
  // Export specific helpers for each transport type
  export const fetchTrainStations = () => fetchStations('train');
  export const fetchMetroStations = () => fetchStations('metro');
  export const fetchTramStations = () => fetchStations('tram');
  export const fetchLightRailStations = () => fetchStations('lightrail');
  
  // Similar approach for route fetching functions...
// Route fetching functions in transportApi.js
export const fetchTrainRoutes = async () => {
    try {
      const [trainRoute1Response, trainRoute2Response, trainRoute3Response] = await Promise.all([
        fetch('../train_patterns/train-H-U-1.json'),
        fetch('../train_patterns/train-I-U-1.json'),
        fetch('../train_patterns/train-K-U-1.json')
      ]);
      
      if (!trainRoute1Response.ok || !trainRoute2Response.ok || !trainRoute3Response.ok) {
        throw new Error("Error fetching train route data");
      }
      
      const trainRoute1Data = await trainRoute1Response.json();
      const trainRoute2Data = await trainRoute2Response.json();
      const trainRoute3Data = await trainRoute3Response.json();
  
      // Combine route arrays
      return [...trainRoute1Data, ...trainRoute2Data, ...trainRoute3Data];
    } catch (error) {
      console.log("Error fetching train route data:", error);
      return [];
    }
  };
  
  export const fetchMetroRoutes = async () => {
    try {
      const [metroRoute1Response, metroRoute2Response] = await Promise.all([
        fetch('../individual/metro-route-1-kiv-vuo.json'),
        fetch('../individual/metro-route-2-itis-mell.json')
      ]);
      
      if (!metroRoute1Response.ok || !metroRoute2Response.ok) {
        throw new Error("Error fetching metro route data");
      }
      
      const metroRoute1Data = await metroRoute1Response.json();
      const metroRoute2Data = await metroRoute2Response.json();
  
      // Combine route arrays
      return [...metroRoute1Data, ...metroRoute2Data];
    } catch (error) {
      console.log("Error fetching metro route data:", error);
      return [];
    }
  };
  
  export const fetchTramRoutes = async () => {
    try {
      const tramFiles = [
        "tram-1.json", "tram-10.json", "tram-10H.json", "tram-13.json",
        "tram-13H.json", "tram-1H.json", "tram-1T.json",
        "tram-2.json", "tram-2H.json", "tram-3.json", "tram-3H.json",
        "tram-3N.json", "tram-4.json", "tram-4H.json", "tram-6B.json",
        "tram-6H.json", "tram-6T.json", "tram-7B.json", "tram-7H.json",
        "tram-7T.json", "tram-8.json", "tram-8H.json", "tram-8T.json",
        "tram-9B.json", "tram-9H.json", "tram-9N.json", "tram-9T.json"
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
  
  export const fetchLightRailRoutes = async () => {
    try {
      const lightRailRouteResponse = await fetch('../lightrail_patterns/lightrail-route.json');
      if (!lightRailRouteResponse.ok) {
        throw new Error("Error fetching light rail route data");
      }
      const lightRailRouteData = await lightRailRouteResponse.json();
      return lightRailRouteData;
    } catch (error) {
      console.log("Error fetching light rail route data:", error);
      return [];
    }
  };
