import { useEffect, useState } from 'react';
import './App.css';

type Reading = {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed: number;
  engineTemperature: number;
  fuelLevel: number;
  alert?: string;
};

const API_URL = 'http://localhost:3000/telemetry';

function App() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(API_URL);
        const data: Reading[] = await res.json();
        setReadings(data);
        setOnline(true);
        setLastUpdate(new Date());
      } catch {
        setOnline(false);
      }
    }

    load();
    const id = setInterval(load, 1000);
    return () => clearInterval(id);
  }, []);

  // Keep only the newest reading for each vehicle
  const latest = new Map<string, Reading>();
  for (const r of readings) latest.set(r.vehicleId, r);
  const vehicles = Array.from(latest.values()).sort((a, b) =>
    a.vehicleId.localeCompare(b.vehicleId),
  );

  const alertCount = vehicles.filter(
    (v) => (v.alert ?? 'NORMAL') !== 'NORMAL',
  ).length;

  return (
    <div className="page">
      <header className="header">
        <h1>Fleet Telemetry</h1>
           </header>

      <section className="cards">
        <div className="card">
          <div className="label">Vehicles</div>
          <div className="value">{vehicles.length}</div>
        </div>
        <div className="card">
          <div className="label">Active alerts</div>
          <div className="value">{alertCount}</div>
        </div>
        <div className="card">
          <div className="label">Readings stored</div>
          <div className="value">{readings.length}</div>
        </div>
        <div className="card">
          <div className="label">Last update</div>
          <div className="value small">
            {lastUpdate ? lastUpdate.toLocaleTimeString() : '-'}
          </div>
        </div>
      </section>

      <table>
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Speed</th>
            <th>Temp</th>
            <th>Fuel</th>
            <th>Location</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => {
            const status = v.alert ?? 'NORMAL';
            return (
              <tr key={v.vehicleId}>
                <td>{v.vehicleId}</td>
                <td>{v.speed.toFixed(1)} km/h</td>
                <td>{v.engineTemperature.toFixed(1)} °C</td>
                <td>{v.fuelLevel.toFixed(1)} %</td>
                <td>
                  {v.latitude.toFixed(4)}, {v.longitude.toFixed(4)}
                </td>
                <td>
                  <span className={status === 'NORMAL' ? 'pill ok' : 'pill bad'}>
                    {status}
                  </span>
                </td>
              </tr>
            );
          })}
          {vehicles.length === 0 && (
            <tr>
              <td colSpan={6}>Waiting for data...</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;