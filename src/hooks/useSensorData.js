import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

// =====================================================
// DEVICE CONFIGURATION
// =====================================================

const DEVICE_ID =
  "93fb0b11-ea9a-4692-a186-1c388cdf3317";

// ESP32 existing code sends approximately every 2 seconds.
// Consider the device offline if no fresh reading arrives
// within 10 seconds.
const OFFLINE_AFTER_MS = 10000;

// Re-check device freshness every second.
const WATCHDOG_INTERVAL_MS = 1000;


// =====================================================
// SENSOR DATA HOOK
// =====================================================

export function useSensorData() {

  const [reading, setReading] = useState(null);

  const [loading, setLoading] = useState(true);

  const [realtimeConnected, setRealtimeConnected] =
    useState(false);

  const [deviceOnline, setDeviceOnline] =
    useState(false);

  const [error, setError] = useState(null);

  const mountedRef = useRef(true);


  // ===================================================
  // MOUNT / UNMOUNT
  // ===================================================

  useEffect(() => {

    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };

  }, []);


  // ===================================================
  // FETCH LATEST REAL HARDWARE READING
  // ===================================================

  const fetchLatest = useCallback(async () => {

    try {

      const {
        data,
        error: fetchError
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
            ascending: false
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
  // CHECK DEVICE FRESHNESS
  // ===================================================

  const checkDeviceStatus = useCallback(() => {

    // No reading
    if (!reading?.created_at) {

      setDeviceOnline(false);

      return;
    }


    // Convert timestamp
    const lastSeen =
      new Date(
        reading.created_at
      ).getTime();


    // Invalid timestamp
    if (
      Number.isNaN(lastSeen)
    ) {

      setDeviceOnline(false);

      return;
    }


    // Calculate age
    const age =
      Date.now() - lastSeen;


    // Hardware is online only when
    // reading is fresh.

    const isOnline =
      age >= 0 &&
      age <= OFFLINE_AFTER_MS;


    setDeviceOnline(
      isOnline
    );

  }, [reading]);


  // ===================================================
  // INITIAL DATABASE LOAD
  // ===================================================

  useEffect(() => {

    fetchLatest();

  }, [fetchLatest]);


  // ===================================================
  // SUPABASE REALTIME
  // ===================================================

  useEffect(() => {

    let channel = null;

    let cancelled = false;


    const setupRealtime = async () => {

      try {

        // ------------------------------------------------
        // CREATE UNIQUE CHANNEL
        // ------------------------------------------------

        const channelName =
          `oxyguard-live-${DEVICE_ID}-${crypto.randomUUID()}`;


        console.log(
          "Creating OxyGuard Realtime channel:",
          channelName
        );


        // ------------------------------------------------
        // SUBSCRIBE
        // ------------------------------------------------

        channel = supabase

          .channel(channelName)

          .on(

            "postgres_changes",

            {
              event: "INSERT",

              schema: "public",

              table: "sensor_readings",

              filter:
                `device_id=eq.${DEVICE_ID}`
            },

            (payload) => {

              console.log(
                "OXYGUARD LIVE HARDWARE READING:",
                payload.new
              );


              if (
                !mountedRef.current
              ) {
                return;
              }


              // Accept the real ESP32 reading
              setReading(
                payload.new
              );

              setError(null);

              setLoading(false);

            }

          )


          .subscribe(

            (status, realtimeError) => {

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


              if (
                !mountedRef.current
              ) {
                return;
              }


              if (
                status === "SUBSCRIBED"
              ) {

                console.log(
                  "OxyGuard Realtime connected"
                );

                setRealtimeConnected(
                  true
                );

              }


              else if (

                status ===
                  "CHANNEL_ERROR" ||

                status ===
                  "TIMED_OUT" ||

                status ===
                  "CLOSED"

              ) {

                console.warn(
                  "OxyGuard Realtime:",
                  status
                );

                setRealtimeConnected(
                  false
                );

              }

            }

          );

      }

      catch (err) {

        console.error(
          "OxyGuard Realtime setup error:",
          err
        );


        if (
          mountedRef.current
        ) {

          setRealtimeConnected(
            false
          );

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

        supabase
          .removeChannel(channel)

          .catch((err) => {

            console.error(
              "OxyGuard channel cleanup error:",
              err
            );

          });

      }


      if (
        mountedRef.current
      ) {

        setRealtimeConnected(
          false
        );

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


    return () => {

      clearInterval(
        timer
      );

    };

  }, [
    checkDeviceStatus
  ]);


  // ===================================================
  // RETURN
  // ===================================================

  return {

    // Latest REAL ESP32 reading
    reading,

    // Loading state
    loading,

    // Supabase Realtime
    realtimeConnected,

    // Physical ESP32 status
    deviceOnline,

    // Device UUID
    deviceId:
      DEVICE_ID,

    // Error
    error,

    // Offline threshold
    offlineAfterMs:
      OFFLINE_AFTER_MS

  };

}