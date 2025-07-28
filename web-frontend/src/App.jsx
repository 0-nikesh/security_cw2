import L from "leaflet";
import "leaflet-routing-machine";
import 'leaflet/dist/leaflet.css';
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Admin from "./core/private/admin"; // Admin panel
import PrivateRoute from "./core/private/privateroute"; // PrivateRoute component
import Dashboard from "./core/public/dashboard/dashboard";
import Documents from "./core/public/documents/document";
import GuidanceDetail from "./core/public/documents/guidance_details";
import Forbidden from "./core/public/forbidden";
import ForgotPassword from "./core/public/forgot-password";
import GovernmentProfiles from "./core/public/government-profiles/government-profile";
import GovernmentProfileDetail from "./core/public/government-profiles/government_details";
import Login from "./core/public/login/index";
import MyMapComponent from "./core/public/map";
import Profile from "./core/public/profile";
import Register from "./core/public/register";
import ResetPassword from "./core/public/reset-password";

// Make L globally available
window.L = L;

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/check" element={<MyMapComponent />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/profile/:id" element={<Profile />} />

        <Route path="/documents/:id" element={<GuidanceDetail />} />
        <Route path="/government" element={<GovernmentProfiles />} />
        <Route path="/government/:id" element={<GovernmentProfileDetail />} />

        {/* Private Routes */}

        <Route
          path="/admin"
          element={
            <PrivateRoute isAdminRequired={true}>
              <Admin />
            </PrivateRoute>
          }
        />

        {/* Error Route */}
        <Route path="/403" element={<Forbidden />} />
      </Routes>
    </Router>
  );
}

export default App;

