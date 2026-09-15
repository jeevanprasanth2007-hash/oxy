import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import {
  Activity,
  ArrowRight,
  Cpu,
  Database,
  Droplets,
  Gauge,
  ShieldCheck,
  Thermometer,
  Wifi,
  WifiOff,
  Wind,
  Radio,
  Zap,
  Volume2,
  VolumeX,
  Siren,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useSensorData } from "../hooks/useSensorData";

export default function Home() {
  const navigate = useNavigate();

  const {
    reading,
    deviceOnline,
    realtimeConnected,
  } = useSensorData();

  // =====================================================
  // ALERT SOUND STATE
  // =====================================================

  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef(null);

  // =====================================================
  // SENSOR VALUES
  // IMPORTANT:
  // Do NOT show old Supabase values when hardware is offline.
  // =====================================================

  const temperature =
    deviceOnline && reading?.temperature != null
      ? Number(reading.temperature).toFixed(1)
      : "--";

  const humidity =
    deviceOnline && reading?.humidity != null
      ? Number(reading.humidity).toFixed(1)
      : "--";

  const gas =
    deviceOnline && reading?.gas != null
      ? Number(reading.gas).toFixed(1)
      : "--";

  const health =
    deviceOnline && reading?.health != null
      ? Number(reading.health).toFixed(0)
      : "--";

  // =====================================================
  // STATUS
  // =====================================================

  const status =
    deviceOnline && reading?.status
      ? String(reading.status).toUpperCase()
      : "WAITING";

  // =====================================================
  // LAST SEEN
  // =====================================================

  const lastSeen =
    deviceOnline && reading?.created_at
      ? new Date(reading.created_at)
      : null;

  const lastSeenText = lastSeen
    ? lastSeen.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "No data";

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const statusClass =
    !deviceOnline
      ? "offline"
      : status === "LEAK"
      ? "danger"
      : status === "WARNING"
      ? "warning"
      : "safe";

  // =====================================================
  // ALERT CONDITIONS
  // =====================================================

  const alertActive =
    deviceOnline &&
    (status === "WARNING" || status === "LEAK");

  const isLeak =
    deviceOnline && status === "LEAK";

  const isWarning =
    deviceOnline && status === "WARNING";

  // =====================================================
  // AMBULANCE REMIX AUDIO
  //
  // ONLY AUDIO USED BY OXYGUARD
  //
  // File:
  // public/sounds/ambulance_remix.mp3
  // =====================================================

  useEffect(() => {
    const audio = new Audio(
      "/sounds/ambulance_remix.mp3"
    );

    audio.loop = true;
    audio.volume = 1.0;
    audio.preload = "auto";

    audioRef.current = audio;

    console.log(
      "🚑 OxyGuard ambulance_remix.mp3 loaded"
    );

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";

      audioRef.current = null;
    };
  }, []);

  // =====================================================
  // AUTOMATIC AMBULANCE REMIX ALERT
  //
  // WARNING / LEAK  -> PLAY
  // NORMAL          -> STOP
  // OFFLINE         -> STOP
  // =====================================================

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    const shouldPlay =
      soundEnabled &&
      deviceOnline &&
      (status === "WARNING" || status === "LEAK");

    if (shouldPlay) {
      // Start from beginning whenever a new alert starts.
      audio.currentTime = 0;

      audio
        .play()
        .then(() => {
          console.log(
            "🚨🚑 ambulance_remix.mp3 PLAYING"
          );
        })
        .catch((error) => {
          console.error(
            "❌ Ambulance remix could not play:",
            error
          );
        });
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [
    soundEnabled,
    deviceOnline,
    status,
  ]);

  // =====================================================
  // ENABLE ALERT SOUND
  //
  // Browser requires a user interaction once
  // before allowing future automatic audio playback.
  // =====================================================

  const enableAlertSound = async () => {
    const audio = audioRef.current;

    if (!audio) {
      console.error(
        "❌ Ambulance audio element not available"
      );
      return;
    }

    try {
      /*
       * User clicked this button.
       * This unlocks audio playback for the page.
       */
      await audio.play();

      /*
       * If there is currently no alert,
       * immediately stop the preview.
       *
       * We only use this play() to satisfy
       * browser media permission.
       */
      if (
        !deviceOnline ||
        (status !== "WARNING" &&
          status !== "LEAK")
      ) {
        audio.pause();
        audio.currentTime = 0;
      }

      setSoundEnabled(true);

      console.log(
        "🔊 OxyGuard ambulance alert sound ENABLED"
      );
    } catch (error) {
      console.error(
        "❌ Ambulance remix audio error:",
        error
      );

      setSoundEnabled(false);
    }
  };

  // =====================================================
  // DISABLE ALERT SOUND
  // =====================================================

  const disableAlertSound = () => {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    setSoundEnabled(false);

    console.log(
      "🔇 OxyGuard ambulance alert sound DISABLED"
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="oxy-home">

      {/* =================================================
          ALERT SOUND BUTTON
      ================================================= */}

      <div
        style={{
          position: "fixed",
          right: "24px",
          bottom: "24px",
          zIndex: 9999,
        }}
      >
        {!soundEnabled ? (
          <button
            onClick={enableAlertSound}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              padding: "13px 18px",
              borderRadius: "12px",
              border:
                "1px solid rgba(255,255,255,0.15)",
              background:
                "rgba(15,23,42,0.92)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "12px",
              letterSpacing: "0.04em",
              backdropFilter: "blur(12px)",
              boxShadow:
                "0 10px 35px rgba(0,0,0,0.25)",
            }}
          >
            <VolumeX size={17} />

            ENABLE ALERT SOUND
          </button>
        ) : (
          <button
            onClick={disableAlertSound}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              padding: "13px 18px",
              borderRadius: "12px",
              border: alertActive
                ? "1px solid rgba(239,68,68,0.5)"
                : "1px solid rgba(255,255,255,0.15)",
              background: alertActive
                ? "rgba(127,29,29,0.95)"
                : "rgba(15,23,42,0.92)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "12px",
              letterSpacing: "0.04em",
              backdropFilter: "blur(12px)",
              boxShadow:
                "0 10px 35px rgba(0,0,0,0.25)",
            }}
          >
            {alertActive ? (
              <Siren
                size={17}
                className="oxy-siren-icon"
              />
            ) : (
              <Volume2 size={17} />
            )}

            {alertActive
              ? "ALERT SOUND ACTIVE"
              : "ALERT SOUND ON"}
          </button>
        )}
      </div>

      {/* =================================================
          EMERGENCY ALERT BANNER
      ================================================= */}

      {alertActive && (
        <motion.div
          initial={{
            opacity: 0,
            y: -30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="oxy-alert-banner"
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9998,
            width: "min(92%, 760px)",
            padding: "16px 20px",
            borderRadius: "16px",
            border:
              "1px solid rgba(239,68,68,0.55)",
            background:
              "rgba(80, 10, 10, 0.94)",
            color: "#fff",
            backdropFilter: "blur(16px)",
            boxShadow:
              "0 15px 60px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
              }}
            >
              {/* VISUAL ICON ONLY - NOT AN AUDIO SIREN */}
              <Siren size={30} />
            </motion.div>

            <div>
              <strong
                style={{
                  display: "block",
                  fontSize: "16px",
                  letterSpacing: "0.06em",
                }}
              >
                {isLeak
                  ? "GAS LEAK DETECTED"
                  : "ENVIRONMENTAL WARNING"}
              </strong>

              <span
                style={{
                  display: "block",
                  marginTop: "4px",
                  fontSize: "12px",
                  opacity: 0.85,
                }}
              >
                OxyGuard detected a{" "}
                {isLeak
                  ? "critical gas condition"
                  : "potentially unsafe environmental condition"}
                .

                {soundEnabled
                  ? " Ambulance alert is active."
                  : " Enable alert sound for audible warning."}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* =================================================
          HERO
      ================================================= */}

      <section className="oxy-hero">

        <div className="hero-grid" />

        <div className="hero-glow hero-glow-one" />

        <div className="hero-glow hero-glow-two" />

        {/* LEFT */}

        <motion.div
          className="hero-content"
          initial={{
            opacity: 0,
            x: -40,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.8,
          }}
        >
          <div
            className={`hero-system-status ${statusClass}`}
          >
            <span className="status-light" />

            {deviceOnline
              ? "OXYGUARD SYSTEM ONLINE"
              : "OXYGUARD SYSTEM OFFLINE"}
          </div>

          <h1>
            Intelligent
            <br />

            <span>
              Environmental
            </span>

            <br />

            Protection.
          </h1>

          <p className="hero-description">
            OxyGuard transforms real-time sensor
            data into an intelligent environmental
            safety monitoring system.
          </p>

          <div className="hero-buttons">

            <button
              className="hero-primary"
              onClick={() =>
                navigate("/dashboard")
              }
              disabled={!deviceOnline}
            >
              <Activity size={18} />

              {deviceOnline
                ? "OPEN LIVE DASHBOARD"
                : "DEVICE OFFLINE"}

              <ArrowRight size={17} />
            </button>

            <button
              className="hero-secondary"
              onClick={() =>
                navigate("/device")
              }
            >
              DEVICE DETAILS
            </button>

          </div>

          <div className="hero-trust">

            <span>
              <ShieldCheck size={16} />
              ESP32 Powered
            </span>

            <span>
              <Database size={16} />
              Supabase Cloud
            </span>

            <span>
              <Radio size={16} />
              Realtime Data
            </span>

          </div>

        </motion.div>

        {/* RIGHT SYSTEM CORE */}

        <motion.div
          className="hero-core-wrapper"
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 1,
            delay: 0.2,
          }}
        >

          <div className="core-orbit orbit-a" />

          <div className="core-orbit orbit-b" />

          <div className="core-orbit orbit-c" />

          <motion.div
            className={`core-container ${statusClass}`}
            animate={{
              scale: [1, 1.035, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >
            <div className="core-inner">

              <ShieldCheck size={58} />

              <strong>
                OXY
              </strong>

              <span>
                GUARD
              </span>

            </div>
          </motion.div>

          {/* FLOATING DATA */}

          <FloatingData
            className="float-temp"
            icon={
              <Thermometer size={17} />
            }
            label="TEMPERATURE"
            value={
              temperature === "--"
                ? "--"
                : `${temperature}°C`
            }
            active={deviceOnline}
          />

          <FloatingData
            className="float-gas"
            icon={
              <Wind size={17} />
            }
            label="GAS LEVEL"
            value={
              gas === "--"
                ? "--"
                : `${gas}%`
            }
            active={deviceOnline}
          />

          <FloatingData
            className="float-health"
            icon={
              <Gauge size={17} />
            }
            label="SYSTEM HEALTH"
            value={
              health === "--"
                ? "--"
                : `${health}%`
            }
            active={deviceOnline}
          />

        </motion.div>

      </section>

      {/* =================================================
          REAL DEVICE STATUS
      ================================================= */}

      <section className="home-device-status">

        <div className="device-status-left">

          <div
            className={`device-status-icon ${
              deviceOnline
                ? "online"
                : "offline"
            }`}
          >
            {deviceOnline ? (
              <Wifi size={21} />
            ) : (
              <WifiOff size={21} />
            )}
          </div>

          <div>
            <span>
              PHYSICAL DEVICE
            </span>

            <strong>
              {deviceOnline
                ? "OXY-001 CONNECTED"
                : "OXY-001 OFFLINE"}
            </strong>
          </div>

        </div>

        <div className="device-status-right">

          <StatusItem
            label="DEVICE"
            value={
              deviceOnline
                ? "ONLINE"
                : "OFFLINE"
            }
            active={deviceOnline}
          />

          <StatusItem
            label="DATA"
            value={
              deviceOnline
                ? "RECEIVING"
                : "NO RECENT DATA"
            }
            active={deviceOnline}
          />

          <StatusItem
            label="LAST SEEN"
            value={lastSeenText}
            active={deviceOnline}
          />

          <StatusItem
            label="CLOUD"
            value={
              realtimeConnected
                ? "CONNECTED"
                : "DISCONNECTED"
            }
            active={realtimeConnected}
          />

        </div>

      </section>

      {/* =================================================
          LIVE METRICS
      ================================================= */}

      <section className="home-metrics">

        <SectionHeading
          eyebrow="LIVE TELEMETRY"
          title="Your environment."
          highlight="In real time."
        />

        <div className="home-metric-grid">

          <MetricCard
            icon={<Thermometer />}
            label="TEMPERATURE"
            value={temperature}
            unit="°C"
            active={deviceOnline}
          />

          <MetricCard
            icon={<Droplets />}
            label="HUMIDITY"
            value={humidity}
            unit="%"
            active={deviceOnline}
          />

          <MetricCard
            icon={<Wind />}
            label="GAS LEVEL"
            value={gas}
            unit="%"
            active={deviceOnline}
          />

          <MetricCard
            icon={<ShieldCheck />}
            label="SYSTEM HEALTH"
            value={health}
            unit="%"
            active={deviceOnline}
          />

        </div>

      </section>

      {/* =================================================
          PLATFORM
      ================================================= */}

      <section className="home-platform">

        <SectionHeading
          eyebrow="OXYGUARD PLATFORM"
          title="One system."
          highlight="Complete awareness."
        />

        <div className="platform-grid">

          <PlatformCard
            number="01"
            icon={<Cpu />}
            title="ESP32 Intelligence"
            text="Sensor data is captured directly from the OxyGuard hardware controller."
          />

          <PlatformCard
            number="02"
            icon={<Radio />}
            title="Realtime Telemetry"
            text="Fresh sensor readings are streamed into the monitoring interface."
          />

          <PlatformCard
            number="03"
            icon={<Database />}
            title="Cloud History"
            text="Every reading is stored for historical analysis and trend monitoring."
          />

          <PlatformCard
            number="04"
            icon={<Zap />}
            title="Safety Response"
            text="Gas conditions are translated into clear NORMAL, WARNING and LEAK states."
          />

        </div>

      </section>

      {/* =================================================
          FINAL CTA
      ================================================= */}

      <section className="home-final">

        <div className="final-glow" />

        <div>

          <span>
            OXYGUARD // SAFETY INFRASTRUCTURE
          </span>

          <h2>
            Know what is happening.
            <br />

            <b>
              Before it becomes a problem.
            </b>
          </h2>

        </div>

        <button
          onClick={() =>
            navigate("/dashboard")
          }
          disabled={!deviceOnline}
        >
          {deviceOnline
            ? "ENTER COMMAND CENTER"
            : "DEVICE CURRENTLY OFFLINE"}

          {deviceOnline && (
            <ArrowRight size={18} />
          )}
        </button>

      </section>

    </main>
  );
}


// =====================================================
// FLOATING DATA
// =====================================================

function FloatingData({
  className,
  icon,
  label,
  value,
  active,
}) {
  return (
    <motion.div
      className={`floating-data ${className}`}
      animate={{
        y: [0, -9, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
      }}
    >

      <div className="floating-icon">
        {icon}
      </div>

      <div>

        <span>
          {label}
        </span>

        <strong>
          {active ? value : "--"}
        </strong>

      </div>

    </motion.div>
  );
}


// =====================================================
// METRIC CARD
// =====================================================

function MetricCard({
  icon,
  label,
  value,
  unit,
  active,
}) {
  return (
    <motion.div
      className={`home-metric-card ${
        active ? "active" : ""
      }`}
      whileHover={{
        y: -6,
      }}
    >

      <div className="metric-icon">
        {icon}
      </div>

      <span>
        {label}
      </span>

      <div className="metric-number">

        {active ? value : "--"}

        <small>
          {active ? unit : ""}
        </small>

      </div>

      <div className="metric-line">
        <span />
      </div>

    </motion.div>
  );
}


// =====================================================
// STATUS ITEM
// =====================================================

function StatusItem({
  label,
  value,
  active,
}) {
  return (
    <div className="status-item">

      <span>
        {label}
      </span>

      <strong
        className={
          active
            ? "status-active"
            : "status-inactive"
        }
      >
        {value}
      </strong>

    </div>
  );
}


// =====================================================
// PLATFORM CARD
// =====================================================

function PlatformCard({
  number,
  icon,
  title,
  text,
}) {
  return (
    <motion.div
      className="platform-card"
      whileHover={{
        y: -7,
      }}
    >

      <div className="platform-top">

        <span>
          {number}
        </span>

        <div>
          {icon}
        </div>

      </div>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

      <div className="platform-arrow">
        <ArrowRight size={17} />
      </div>

    </motion.div>
  );
}


// =====================================================
// SECTION HEADING
// =====================================================

function SectionHeading({
  eyebrow,
  title,
  highlight,
}) {
  return (
    <div className="home-section-heading">

      <span>
        {eyebrow}
      </span>

      <h2>

        {title}

        <br />

        <b>
          {highlight}
        </b>

      </h2>

    </div>
  );
}