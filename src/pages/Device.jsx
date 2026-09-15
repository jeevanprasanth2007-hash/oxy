import {
  useEffect,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Cpu,
  Wifi,
  WifiOff,
  Thermometer,
  Wind,
  Droplets,
  Activity,
  ShieldCheck,
  Server,
  RefreshCw,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { useSensorData } from "../hooks/useSensorData";

const DEVICE_ID =
  "93fb0b11-ea9a-4692-a186-1c388cdf3317";


function Device() {

  const [device, setDevice] =
    useState(null);

  const [deviceLoading, setDeviceLoading] =
    useState(true);

  const {
    reading,
    realtimeConnected,
    deviceOnline,
    loading,
  } = useSensorData();


  // =====================================================
  // FETCH DEVICE INFORMATION
  // =====================================================

  useEffect(() => {

    const fetchDevice = async () => {

      const {
        data,
        error,
      } = await supabase

        .from("devices")

        .select("*")

        .eq(
          "id",
          DEVICE_ID
        )

        .maybeSingle();


      if (error) {

        console.error(
          "Device error:",
          error
        );

      }


      setDevice(data);

      setDeviceLoading(false);

    };


    fetchDevice();

  }, []);


  // =====================================================
  // LOADING
  // =====================================================

  if (
    loading ||
    deviceLoading
  ) {

    return (
      <main className="device-page">

        <div className="device-loading">

          <RefreshCw
            size={40}
            className="spin"
          />

          <h2>
            Connecting Device
          </h2>

          <p>
            Loading OxyGuard device
            information...
          </p>

        </div>

      </main>
    );

  }


  // =====================================================
  // SENSOR VALUES
  // =====================================================

  const temperature =
    Number(
      reading?.temperature ?? 0
    );


  const humidity =
    Number(
      reading?.humidity ?? 0
    );


  const gas =
    Number(
      reading?.gas ?? 0
    );


  const health =
    Number(
      reading?.health ?? 0
    );


  const status =
    reading?.status ||
    "NORMAL";


  // =====================================================
  // LAST SEEN
  // =====================================================

  const lastSeen =
    reading?.created_at

      ? new Date(
          reading.created_at
        ).toLocaleString()

      : "No data";


  // =====================================================
  // SENSOR STATUS
  // =====================================================

  const sensorStatus =
    deviceOnline
      ? "Operational"
      : "Offline";


  // =====================================================
  // SYSTEM STATUS CLASS
  // =====================================================

  const statusClass =
    status === "LEAK"
      ? "red"
      : status === "WARNING"
      ? "yellow"
      : "green";


  return (
    <main className="device-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <section className="device-header">

        <div>

          <div className="dashboard-eyebrow">

            <span
              className={
                deviceOnline
                  ? "live-dot"
                  : "offline-dot"
              }
            />

            DEVICE MANAGEMENT

          </div>


          <h1>
            OxyGuard <span>Device</span>
          </h1>


          <p>
            Monitor device connectivity,
            hardware health and live sensors.
          </p>

        </div>


        {/* DEVICE CONNECTION */}

        <div
          className={`device-connection ${
            deviceOnline
              ? "connected"
              : "disconnected"
          }`}
        >

          {deviceOnline ? (
            <Wifi size={18} />
          ) : (
            <WifiOff size={18} />
          )}


          <span>
            {deviceOnline
              ? "DEVICE LIVE"
              : "DEVICE OFFLINE"}
          </span>

        </div>

      </section>



      {/* =================================================
          DEVICE HERO
      ================================================= */}

      <section className="device-hero">


        <div className="device-visual">

          <div
            className="device-orbit orbit-one"
          />

          <div
            className="device-orbit orbit-two"
          />


          <motion.div
            className={`device-core ${
              deviceOnline
                ? ""
                : "offline"
            }`}
            animate={
              deviceOnline
                ? {
                    scale: [
                      1,
                      1.04,
                      1,
                    ],
                  }
                : {
                    scale: 1,
                  }
            }
            transition={{
              repeat: deviceOnline
                ? Infinity
                : 0,
              duration: 2.5,
            }}
          >

            <Cpu size={48} />

          </motion.div>


          <span
            className={`device-pulse ${
              deviceOnline
                ? "active"
                : "inactive"
            }`}
          />

        </div>



        <div className="device-hero-info">

          <div className="device-label">
            {deviceOnline
              ? "ACTIVE DEVICE"
              : "DEVICE OFFLINE"}
          </div>


          <h2>
            {device?.device_name ||
              "OxyGuard Prototype"}
          </h2>


          <p>
            {device?.device_code ||
              "OXY-001"}
          </p>


          <div className="device-status-row">

            <span
              className={`status-dot ${
                statusClass
              }`}
            />


            <strong>
              {status}
            </strong>


            <span className="status-divider">
              •
            </span>


            <span>

              {deviceOnline
                ? "Live telemetry active"
                : "Waiting for device"}

            </span>

          </div>

        </div>

      </section>



      {/* =================================================
          INFO
      ================================================= */}

      <section className="device-grid">


        {/* DEVICE IDENTITY */}

        <InfoCard
          icon={<Server />}
          title="Device Identity"
        >

          <InfoRow
            label="Device Code"
            value={
              device?.device_code ||
              "OXY-001"
            }
          />


          <InfoRow
            label="Device ID"
            value={DEVICE_ID}
          />


          <InfoRow
            label="Firmware"
            value={
              device?.firmware_version ||
              "v1.0.0"
            }
          />

        </InfoCard>



        {/* CONNECTIVITY */}

        <InfoCard
          icon={
            deviceOnline
              ? <Wifi />
              : <WifiOff />
          }
          title="Connectivity"
        >

          <InfoRow
            label="ESP32 Device"
            value={
              deviceOnline
                ? "Online"
                : "Offline"
            }
            status={
              deviceOnline
            }
          />


          <InfoRow
            label="Realtime Cloud"
            value={
              realtimeConnected
                ? "Connected"
                : "Disconnected"
            }
            status={
              realtimeConnected
            }
          />


          <InfoRow
            label="Last Data"
            value={lastSeen}
          />

        </InfoCard>

      </section>



      {/* =================================================
          SENSOR HEALTH
      ================================================= */}

      <section className="device-section-title">

        <div>

          <div className="dashboard-eyebrow">
            HARDWARE TELEMETRY
          </div>


          <h2>
            Sensor Health
          </h2>

        </div>

      </section>



      <section className="device-sensors">


        <SensorHealth
          icon={<Thermometer />}
          name="DHT11 Temperature"
          value={
            deviceOnline
              ? `${temperature.toFixed(1)}°C`
              : "--"
          }
          status={
            sensorStatus
          }
          active={
            deviceOnline
          }
        />


        <SensorHealth
          icon={<Droplets />}
          name="DHT11 Humidity"
          value={
            deviceOnline
              ? `${humidity.toFixed(1)}%`
              : "--"
          }
          status={
            sensorStatus
          }
          active={
            deviceOnline
          }
        />


        <SensorHealth
          icon={<Wind />}
          name="MQ-135 Gas Sensor"
          value={
            deviceOnline
              ? `${gas.toFixed(1)}%`
              : "--"
          }
          status={
            sensorStatus
          }
          active={
            deviceOnline
          }
        />


        <SensorHealth
          icon={<Activity />}
          name="System Health"
          value={
            deviceOnline
              ? `${health.toFixed(0)}%`
              : "--"
          }
          status={
            !deviceOnline
              ? "Offline"
              : health >= 80
              ? "Excellent"
              : health >= 50
              ? "Warning"
              : "Critical"
          }
          active={
            deviceOnline
          }
        />

      </section>



      {/* =================================================
          DIAGNOSTICS
      ================================================= */}

      <section className="diagnostic-panel">


        <div className="diagnostic-heading">

          <div className="diagnostic-icon">

            <ShieldCheck
              size={23}
            />

          </div>


          <div>

            <h3>
              System Diagnostics
            </h3>


            <p>
              OxyGuard hardware status
            </p>

          </div>

        </div>



        <div className="diagnostic-grid">


          <Diagnostic
            name="ESP32 Controller"
            value={
              deviceOnline
                ? "Operational"
                : "Offline"
            }
            active={
              deviceOnline
            }
          />


          <Diagnostic
            name="DHT11 Sensor"
            value={
              deviceOnline
                ? "Operational"
                : "Offline"
            }
            active={
              deviceOnline
            }
          />


          <Diagnostic
            name="MQ-135 Sensor"
            value={
              deviceOnline
                ? "Operational"
                : "Offline"
            }
            active={
              deviceOnline
            }
          />


          <Diagnostic
            name="OLED Display"
            value={
              deviceOnline
                ? "Operational"
                : "Offline"
            }
            active={
              deviceOnline
            }
          />


          <Diagnostic
            name="Traffic LEDs"
            value={
              deviceOnline
                ? "Operational"
                : "Offline"
            }
            active={
              deviceOnline
            }
          />


          <Diagnostic
            name="Safety Buzzer"
            value={
              !deviceOnline
                ? "Offline"
                : status === "LEAK"
                ? "ACTIVE"
                : "Standby"
            }
            active={
              deviceOnline
            }
          />

        </div>

      </section>

    </main>
  );
}



/* =====================================================
   INFO CARD
===================================================== */

function InfoCard({
  icon,
  title,
  children,
}) {

  return (

    <motion.div
      className="device-info-card"
      whileHover={{
        y: -4,
      }}
    >

      <div className="device-card-title">

        <div>
          {icon}
        </div>


        <h3>
          {title}
        </h3>

      </div>


      {children}

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

    <div className="device-info-row">

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



/* =====================================================
   SENSOR HEALTH
===================================================== */

function SensorHealth({
  icon,
  name,
  value,
  status,
  active,
}) {

  return (

    <motion.div
      className={`sensor-health-card ${
        active
          ? ""
          : "sensor-health-offline"
      }`}
      whileHover={{
        y: -5,
      }}
    >

      <div className="sensor-health-top">

        <div className="sensor-health-icon">
          {icon}
        </div>


        <span
          className={
            active
              ? "operational"
              : "operational offline"
          }
        >
          ● {status}
        </span>

      </div>


      <span className="sensor-health-name">
        {name}
      </span>


      <strong>
        {value}
      </strong>

    </motion.div>

  );

}



/* =====================================================
   DIAGNOSTIC
===================================================== */

function Diagnostic({
  name,
  value,
  active,
}) {

  return (

    <div className="diagnostic-item">

      <div className="diagnostic-status">

        <span
          className={
            active
              ? "diagnostic-dot active"
              : "diagnostic-dot"
          }
        />


        <span>
          {name}
        </span>

      </div>


      <strong
        className={
          active
            ? ""
            : "diagnostic-offline"
        }
      >
        {value}
      </strong>

    </div>

  );

}


export default Device;