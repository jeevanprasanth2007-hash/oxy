import { motion } from "framer-motion";
import {
  Activity,
  Thermometer,
  Wind,
  Wifi,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Clock,
} from "lucide-react";

import { useSensorData } from "../hooks/useSensorData";

function Dashboard() {
  const {
    reading,
    loading,
    deviceOnline,
    realtimeConnected,
  } = useSensorData();

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-loading">
          <div className="loading-ring" />

          <h2>Connecting to OxyGuard...</h2>

          <p>
            Checking live sensor data from your ESP32
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // NO DATA
  // =====================================================

  if (!reading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-empty">
          <Activity size={48} />

          <h2>No sensor data yet</h2>

          <p>
            Waiting for your ESP32 to send the first
            reading.
          </p>

          <div className="dashboard-offline-message">
            <span className="offline-dot" />
            DEVICE OFFLINE
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // SENSOR VALUES
  // =====================================================

  const temperature = Number(
    reading.temperature ?? 0
  );

  const humidity = Number(
    reading.humidity ?? 0
  );

  const gas = Number(
    reading.gas ?? 0
  );

  const health = Number(
    reading.health ?? 0
  );

  const status =
    reading.status || "NORMAL";

  // =====================================================
  // LAST UPDATE
  // =====================================================

  const lastUpdate = reading.created_at
    ? new Date(reading.created_at)
    : null;

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const statusClass =
    status === "LEAK"
      ? "critical"
      : status === "WARNING"
      ? "warning"
      : "normal";

  return (
    <main className="dashboard-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="dashboard-header">

        <div>
          <div className="dashboard-eyebrow">

            <span
              className={`live-dot ${
                deviceOnline ? "" : "offline"
              }`}
            />

            {deviceOnline
              ? "OXYGUARD LIVE MONITORING"
              : "OXYGUARD DEVICE OFFLINE"}

          </div>

          <h1>
            Command <span>Center</span>
          </h1>

          <p>
            Real-time environmental monitoring
            powered by ESP32 + Supabase.
          </p>
        </div>

        {/* CONNECTION INDICATOR */}

        <div
          className={`connection-indicator ${
            deviceOnline
              ? "device-online"
              : "device-offline"
          }`}
        >

          <Wifi size={18} />

          <span>
            {deviceOnline
              ? "DEVICE LIVE"
              : "DEVICE OFFLINE"}
          </span>

        </div>

      </section>

      {/* =================================================
          DEVICE CONNECTION BANNER
      ================================================= */}

      <motion.section
        className={`device-connection-banner ${
          deviceOnline
            ? "online"
            : "offline"
        }`}
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >

        <div className="device-connection-icon">

          <span
            className={`connection-pulse ${
              deviceOnline
                ? "active"
                : ""
            }`}
          />

          <Wifi size={20} />

        </div>

        <div className="device-connection-text">

          <strong>
            {deviceOnline
              ? "ESP32 DEVICE CONNECTED"
              : "ESP32 DEVICE OFFLINE"}
          </strong>

          <span>
            {deviceOnline
              ? "Receiving fresh sensor readings"
              : "No recent sensor readings received"}
          </span>

        </div>

        <div className="device-connection-state">

          {deviceOnline
            ? "ONLINE"
            : "OFFLINE"}

        </div>

      </motion.section>

      {/* =================================================
          SYSTEM STATUS
      ================================================= */}

      <motion.section
        className={`system-status ${statusClass}`}
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >

        <div className="status-icon">

          {status === "NORMAL" ? (
            <ShieldCheck size={32} />
          ) : (
            <AlertTriangle size={32} />
          )}

        </div>

        <div className="status-text">

          <span>
            SYSTEM STATUS
          </span>

          <strong>
            {status}
          </strong>

        </div>

        <div className="health-score">

          <span>
            Health Score
          </span>

          <strong>
            {health.toFixed(0)}%
          </strong>

        </div>

      </motion.section>

      {/* =================================================
          SENSOR CARDS
      ================================================= */}

      <section className="sensor-grid">

        <SensorCard
          icon={<Thermometer />}
          title="Temperature"
          value={temperature.toFixed(1)}
          unit="°C"
          description="DHT11"
          online={deviceOnline}
        />

        <SensorCard
          icon={<Activity />}
          title="Humidity"
          value={humidity.toFixed(1)}
          unit="%"
          description="DHT11"
          online={deviceOnline}
        />

        <SensorCard
          icon={<Wind />}
          title="Gas Level"
          value={gas.toFixed(1)}
          unit="%"
          description="MQ-135"
          online={deviceOnline}
        />

        <SensorCard
          icon={<Zap />}
          title="Health"
          value={health.toFixed(0)}
          unit="%"
          description="System score"
          online={deviceOnline}
        />

      </section>

      {/* =================================================
          LOWER PANELS
      ================================================= */}

      <section className="dashboard-lower">

        {/* LIVE SENSOR FEED */}

        <motion.div
          className="glass-panel"
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >

          <div className="panel-title">

            <Activity size={20} />

            <h3>
              Live Sensor Feed
            </h3>

            <span
              className={`panel-live-indicator ${
                deviceOnline
                  ? "online"
                  : "offline"
              }`}
            >
              {deviceOnline
                ? "LIVE"
                : "OFFLINE"}
            </span>

          </div>

          <div className="live-value">

            <div
              className={`pulse-ring ${
                deviceOnline
                  ? "active"
                  : "inactive"
              }`}
            >
              <Activity size={34} />
            </div>

            <div>

              <strong>
                {gas.toFixed(1)}%
              </strong>

              <span>
                Current Gas Level
              </span>

            </div>

          </div>

        </motion.div>

        {/* DEVICE PANEL */}

        <motion.div
          className="glass-panel"
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.15,
          }}
        >

          <div className="panel-title">

            <Wifi size={20} />

            <h3>
              Device
            </h3>

          </div>

          <div className="device-info">

            <InfoRow
              label="Device"
              value="OXY-001"
            />

            <InfoRow
              label="Connection"
              value={
                deviceOnline
                  ? "ESP32 Online"
                  : "Offline"
              }
              status={deviceOnline}
            />

            <InfoRow
              label="Realtime"
              value={
                realtimeConnected
                  ? "Cloud Connected"
                  : "Disconnected"
              }
              status={realtimeConnected}
            />

            <InfoRow
              label="Last Update"
              value={
                lastUpdate
                  ? lastUpdate.toLocaleTimeString()
                  : "--"
              }
            />

            <InfoRow
              label="Firmware"
              value="v1.0.0"
            />

          </div>

        </motion.div>

      </section>

      {/* =================================================
          LAST READING
      ================================================= */}

      <section className="dashboard-last-update">

        <Clock size={15} />

        <span>
          Last sensor update:
        </span>

        <strong>
          {lastUpdate
            ? lastUpdate.toLocaleString()
            : "--"}
        </strong>

        <span
          className={`last-update-status ${
            deviceOnline
              ? "online"
              : "offline"
          }`}
        >
          {deviceOnline
            ? "● LIVE"
            : "● OFFLINE"}
        </span>

      </section>

    </main>
  );
}


/* =====================================================
   SENSOR CARD
===================================================== */

function SensorCard({
  icon,
  title,
  value,
  unit,
  description,
  online,
}) {
  return (
    <motion.div
      className={`sensor-card ${
        online ? "" : "sensor-offline"
      }`}
      whileHover={{
        y: -6,
        scale: 1.01,
      }}
    >

      <div className="sensor-card-top">

        <div className="sensor-icon">
          {icon}
        </div>

        <span
          className={`sensor-live ${
            online
              ? ""
              : "offline"
          }`}
        >
          {online
            ? "LIVE"
            : "OFFLINE"}
        </span>

      </div>

      <div className="sensor-name">
        {title}
      </div>

      <div className="sensor-value">

        {value}

        <span>
          {unit}
        </span>

      </div>

      <div className="sensor-description">
        {description}
      </div>

    </motion.div>
  );
}


/* =====================================================
   INFO ROW
===================================================== */

function InfoRow({
  label,
  value,
  status,
}) {
  return (
    <div className="info-row">

      <span>
        {label}
      </span>

      <strong
        className={
          typeof status === "boolean"
            ? status
              ? "info-online"
              : "info-offline"
            : ""
        }
      >
        {value}
      </strong>

    </div>
  );
}

export default Dashboard;