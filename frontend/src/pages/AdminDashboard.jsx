import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function AdminDashboard() {
  const [ngos, setNgos] = useState([]);
  const [events, setEvents] = useState([]);
  const [donations, setDonations] = useState([]);
  const [activeTab, setActiveTab] = useState("ngos");

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ngoRes = await API.get("/admin/ngos");
      const eventRes = await API.get("/admin/events");
      const donationRes = await API.get("/admin/donations");

      setNgos(ngoRes.data || []);
      setEvents(eventRes.data || []);
      setDonations(donationRes.data || []);
    } catch (err) {
      console.error("Admin fetch error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="dashboard-wrapper">

      {/* SIDEBAR */}
      <div className="sidebar donor-sidebar">
        <div className="sidebar-brand">
          <h2>🛠 Admin Panel</h2>
        </div>

        <button
          className={`menu-item ${activeTab === "ngos" ? "active" : ""}`}
          onClick={() => setActiveTab("ngos")}
        >
          🏢 NGOs
        </button>

        <button
          className={`menu-item ${activeTab === "events" ? "active" : ""}`}
          onClick={() => setActiveTab("events")}
        >
          📅 Events
        </button>

        <button
          className={`menu-item ${activeTab === "donations" ? "active" : ""}`}
          onClick={() => setActiveTab("donations")}
        >
          💰 Donations
        </button>

        <button className="logout-btn-sidebar" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        <h1>Admin Dashboard</h1>

        {/* STATS CARDS */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <div className="dashboard-card">
            <h3>Total NGOs</h3>
            <p>{ngos.length}</p>
          </div>

          <div className="dashboard-card">
            <h3>Total Events</h3>
            <p>{events.length}</p>
          </div>

          <div className="dashboard-card">
            <h3>Total Donations</h3>
            <p>{donations.length}</p>
          </div>
        </div>

        {/* NGOs */}
        {activeTab === "ngos" && (
          <div className="dashboard-card">
            <h2>NGOs</h2>
            {ngos.map((ngo) => (
              <p key={ngo._id}>
                <strong>{ngo.name}</strong> — {ngo.email}
              </p>
            ))}
          </div>
        )}

        {/* EVENTS */}
        {activeTab === "events" && (
          <div className="dashboard-card">
            <h2>Events</h2>
            {events.map((event) => (
              <p key={event._id}>
                <strong>{event.title}</strong> — {event.location}
              </p>
            ))}
          </div>
        )}

        {/* DONATIONS */}
        {activeTab === "donations" && (
          <div className="dashboard-card">
            <h2>Donations</h2>
            {donations.map((d) => (
              <p key={d._id}>
                ₹{d.amount} — {d.status}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;