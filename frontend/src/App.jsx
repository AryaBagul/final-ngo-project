import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthLanding from "./pages/AuthLanding";
import RoleAuth from "./pages/RoleAuth";
import DonorDashboard from "./pages/DonorDashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import NgoDashboard from "./pages/NgoDashboard";
import PrivateRoute from "./utils/PrivateRoute";
import AdminDashboard from "./pages/AdminDashboard";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home & Auth */}
        <Route path="/" element={<AuthLanding />} />
        <Route path="/auth/:role" element={<RoleAuth />} />

        {/* Role-Based Dashboards */}
        <Route
          path="/donor-dashboard"
          element={
            <PrivateRoute>
              <DonorDashboard />
            </PrivateRoute>
          }
        />
         <Route
      path="/admin"
      element={
        <PrivateRoute>
          <AdminDashboard />
        </PrivateRoute>
      }
    />
        <Route
          path="/volunteer-dashboard"
          element={
            <PrivateRoute>
              <VolunteerDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/ngo-dashboard"
          element={
            <PrivateRoute>
              <NgoDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
