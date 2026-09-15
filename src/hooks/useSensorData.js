import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

// =====================================================
// DEVICE CONFIGURATION
// =====================================================

const DEVICE_ID =
  "93fb0b11-ea9a-4692-a186-1c388cdf3317";

// ESP32 sends approximately every 2 seconds.
// If no fresh reading arrives within 10 seconds,
// consider the physical ESP32 device OFFLINE.
const OFFLINE_AFTER_MS = 10000;

// Watchdog checks every second.
const WATCHDOG_INTERVAL_MS = 1000;


// =====================================================
// SENSOR DATA HOOK
// =====================================================

export function useSensorData() {

  const [reading, setReading] = useState(null);

  const [loading, setLoading] = useState(true);

  // Supabase Realtime connection
  const [realtimeConnected, setRealtimeConnected] =
    useState(false);

  // Physical ESP32 status
  const [deviceOnline, setDeviceOnline] =
    useState(false);

  // Error state
  const [error, setError] = useState(null);

  // Prevent state updates after unmount
  const mountedRef = useRef(true);


  // ===================================================
  // CHECK IF COMPONENT IS STILL MOUNTED
  // ===================================================

  useEffect(() => {

    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };

  }, []);


  // ===================================================
  // FETCH LATEST SENSOR READING
  // ===================================================

  const fetchLatest = useCallback(async () => {

    try {

      const {
        data,
        error: fetchError,
      } = await supabase

        .from("sensor_readings")

        .select("*")

        .eq(
          "device_id",
          DEVICE_ID
        )

        .order(
          "created_at",
          {
            ascending: false,
          }
        )

        .limit(1)

        .maybeSingle();


      // -----------------------------------------------
      // DATABASE ERROR
      // -----------------------------------------------

      if (fetchError) {

        console.error(
          "OxyGuard sensor error:",
          fetchError
        );

        if (mountedRef.current) {

          setError(
            fetchError.message ||
              "Unable to fetch sensor data."
          );

          setLoading(false);
        }

        return;
      }


      // -----------------------------------------------
      // SUCCESS
      // -----------------------------------------------

      if (mountedRef.current) {

        setReading(
          data || null
        );

        setError(null);

        setLoading(false);
      }

    } catch (err) {

      console.error(
        "OxyGuard fetch exception:",
        err
      );

      if (mountedRef.current) {

        setError(
          err?.message ||
            "Unexpected sensor error."
        );

        setLoading(false);
      }

    }

  }, []);


  // ===================================================
  // CHECK PHYSICAL DEVICE STATUS
  // ===================================================

  const checkDeviceStatus = useCallback(() => {

    // -----------------------------------------------
    // No reading = OFFLINE
    // -----------------------------------------------

    if (!reading?.created_at) {

      setDeviceOnline(false);

      return;
    }


    // -----------------------------------------------
    // Convert database timestamp
    // -----------------------------------------------

    const lastSeen =
      new Date(
        reading.created_at
      ).getTime();


    // -----------------------------------------------
    // Invalid timestamp = OFFLINE
    // -----------------------------------------------

    if (
      Number.isNaN(lastSeen)
    ) {

      setDeviceOnline(false);

      return;
    }


    // -----------------------------------------------
    // Calculate reading age
    // -----------------------------------------------

    const age =
      Date.now() - lastSeen;


    // -----------------------------------------------
    // Device is online only when:
    //
    // 0 <= age <= 10 seconds
    // -----------------------------------------------

    const isOnline =
      age >= 0 &&
      age <= OFFLINE_AFTER_MS;


    setDeviceOnline(
      isOnline
    );

  }, [reading]);


  // ===================================================
  // INITIAL DATA LOAD
  // ===================================================

  useEffect(() => {

    fetchLatest();

  }, [fetchLatest]);


  // ===================================================
  // SUPABASE REALTIME
  // ===================================================
// ===================================================
// SUPABASE REALTIME
// ===================================================

useEffect(() => {
  let channel = null;
  let cancelled = false;

  const setupRealtime = async () => {
    try {
      // -------------------------------------------------
      // IMPORTANT:
      // Remove any old channel with the same topic.
      // This prevents React StrictMode / remounts from
      // reusing an already-subscribed channel.
      // -------------------------------------------------

      const existingChannels = supabase.getChannels();

      const oldChannels = existingChannels.filter(
        (existingChannel) =>
          existingChannel.topic ===
          `realtime:oxyguard-live-${DEVICE_ID}`
      );

      for (const oldChannel of oldChannels) {
        console.log(
          "Removing old OxyGuard channel:",
          oldChannel.topic
        );

        await supabase.removeChannel(oldChannel);
      }

      if (cancelled) {
        return;
      }

      // -------------------------------------------------
      // Create a UNIQUE channel name
      // -------------------------------------------------

      const channelName =
        `oxyguard-live-${DEVICE_ID}-${crypto.randomUUID()}`;

      console.log(
        "Creating OxyGuard realtime channel:",
        channelName
      );

      // -------------------------------------------------
      // IMPORTANT:
      // .on() MUST happen BEFORE .subscribe()
      // -------------------------------------------------

      channel = supabase
        .channel(channelName)

        .on(
          "postgres_changes",

          {
            event: "INSERT",
            schema: "public",
            table: "sensor_readings",
            filter: `device_id=eq.${DEVICE_ID}`,
          },

          (payload) => {
            console.log(
              "OXYGUARD LIVE READING:",
              payload.new
            );

            if (!mountedRef.current) {
              return;
            }

            setReading(payload.new);
            setError(null);
          }
        )

        .subscribe((status, realtimeError) => {
          console.log(
            "OxyGuard Realtime:",
            status
          );

          if (realtimeError) {
            console.error(
              "OxyGuard Realtime error:",
              realtimeError
            );
          }

          if (!mountedRef.current) {
            return;
          }

          if (status === "SUBSCRIBED") {
            console.log(
              "✅ OxyGuard Realtime connected"
            );

            setRealtimeConnected(true);
          }

          else if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT" ||
            status === "CLOSED"
          ) {
            console.warn(
              "⚠️ OxyGuard Realtime:",
              status
            );

            setRealtimeConnected(false);
          }
        });

    } catch (err) {
      console.error(
        "OxyGuard Realtime setup error:",
        err
      );

      if (mountedRef.current) {
        setRealtimeConnected(false);

        setError(
          err?.message ||
            "Realtime connection failed."
        );
      }
    }
  };

  setupRealtime();

  // =================================================
  // CLEANUP
  // =================================================

  return () => {
    cancelled = true;

    if (channel) {
      console.log(
        "Cleaning up OxyGuard Realtime channel"
      );

      supabase
        .removeChannel(channel)
        .then(() => {
          console.log(
            "OxyGuard Realtime channel removed"
          );
        })
        .catch((err) => {
          console.error(
            "OxyGuard channel cleanup error:",
            err
          );
        });
    }

    if (mountedRef.current) {
      setRealtimeConnected(false);
    }
  };

}, []);


  // ===================================================
  // PHYSICAL DEVICE WATCHDOG
  // ===================================================

  useEffect(() => {

    // Check immediately
    checkDeviceStatus();


    // Check every second
    const timer =
      setInterval(
        () => {

          checkDeviceStatus();

        },
        WATCHDOG_INTERVAL_MS
      );


    // Cleanup timer
    return () => {

      clearInterval(
        timer
      );

    };

  }, [
    checkDeviceStatus,
  ]);


  // ===================================================
  // RETURN DATA
  // ===================================================

  return {

    // Latest sensor reading
    reading,

    // Initial loading state
    loading,

    // Supabase Realtime status
    realtimeConnected,

    // Actual physical-device freshness status
    deviceOnline,

    // Supabase device UUID
    deviceId: DEVICE_ID,

    // Error message
    error,

    // Useful configuration value
    offlineAfterMs:
      OFFLINE_AFTER_MS,
  };
}