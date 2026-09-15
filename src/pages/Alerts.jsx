import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCircle2,
  ShieldAlert,
  Volume2,
  VolumeX,
  Clock,
  Activity,
  XCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const DEVICE_ID = "93fb0b11-ea9a-4692-a186-1c388cdf3317";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [acknowledged, setAcknowledged] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("oxyguard_acknowledged") || "{}");
    } catch {
      return {};
    }
  });

  const audioRef = useRef(null);

  // =====================================================
  // LOAD ALERT HISTORY
  // =====================================================

  const loadAlerts = async () => {
    const { data, error } = await supabase
      .from("sensor_readings")
      .select("*")
      .eq("device_id", DEVICE_ID)
      .in("status", ["WARNING", "LEAK"])
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Alert fetch error:", error);
      return;
    }

    setAlerts(data || []);
  };

  // =====================================================
  // ALERT SOUND
  // =====================================================

  const playAlertSound = () => {
    if (!soundEnabled) return;

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(
          "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
        );
      }

      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch (error) {
      console.error("Alert sound error:", error);
    }
  };

  // =====================================================
  // INITIAL LOAD + REALTIME
  // =====================================================

  useEffect(() => {
    loadAlerts();

    const channel = supabase
      .channel("oxyguard-alerts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sensor_readings",
          filter: `device_id=eq.${DEVICE_ID}`,
        },
        (payload) => {
          const reading = payload.new;

          if (
            reading.status === "WARNING" ||
            reading.status === "LEAK"
          ) {
            setAlerts((previous) => [reading, ...previous]);

            if (reading.status === "LEAK") {
              playAlertSound();
            }
          }
        }
      )
      .subscribe((status) => {
        console.log("Alerts realtime:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [soundEnabled]);

  // =====================================================
  // ACKNOWLEDGE
  // =====================================================

  const acknowledgeAlert = (id) => {
    const updated = {
      ...acknowledged,
      [id]: true,
    };

    setAcknowledged(updated);
    localStorage.setItem(
      "oxyguard_acknowledged",
      JSON.stringify(updated)
    );
  };

  // =====================================================
  // CLEAR ACKNOWLEDGED
  // =====================================================

  const clearAcknowledged = () => {
    setAcknowledged({});
    localStorage.removeItem("oxyguard_acknowledged");
  };

  // =====================================================
  // FILTER
  // =====================================================

  const filteredAlerts = useMemo(() => {
    if (filter === "ALL") return alerts;

    return alerts.filter(
      (alert) => alert.status === filter
    );
  }, [alerts, filter]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const leakCount = alerts.filter(
    (a) => a.status === "LEAK"
  ).length;

  const warningCount = alerts.filter(
    (a) => a.status === "WARNING"
  ).length;

  const activeCount = alerts.filter(
    (a) => !acknowledged[a.id]
  ).length;

  const latestCritical = alerts.find(
    (a) => a.status === "LEAK"
  );

  // =====================================================
  // TIME FORMAT
  // =====================================================

  const formatTime = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <main className="alerts-page">

      {/* =================================================
          EMERGENCY OVERLAY
      ================================================= */}

      <AnimatePresence>
        {latestCritical &&
          !acknowledged[latestCritical.id] && (
            <motion.div
              className="emergency-banner"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
            >
              <motion.div
                className="emergency-pulse"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1,
                }}
              >
                <ShieldAlert size={34} />
              </motion.div>

              <div>
                <strong>CRITICAL GAS ALERT</strong>
                <span>
                  Hazardous gas level detected by OXY-001
                </span>
              </div>

              <button
                onClick={() =>
                  acknowledgeAlert(latestCritical.id)
                }
                className="emergency-action"
              >
                ACKNOWLEDGE
              </button>
            </motion.div>
          )}
      </AnimatePresence>

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="alerts-header">
        <div>
          <div className="eyebrow">
            <Activity size={15} />
            OXYGUARD // ALERT CENTER
          </div>

          <h1>
            Safety <span>Alerts</span>
          </h1>

          <p>
            Real-time hazard detection and emergency event
            management.
          </p>
        </div>

        <button
          className={`sound-toggle ${
            soundEnabled ? "active" : ""
          }`}
          onClick={() => setSoundEnabled((v) => !v)}
        >
          {soundEnabled ? (
            <Volume2 size={18} />
          ) : (
            <VolumeX size={18} />
          )}

          {soundEnabled ? "Alert Sound ON" : "Alert Sound OFF"}
        </button>
      </section>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <section className="alert-stats">

        <motion.div
          className="alert-stat"
          whileHover={{ y: -4 }}
        >
          <div className="stat-icon">
            <Bell size={22} />
          </div>

          <div>
            <span>ACTIVE ALERTS</span>
            <strong>{activeCount}</strong>
          </div>
        </motion.div>

        <motion.div
          className="alert-stat critical"
          whileHover={{ y: -4 }}
        >
          <div className="stat-icon">
            <ShieldAlert size={22} />
          </div>

          <div>
            <span>CRITICAL LEAKS</span>
            <strong>{leakCount}</strong>
          </div>
        </motion.div>

        <motion.div
          className="alert-stat warning"
          whileHover={{ y: -4 }}
        >
          <div className="stat-icon">
            <AlertTriangle size={22} />
          </div>

          <div>
            <span>WARNINGS</span>
            <strong>{warningCount}</strong>
          </div>
        </motion.div>

        <motion.div
          className="alert-stat"
          whileHover={{ y: -4 }}
        >
          <div className="stat-icon">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>RESOLVED</span>
            <strong>
              {alerts.length - activeCount}
            </strong>
          </div>
        </motion.div>

      </section>

      {/* =================================================
          FILTER BAR
      ================================================= */}

      <section className="alert-toolbar">

        <div className="filter-buttons">
          {["ALL", "LEAK", "WARNING"].map((type) => (
            <button
              key={type}
              className={filter === type ? "selected" : ""}
              onClick={() => setFilter(type)}
            >
              {type === "ALL" && <Bell size={15} />}
              {type === "LEAK" && <ShieldAlert size={15} />}
              {type === "WARNING" && (
                <AlertTriangle size={15} />
              )}

              {type}
            </button>
          ))}
        </div>

        <button
          className="clear-button"
          onClick={clearAcknowledged}
        >
          <XCircle size={16} />
          Clear Resolved
        </button>

      </section>

      {/* =================================================
          LIVE INDICATOR
      ================================================= */}

      <div className="live-alert-status">
        <span className="live-dot" />
        LIVE MONITORING
        <span className="separator">•</span>
        Device OXY-001
      </div>

      {/* =================================================
          ALERT LIST
      ================================================= */}

      <section className="alert-list">

        {filteredAlerts.length === 0 ? (
          <motion.div
            className="no-alerts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <CheckCircle2 size={48} />

            <h3>System Secure</h3>

            <p>
              No warning or leak events detected.
            </p>
          </motion.div>
        ) : (
          filteredAlerts.map((alert, index) => {
            const isLeak = alert.status === "LEAK";
            const isAck = !!acknowledged[alert.id];

            return (
              <motion.article
                key={alert.id}
                className={`alert-card ${
                  isLeak ? "leak" : "warning"
                } ${isAck ? "acknowledged" : ""}`}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.04,
                }}
              >

                <div className="alert-indicator">
                  {isLeak ? (
                    <ShieldAlert size={24} />
                  ) : (
                    <AlertTriangle size={24} />
                  )}
                </div>

                <div className="alert-main">

                  <div className="alert-title-row">
                    <div>
                      <h3>
                        {isLeak
                          ? "Critical Gas Leak"
                          : "Gas Warning"}
                      </h3>

                      <span className="alert-status">
                        {alert.status}
                      </span>
                    </div>

                    {isAck && (
                      <span className="resolved-badge">
                        <CheckCircle2 size={14} />
                        RESOLVED
                      </span>
                    )}
                  </div>

                  <div className="alert-metrics">

                    <div>
                      <span>GAS LEVEL</span>
                      <strong>
                        {Number(alert.gas || 0).toFixed(1)}%
                      </strong>
                    </div>

                    <div>
                      <span>TEMPERATURE</span>
                      <strong>
                        {Number(
                          alert.temperature || 0
                        ).toFixed(1)}
                        °C
                      </strong>
                    </div>

                    <div>
                      <span>HUMIDITY</span>
                      <strong>
                        {Number(
                          alert.humidity || 0
                        ).toFixed(1)}
                        %
                      </strong>
                    </div>

                    <div>
                      <span>HEALTH</span>
                      <strong>
                        {Number(
                          alert.health || 0
                        ).toFixed(0)}
                        %
                      </strong>
                    </div>

                  </div>

                  <div className="alert-footer">

                    <span>
                      <Clock size={14} />
                      {formatTime(alert.created_at)}
                    </span>

                    {!isAck && (
                      <button
                        onClick={() =>
                          acknowledgeAlert(alert.id)
                        }
                        className="ack-button"
                      >
                        <CheckCircle2 size={15} />
                        Acknowledge
                      </button>
                    )}

                  </div>

                </div>

              </motion.article>
            );
          })
        )}

      </section>

    </main>
  );
}