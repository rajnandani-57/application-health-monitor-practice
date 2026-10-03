import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import "./App.css";

function App() {
  const [data, setData] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [selectedApp, setSelectedApp] = useState("All");

  useEffect(() => {
    const fetchHealthSummary = () => {
      fetch("http://127.0.0.1:8000/health-summary")
        .then((response) => response.json())
        .then((result) => setData(result))
        .catch((error) =>
          console.error("Health summary error:", error)
        );
    };

    const fetchCriticalIncidents = () => {
      fetch("http://127.0.0.1:8000/critical-incidents")
        .then((response) => response.json())
        .then((result) => setIncidents(result))
        .catch((error) =>
          console.error("Critical incidents error:", error)
        );
    };

    fetchHealthSummary();
    fetchCriticalIncidents();

    const interval = setInterval(() => {
      fetchHealthSummary();
      fetchCriticalIncidents();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const totalApps = data.length;

  const criticalApps = data.filter(
    (app) => app.overall_status === "Critical"
  ).length;

  const warningApps = data.filter(
    (app) => app.overall_status === "Warning"
  ).length;

  const healthyApps = data.filter(
    (app) => app.overall_status === "Healthy"
  ).length;

  const filteredIncidents =
    selectedApp === "All"
      ? incidents
      : incidents.filter(
          (incident) =>
            incident.application_name === selectedApp
        );

  return (
    <div className="dashboard">

      {/* HEADER */}
      <header className="dashboard-header">
        <div>
          <h1>Application Health Dashboard</h1>
          <p>
            Real-time monitoring of application performance
            and critical incidents
          </p>
        </div>

        <div className="live-status">
          <span className="live-dot"></span>
          Live Monitoring
        </div>
      </header>

      {/* KPI SECTION */}
      <section className="kpi-grid">

        <div className="kpi-card total-card">
          <p>Total Applications</p>
          <h2>{totalApps}</h2>
        </div>

        <div className="kpi-card critical-card">
          <p>Critical</p>
          <h2>{criticalApps}</h2>
        </div>

        <div className="kpi-card warning-card">
          <p>Warning</p>
          <h2>{warningApps}</h2>
        </div>

        <div className="kpi-card healthy-card">
          <p>Healthy</p>
          <h2>{healthyApps}</h2>
        </div>

      </section>

      {/* APPLICATION HEALTH */}
      <section className="section">

        <div className="section-title">
          <div>
            <h2>Application Health</h2>
            <p>Current status of monitored applications</p>
          </div>
        </div>

        <div className="application-grid">

          {data.map((app) => (

            <div
  key={app.application_name}
  className={`application-card ${
    app.overall_status.toLowerCase()
  }`}
  onClick={() => setSelectedApp(app.application_name)}
  style={{ cursor: "pointer" }}
>

              <div className="application-card-header">

                <h3>{app.application_name}</h3>

                <span
                  className={`status-badge ${
                    app.overall_status.toLowerCase()
                  }`}
                >
                  {app.overall_status}
                </span>

              </div>

              <div className="application-stats">

                <div>
                  <span>Critical</span>
                  <strong>{app.critical_count}</strong>
                </div>

                <div>
                  <span>Warning</span>
                  <strong>{app.warning_count}</strong>
                </div>

                <div>
                  <span>Avg Response</span>
                  <strong>
                    {app.avg_response_time.toFixed(2)} ms
                  </strong>
                </div>

              </div>

            </div>

          ))}

        </div>

      </section>
{/* RESPONSE TIME CHART */}
<section className="section">

  <div className="section-title">
    <div>
      <h2>Average Response Time</h2>
      <p>Application performance comparison</p>
    </div>
  </div>

  <div
    style={{
      background: "#ffffff",
      padding: "20px",
      borderRadius: "14px",
      boxShadow: "0 3px 12px rgba(0,0,0,0.08)"
    }}
  >
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="application_name" />

        <YAxis />

        <Tooltip />

        <Bar
          dataKey="avg_response_time"
          fill="#2563eb"
          name="Response Time (ms)"
        />
      </BarChart>
    </ResponsiveContainer>
  </div>

</section>
      {/* CRITICAL INCIDENTS */}
      <section className="section">

        <div className="section-title incidents-title">

          <div>
            <h2>Critical Incidents</h2>
            <p>
              Detected incidents requiring attention
            </p>
          </div>

          {/* FILTER */}
          <div className="filter-container">

            <label htmlFor="application-filter">
              Filter Application
            </label>
<button
  onClick={() => setSelectedApp("All")}
  style={{
    padding: "10px 14px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontWeight: "600"
  }}
>
  Show All
</button>
            <select
              id="application-filter"
              value={selectedApp}
              onChange={(e) =>
                setSelectedApp(e.target.value)
              }
            >
              <option value="All">
                All Applications
              </option>

              {data.map((app) => (
                <option
                  key={app.application_name}
                  value={app.application_name}
                >
                  {app.application_name}
                </option>
              ))}

            </select>

          </div>

        </div>

        {/* TABLE */}
        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>Application</th>
                <th>Service</th>
                <th>Error Type</th>
                <th>Recommended Action</th>
                <th>Error Rate</th>
                <th>Response Time</th>
              </tr>
            </thead>

            <tbody>

              {filteredIncidents.length > 0 ? (

                filteredIncidents.map(
                  (incident, index) => (

                    <tr key={index}>

                      <td>
                        <strong>
                          {incident.application_name}
                        </strong>
                      </td>

                      <td>
                        {incident.service_name}
                      </td>

                      <td>
                        <span className="error-badge">
                          {incident.error_type}
                        </span>
                      </td>
<td>
  {incident.error_type === "Timeout"
    ? "Check service latency/network"
    : incident.error_type === "Service Unavailable"
    ? "Check service health"
    : incident.error_type === "Database Error"
    ? "Check database connectivity"
    : "Investigate incident"}
</td>

                      <td className="error-rate">
                        {(incident.error_rate * 100).toFixed(2)}%
                      </td>

                      <td>
                        {incident.response_time} ms
                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="5"
                    className="no-incidents"
                  >
                    No critical incidents found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* FOOTER */}
      <footer>
        Data refreshes automatically every 30 seconds
      </footer>

    </div>
  );
}

export default App;