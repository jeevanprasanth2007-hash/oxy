import { motion } from "framer-motion";
import {
  Activity,
  Cpu,
  Database,
  Radio,
  ShieldCheck,
  Wifi,
  Thermometer,
  Wind,
  Monitor,
  Zap,
  ArrowRight,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

function About() {
  const architecture = [
    {
      icon: Wind,
      title: "Environmental Sensors",
      text: "Sensors continuously capture temperature, humidity and gas-level data.",
    },
    {
      icon: Cpu,
      title: "ESP32 Processing",
      text: "The ESP32 processes sensor readings and evaluates the system condition.",
    },
    {
      icon: Wifi,
      title: "Wireless Transmission",
      text: "Processed readings are transmitted through Wi-Fi to the cloud platform.",
    },
    {
      icon: Database,
      title: "Supabase Cloud",
      text: "Sensor readings are securely stored and made available in real time.",
    },
    {
      icon: Monitor,
      title: "OxyGuard Dashboard",
      text: "The web dashboard transforms live data into actionable information.",
    },
  ];

  const technologies = [
    { icon: Cpu, title: "ESP32", text: "Edge computing & Wi-Fi connectivity" },
    { icon: Wind, title: "MQ-135", text: "Gas / air-quality sensing" },
    { icon: Thermometer, title: "DHT11", text: "Temperature & humidity monitoring" },
    { icon: Database, title: "Supabase", text: "Cloud database & realtime data" },
    { icon: Activity, title: "Realtime Analytics", text: "Historical monitoring & trends" },
    { icon: ShieldCheck, title: "Alert Engine", text: "Condition-based safety indication" },
  ];

  return (
    <main className="about-page">
      {/* HERO */}
      <section className="about-hero">
        <div className="about-grid-bg" />

        <motion.div
          className="about-hero-content"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <div className="about-kicker">
            <span className="about-kicker-dot" />
            OXYGUARD TECHNOLOGY
          </div>

          <h1>
            Intelligent
            <span> Environmental </span>
            Monitoring
          </h1>

          <p>
            OxyGuard is a smart IoT monitoring platform designed to transform
            real-world sensor data into a powerful, realtime safety dashboard.
          </p>

          <div className="about-hero-actions">
            <a href="/dashboard" className="about-primary-btn">
              Open Dashboard
              <ArrowRight size={18} />
            </a>

            <a href="/device" className="about-secondary-btn">
              Explore Device
            </a>
          </div>
        </motion.div>

        {/* CORE */}
        <motion.div
          className="about-core"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="core-ring core-ring-1" />
          <div className="core-ring core-ring-2" />
          <div className="core-ring core-ring-3" />

          <div className="core-center">
            <ShieldCheck size={42} />
            <span>SAFE</span>
          </div>

          <div className="core-particle particle-1" />
          <div className="core-particle particle-2" />
          <div className="core-particle particle-3" />
        </motion.div>
      </section>

      {/* MISSION */}
      <section className="about-section">
        <motion.div
          className="about-section-heading"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <span>01 / MISSION</span>
          <h2>From raw data to intelligent decisions.</h2>
          <p>
            OxyGuard connects embedded hardware, cloud infrastructure and a
            modern web interface into one unified monitoring ecosystem.
          </p>
        </motion.div>

        <div className="mission-grid">
          <motion.div
            className="mission-card mission-card-large"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Activity size={28} />
            <h3>Always Connected</h3>
            <p>
              Live sensor readings move from the physical environment to the
              cloud and directly into the OxyGuard interface.
            </p>

            <div className="mission-line">
              <span />
              <span />
              <span />
              <span />
            </div>
          </motion.div>

          <motion.div
            className="mission-card"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Zap size={28} />
            <h3>Fast Response</h3>
            <p>
              Sensor conditions can be visualized immediately so abnormal
              environmental conditions are easier to identify.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section className="about-section architecture-section">
        <motion.div
          className="about-section-heading"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <span>02 / ARCHITECTURE</span>
          <h2>The OxyGuard ecosystem.</h2>
          <p>
            A complete data pipeline connecting physical sensors with realtime
            cloud intelligence.
          </p>
        </motion.div>

        <div className="architecture-flow">
          {architecture.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                className="architecture-item"
                key={item.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="architecture-icon">
                  <Icon size={25} />
                </div>

                <div className="architecture-number">
                  0{index + 1}
                </div>

                <h3>{item.title}</h3>
                <p>{item.text}</p>

                {index !== architecture.length - 1 && (
                  <div className="architecture-arrow">
                    <ArrowRight size={18} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* TECHNOLOGY */}
      <section className="about-section">
        <motion.div
          className="about-section-heading"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <span>03 / TECHNOLOGY</span>
          <h2>Built as an IoT command system.</h2>
          <p>
            Hardware, connectivity, cloud services and visualization working
            together.
          </p>
        </motion.div>

        <div className="technology-grid">
          {technologies.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                className="technology-card"
                key={item.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -8 }}
              >
                <div className="technology-icon">
                  <Icon size={23} />
                </div>

                <div className="technology-index">
                  0{index + 1}
                </div>

                <h3>{item.title}</h3>
                <p>{item.text}</p>

                <div className="technology-bottom">
                  <span>ACTIVE</span>
                  <Activity size={14} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* SAFETY PIPELINE */}
      <section className="about-section safety-section">
        <div className="safety-panel">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <span>04 / SAFETY PIPELINE</span>

            <h2>
              Detect.
              <br />
              Process.
              <br />
              Respond.
            </h2>

            <p>
              OxyGuard continuously transforms environmental measurements into
              system status information that can be monitored through the
              dashboard.
            </p>
          </motion.div>

          <div className="safety-stages">
            {[
              ["01", "SENSE", "Collect environmental data"],
              ["02", "PROCESS", "Evaluate incoming readings"],
              ["03", "SYNC", "Send data to the cloud"],
              ["04", "VISUALIZE", "Display realtime status"],
              ["05", "ALERT", "Highlight abnormal conditions"],
            ].map(([number, title, text], index) => (
              <motion.div
                className="safety-stage"
                key={number}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <span>{number}</span>
                <div>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER STATEMENT */}
      <section className="about-final">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="final-icon">
            <ShieldCheck size={30} />
          </div>

          <span>OXYGUARD</span>

          <h2>
            Intelligence for a
            <br />
            safer environment.
          </h2>

          <p>
            Monitor your environment. Understand your data. Respond faster.
          </p>
        </motion.div>
      </section>
    </main>
  );
}

export default About;