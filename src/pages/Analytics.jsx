import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import {
  Activity,
  Thermometer,
  Droplets,
  Wind,
  Download,
  RefreshCw,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { supabase } from "../lib/supabase";

const DEVICE_ID =
  "93fb0b11-ea9a-4692-a186-1c388cdf3317";

function Analytics() {
  const [readings, setReadings] =
    useState([]);

  const [range, setRange] =
    useState("24H");

  const [loading, setLoading] =
    useState(true);

  const [realtime, setRealtime] =
    useState(false);

  const fetchReadings = async () => {
    setLoading(true);

    const now = new Date();

    let fromDate = new Date(now);

    if (range === "24H") {
      fromDate.setHours(
        now.getHours() - 24
      );
    }

    if (range === "7D") {
      fromDate.setDate(
        now.getDate() - 7
      );
    }

    if (range === "30D") {
      fromDate.setDate(
        now.getDate() - 30
      );
    }

    const { data, error } =
      await supabase
        .from("sensor_readings")
        .select(
          "id, temperature, humidity, gas, health, status, created_at"
        )
        .eq("device_id", DEVICE_ID)
        .gte(
          "created_at",
          fromDate.toISOString()
        )
        .order("created_at", {
          ascending: true,
        })
        .limit(1000);

    if (error) {
      console.error(
        "Analytics error:",
        error
      );

      setReadings([]);
    } else {
      setReadings(data || []);
    }

    setLoading(false);
  };

  /* LOAD WHEN RANGE CHANGES */

  useEffect(() => {
    fetchReadings();
  }, [range]);

  /* REALTIME */

  useEffect(() => {
    const channel = supabase
      .channel(
        "oxyguard-analytics-stream"
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sensor_readings",
          filter:
            `device_id=eq.${DEVICE_ID}`,
        },
        (payload) => {
          setRealtime(true);

          setReadings((previous) => {
            const exists =
              previous.some(
                (item) =>
                  item.id ===
                  payload.new.id
              );

            if (exists) {
              return previous;
            }

            return [
              ...previous,
              payload.new,
            ].slice(-1000);
          });
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setRealtime(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* CHART DATA */

  const chartData = useMemo(() => {
    return readings.map(
      (item) => ({
        time: new Date(
          item.created_at
        ).toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        ),

        temperature:
          Number(
            item.temperature || 0
          ),

        humidity:
          Number(
            item.humidity || 0
          ),

        gas:
          Number(
            item.gas || 0
          ),

        health:
          Number(
            item.health || 0
          ),
      })
    );
  }, [readings]);

  /* STATS */

  const stats = useMemo(() => {
    if (!readings.length) {
      return {
        temperature: {
          avg: 0,
          min: 0,
          max: 0,
        },

        humidity: {
          avg: 0,
          min: 0,
          max: 0,
        },

        gas: {
          avg: 0,
          min: 0,
          max: 0,
        },

        health: {
          avg: 0,
          min: 0,
          max: 0,
        },
      };
    }

    const values = {
      temperature:
        readings.map(
          (x) =>
            Number(
              x.temperature || 0
            )
        ),

      humidity:
        readings.map(
          (x) =>
            Number(
              x.humidity || 0
            )
        ),

      gas:
        readings.map(
          (x) =>
            Number(
              x.gas || 0
            )
        ),

      health:
        readings.map(
          (x) =>
            Number(
              x.health || 0
            )
        ),
    };

    const calculate = (arr) => ({
      avg:
        arr.reduce(
          (a, b) => a + b,
          0
        ) / arr.length,

      min: Math.min(...arr),

      max: Math.max(...arr),
    });

    return {
      temperature:
        calculate(
          values.temperature
        ),

      humidity:
        calculate(
          values.humidity
        ),

      gas:
        calculate(values.gas),

      health:
        calculate(values.health),
    };
  }, [readings]);

  /* CSV */

  const exportCSV = () => {
    if (!readings.length) return;

    const headers = [
      "Timestamp",
      "Temperature",
      "Humidity",
      "Gas",
      "Health",
      "Status",
    ];

    const rows = readings.map(
      (item) => [
        item.created_at,
        item.temperature,
        item.humidity,
        item.gas,
        item.health,
        item.status,
      ]
    );

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.join(",")
      ),
    ].join("\n");

    const blob =
      new Blob([csv], {
        type: "text/csv",
      });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `oxyguard-${range.toLowerCase()}-analytics.csv`;

    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <main className="analytics-page">

      {/* HEADER */}

      <section className="analytics-header">

        <div>

          <div className="analytics-eyebrow">

            <span
              className={
                realtime
                  ? "live-dot"
                  : "offline-dot"
              }
            />

            OXYGUARD ANALYTICS

          </div>

          <h1>
            Environmental{" "}
            <span>Analytics</span>
          </h1>

          <p>
            Analyze historical sensor
            behavior and realtime
            environmental trends.
          </p>

        </div>

        <div className="analytics-header-actions">

          <div className="analytics-live">

            <span
              className={
                realtime
                  ? "live-dot"
                  : "offline-dot"
              }
            />

            {realtime
              ? "REALTIME"
              : "CONNECTING"}

          </div>

          <button
            className="analytics-export"
            onClick={exportCSV}
          >
            <Download size={16} />
            Export CSV
          </button>

        </div>

      </section>

      {/* RANGE */}

      <section className="analytics-toolbar">

        <div className="analytics-range">

          {[
            "24H",
            "7D",
            "30D",
          ].map((item) => (

            <button
              key={item}
              className={
                range === item
                  ? "active"
                  : ""
              }
              onClick={() =>
                setRange(item)
              }
            >
              {item}
            </button>

          ))}

        </div>

        <div className="analytics-data-count">

          <Activity size={15} />

          {readings.length}
          {" "}DATA POINTS

        </div>

      </section>

      {/* STAT CARDS */}

      <section className="analytics-stat-grid">

        <StatCard
          icon={<Thermometer />}
          title="Temperature"
          value={stats.temperature.avg}
          unit="°C"
          min={stats.temperature.min}
          max={stats.temperature.max}
        />

        <StatCard
          icon={<Droplets />}
          title="Humidity"
          value={stats.humidity.avg}
          unit="%"
          min={stats.humidity.min}
          max={stats.humidity.max}
        />

        <StatCard
          icon={<Wind />}
          title="Gas Level"
          value={stats.gas.avg}
          unit="%"
          min={stats.gas.min}
          max={stats.gas.max}
        />

        <StatCard
          icon={<Activity />}
          title="System Health"
          value={stats.health.avg}
          unit="%"
          min={stats.health.min}
          max={stats.health.max}
        />

      </section>

      {/* TEMPERATURE */}

      <ChartPanel
        title="Temperature Trend"
        subtitle="DHT11 environmental temperature"
        icon={<Thermometer />}
        loading={loading}
      >

        <ResponsiveContainer
          width="100%"
          height={320}
        >

          <LineChart
            data={chartData}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
            />

            <XAxis
              dataKey="time"
              stroke="#657076"
              tick={{
                fontSize: 10,
              }}
            />

            <YAxis
              stroke="#657076"
              tick={{
                fontSize: 10,
              }}
            />

            <Tooltip
              contentStyle={{
                background:
                  "#080c0e",
                border:
                  "1px solid rgba(99,247,197,.2)",
                borderRadius: 8,
                color: "#fff",
              }}
            />

            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#63f7c5"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 5,
              }}
            />

          </LineChart>

        </ResponsiveContainer>

      </ChartPanel>

      {/* GAS */}

      <ChartPanel
        title="Gas Level"
        subtitle="MQ-135 environmental gas trend"
        icon={<Wind />}
        loading={loading}
      >

        <ResponsiveContainer
          width="100%"
          height={320}
        >

          <AreaChart
            data={chartData}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
            />

            <XAxis
              dataKey="time"
              stroke="#657076"
              tick={{
                fontSize: 10,
              }}
            />

            <YAxis
              stroke="#657076"
              tick={{
                fontSize: 10,
              }}
            />

            <Tooltip
              contentStyle={{
                background:
                  "#080c0e",
                border:
                  "1px solid rgba(99,247,197,.2)",
                borderRadius: 8,
              }}
            />

            <Area
              type="monotone"
              dataKey="gas"
              stroke="#63f7c5"
              fill="rgba(99,247,197,.08)"
              strokeWidth={2}
            />

          </AreaChart>

        </ResponsiveContainer>

      </ChartPanel>

      {/* HEALTH + HUMIDITY */}

      <section className="analytics-two-column">

        <ChartPanel
          title="Humidity"
          subtitle="DHT11 humidity trend"
          icon={<Droplets />}
          loading={loading}
        >

          <ResponsiveContainer
            width="100%"
            height={280}
          >

            <AreaChart
              data={chartData}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
              />

              <XAxis
                dataKey="time"
                stroke="#657076"
                tick={{
                  fontSize: 9,
                }}
              />

              <YAxis
                stroke="#657076"
                tick={{
                  fontSize: 9,
                }}
              />

              <Tooltip
                contentStyle={{
                  background:
                    "#080c0e",
                  border:
                    "1px solid rgba(99,247,197,.2)",
                  borderRadius: 8,
                }}
              />

              <Area
                type="monotone"
                dataKey="humidity"
                stroke="#63f7c5"
                fill="rgba(99,247,197,.07)"
                strokeWidth={2}
              />

            </AreaChart>

          </ResponsiveContainer>

        </ChartPanel>

        <ChartPanel
          title="System Health"
          subtitle="Calculated device health score"
          icon={<ShieldCheck />}
          loading={loading}
        >

          <ResponsiveContainer
            width="100%"
            height={280}
          >

            <LineChart
              data={chartData}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
              />

              <XAxis
                dataKey="time"
                stroke="#657076"
                tick={{
                  fontSize: 9,
                }}
              />

              <YAxis
                stroke="#657076"
                tick={{
                  fontSize: 9,
                }}
              />

              <Tooltip
                contentStyle={{
                  background:
                    "#080c0e",
                  border:
                    "1px solid rgba(99,247,197,.2)",
                  borderRadius: 8,
                }}
              />

              <Line
                type="monotone"
                dataKey="health"
                stroke="#63f7c5"
                strokeWidth={2}
                dot={false}
              />

            </LineChart>

          </ResponsiveContainer>

        </ChartPanel>

      </section>

    </main>
  );
}


/* STAT CARD */

function StatCard({
  icon,
  title,
  value,
  unit,
  min,
  max,
}) {
  return (
    <motion.div
      className="analytics-stat-card"
      whileHover={{
        y: -5,
      }}
    >

      <div className="analytics-stat-top">

        <div className="analytics-stat-icon">
          {icon}
        </div>

        <BarChart3 size={16} />

      </div>

      <span>
        {title}
      </span>

      <strong>
        {Number(value).toFixed(1)}
        <small>{unit}</small>
      </strong>

      <div className="analytics-minmax">

        <span>
          MIN {Number(min).toFixed(1)}
        </span>

        <span>
          MAX {Number(max).toFixed(1)}
        </span>

      </div>

    </motion.div>
  );
}


/* CHART PANEL */

function ChartPanel({
  title,
  subtitle,
  icon,
  children,
  loading,
}) {
  return (
    <motion.section
      className="analytics-chart-panel"
      initial={{
        opacity: 0,
        y: 20,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
    >

      <div className="analytics-chart-header">

        <div className="analytics-chart-title">

          <div className="analytics-chart-icon">
            {icon}
          </div>

          <div>

            <h3>
              {title}
            </h3>

            <p>
              {subtitle}
            </p>

          </div>

        </div>

        <span>
          {loading
            ? "LOADING"
            : "LIVE DATA"}
        </span>

      </div>

      {loading ? (
        <div className="analytics-chart-loading">

          <RefreshCw
            size={30}
            className="spin"
          />

          Loading telemetry...

        </div>
      ) : children}

    </motion.section>
  );
}

export default Analytics;