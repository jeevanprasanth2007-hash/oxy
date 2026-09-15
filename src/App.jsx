import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Alerts from "./pages/Alerts";
import Device from "./pages/Device";
import About from "./pages/About";

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/analytics"
          element={<Analytics />}
        />

        <Route
          path="/alerts"
          element={<Alerts />}
        />

        <Route
          path="/device"
          element={<Device />}
        />

        <Route
          path="/about"
          element={<About />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;