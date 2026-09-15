import { useState } from "react";

import {
  NavLink,
} from "react-router-dom";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  Menu,
  X,
  Activity,
  LayoutDashboard,
  BarChart3,
  Bell,
  Cpu,
  Info,
  Radio,
  Wifi,
  WifiOff,
} from "lucide-react";

import { useSensorData } from "../hooks/useSensorData";

function Navbar() {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  // =====================================================
  // REAL DEVICE STATUS
  // =====================================================

  const { deviceOnline } = useSensorData();

  const links = [
    {
      name: "Home",
      path: "/",
    },
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3,
    },
    {
      name: "Alerts",
      path: "/alerts",
      icon: Bell,
    },
    {
      name: "Device",
      path: "/device",
      icon: Cpu,
    },
    {
      name: "About",
      path: "/about",
      icon: Info,
    },
  ];

  const closeMobile = () =>
    setMobileOpen(false);

  return (
    <header className="og-navbar">

      <div className="og-navbar-inner">

        {/* =================================================
            LOGO
        ================================================= */}

        <NavLink
          to="/"
          className="og-logo"
          onClick={closeMobile}
        >

          <div className="og-logo-mark">
            <Activity size={20} />
          </div>

          <div className="og-logo-text">
            <strong>OXY</strong>
            <span>GUARD</span>
          </div>

        </NavLink>

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================= */}

        <nav className="og-desktop-nav">

          {links.map((link) => {

            const Icon = link.icon;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                className={({ isActive }) =>
                  `og-nav-link ${
                    isActive
                      ? "og-nav-active"
                      : ""
                  }`
                }
              >

                {Icon && (
                  <Icon size={14} />
                )}

                <span>
                  {link.name}
                </span>

                {/* Dashboard LIVE indicator */}

                {link.path ===
                  "/dashboard" && (
                  <span
                    className={
                      deviceOnline
                        ? "og-live-mini"
                        : "og-live-mini offline"
                    }
                  />
                )}

              </NavLink>
            );
          })}

        </nav>

        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <div className="og-navbar-right">

          {/* REAL DEVICE STATUS */}

          <div
            className={`og-system-status ${
              deviceOnline
                ? "og-system-online"
                : "og-system-offline"
            }`}
          >

            {deviceOnline ? (
              <Wifi size={13} />
            ) : (
              <WifiOff size={13} />
            )}

            <span className="og-status-dot" />

            <span>
              {deviceOnline
                ? "LIVE"
                : "OFFLINE"}
            </span>

          </div>

          {/* DASHBOARD BUTTON */}

          <NavLink
            to="/dashboard"
            className="og-dashboard-btn"
          >

            <Radio size={15} />

            <span>
              Live Dashboard
            </span>

          </NavLink>

          {/* MOBILE BUTTON */}

          <button
            className="og-menu-btn"
            onClick={() =>
              setMobileOpen(
                !mobileOpen
              )
            }
            aria-label="Toggle menu"
          >

            {mobileOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}

          </button>

        </div>

      </div>

      {/* =================================================
          MOBILE MENU
      ================================================= */}

      <AnimatePresence>

        {mobileOpen && (

          <motion.div
            className="og-mobile-menu"

            initial={{
              opacity: 0,
              height: 0,
            }}

            animate={{
              opacity: 1,
              height: "auto",
            }}

            exit={{
              opacity: 0,
              height: 0,
            }}
          >

            <div className="og-mobile-inner">

              {links.map(
                (link, index) => {

                  const Icon =
                    link.icon;

                  return (
                    <motion.div
                      key={link.path}

                      initial={{
                        opacity: 0,
                        x: -15,
                      }}

                      animate={{
                        opacity: 1,
                        x: 0,
                      }}

                      transition={{
                        delay:
                          index * 0.05,
                      }}
                    >

                      <NavLink
                        to={link.path}
                        end={
                          link.path === "/"
                        }
                        onClick={
                          closeMobile
                        }

                        className={({
                          isActive,
                        }) =>
                          `og-mobile-link ${
                            isActive
                              ? "og-mobile-active"
                              : ""
                          }`
                        }
                      >

                        {Icon ? (
                          <Icon size={18} />
                        ) : (
                          <Activity size={18} />
                        )}

                        <span>
                          {link.name}
                        </span>

                        {/* MOBILE DASHBOARD STATUS */}

                        {link.path ===
                          "/dashboard" && (
                          <span
                            className={`og-mobile-live ${
                              deviceOnline
                                ? "online"
                                : "offline"
                            }`}
                          >
                            {deviceOnline
                              ? "LIVE"
                              : "OFFLINE"}
                          </span>
                        )}

                      </NavLink>

                    </motion.div>
                  );
                }
              )}

              {/* MOBILE REAL DEVICE STATUS */}

              <div
                className={`og-mobile-status ${
                  deviceOnline
                    ? "online"
                    : "offline"
                }`}
              >

                {deviceOnline ? (
                  <Wifi size={15} />
                ) : (
                  <WifiOff size={15} />
                )}

                <span className="og-status-dot" />

                {deviceOnline
                  ? "DEVICE ONLINE"
                  : "DEVICE OFFLINE"}

              </div>

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </header>
  );
}

export default Navbar;