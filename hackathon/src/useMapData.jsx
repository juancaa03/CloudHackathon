import { useState, useEffect } from "react";

export default function useMapData() {
  const [userLocation, setUserLocation] = useState(null);
  const [riskZones, setRiskZones] = useState([]);
  const [radars, setRadars] = useState([]);
  const [fatality, setFatality] = useState(null);
  const [deaths, setDeaths] = useState([]);

  let riskAccidents = 0;
    riskZones.forEach((zone) => {
        riskAccidents += zone[1];
    });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => setUserLocation([position.coords.latitude, position.coords.longitude]),
      () => setUserLocation([41.1189, 1.2445]) // Ubicación por defecto si hay error
    );

    fetch("http://localhost:8000/percentFatality")
      .then((res) => res.json())
      .then(setFatality)
      .catch(console.error);

    fetch("http://localhost:8000/deathCount")
      .then((res) => res.json())
      .then(setDeaths)
      .catch(console.error);

    fetch("http://localhost:8000/hotZones")
      .then((res) => res.json())
      .then(setRiskZones)
      .catch(console.error);

    fetch("http://localhost:8000/radarList")
      .then((res) => res.json())
      .then(setRadars)
      .catch(console.error);
  }, []);

  return { userLocation, riskZones, radars, fatality, deaths, riskAccidents };
}
