import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function VolunteerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  const userName = localStorage.getItem("userName") || "Volunteer";
  const userEmail = localStorage.getItem("userEmail") || "";
  const initials = userName.slice(0, 2).toUpperCase();
  
  const userContact = localStorage.getItem("contactNumber") || "Not provided";
  const userAddress = localStorage.getItem("address") || "Not provided";
  const rawBirthdate = localStorage.getItem("birthdate");
  const userBirthdate = rawBirthdate ? new Date(rawBirthdate).toLocaleDateString() : "Not provided";

  // ── Events State ──────────────────────────────────────
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState("");
  const [applyingId, setApplyingId] = useState(null); // which event is being applied to
  const [appliedIds, setAppliedIds] = useState(new Set()); // track applied events

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // ── Fetch All Events ──────────────────────────────────
  const fetchEvents = async () => {
    setEventsLoading(true);
    setEventsError("");
    try {
      const res = await API.get("/events");
      setEvents(res.data);
    } catch (err) {
      setEventsError(err.response?.data?.message || "Failed to load events");
    } finally {
      setEventsLoading(false);
    }
  };

  // ── Apply to an Event ─────────────────────────────────
  const handleApply = async (eventId) => {
    setApplyingId(eventId);
    try {
      await API.post(`/applications/apply/${eventId}`);
      setAppliedIds((prev) => new Set([...prev, eventId]));
      alert("Application submitted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to apply");
    } finally {
      setApplyingId(null);
    }
  };

  useEffect(() => {
    if (activeTab === "calendar" || activeTab === "directory") fetchEvents();
  }, [activeTab]);

  // ── Derive unique NGOs from events list ───────────────
  const ngoDirectory = events.reduce((acc, ev) => {
    if (ev.ngo && ev.ngo._id) {
      const existing = acc.find((n) => n._id === ev.ngo._id);
      if (!existing) {
        acc.push({ _id: ev.ngo._id, name: ev.ngo.name, email: ev.ngo.email });
      }
    }
    return acc;
  }, []);

  const menuItems = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "calendar", label: "Event Calendar", icon: "📅" },
    { id: "directory", label: "NGO Directory", icon: "🏢" },
  ];

  return (
    <div className="dashboard-wrapper">
      {/* BLUE SIDEBAR */}
      <div className="sidebar volunteer-sidebar">
        <div className="sidebar-brand">
          <span style={{ fontSize: '24px' }}>👥</span>
          <h2>Volunteer</h2>
        </div>
        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`menu-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="menu-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <button className="logout-btn-sidebar" onClick={handleLogout}>
          <span className="menu-icon">↪️</span> Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        <header className="content-header">
          <h1>Volunteer Dashboard</h1>
          <div className="user-avatar-circle volunteer-avatar">{initials}</div>
        </header>

        <div className="dashboard-card">

          {/* ── PROFILE TAB ─────────────────────────────── */}
          {activeTab === "profile" && (
            <div className="profile-section">
              <div className="section-header">
                <h2>Volunteer Profile</h2>
              </div>
              <div className="profile-grid">
                <div className="info-item">
                  <label>👤 Full Name</label>
                  <p>{userName}</p>
                </div>
                <div className="info-item">
                  <label>✉️ Email</label>
                  <p>{userEmail}</p>
                </div>
                <div className="info-item">
                  <label>📞 Contact</label>
                  <p>{userContact}</p>
                </div>
                <div className="info-item">
                  <label>🎂 Birthdate</label>
                  <p>{userBirthdate}</p>
                </div>
                <div className="info-item-wide">
                  <label>📍 Address</label>
                  <p>{userAddress}</p>
                </div>
                <div className="info-item">
                  <label>🔑 Role</label>
                  <p>Volunteer</p>
                </div>
                <div className="info-item">
                  <label>✅ Status</label>
                  <p style={{ color: '#C76D5E' }}>Active</p>
                </div>
              </div>
            </div>
          )}

          {/* ── EVENT CALENDAR TAB ──────────────────────── */}
          {activeTab === "calendar" && (
            <div>
              <div className="section-header">
                <h2>Available Events</h2>
              </div>

              {eventsLoading && <p style={{ padding: '20px', textAlign: 'center' }}>Loading events...</p>}
              {eventsError && <p style={{ color: 'red', padding: '10px' }}>{eventsError}</p>}

              {!eventsLoading && events.length === 0 && (
                <p style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>No events available right now.</p>
              )}

              <div className="list-container">
                {events.map((ev) => {
                  const alreadyApplied = appliedIds.has(ev._id);
                  return (
                    <div key={ev._id} className="horizontal-card">
                      <div className="card-info">
                        <h3>{ev.title}</h3>
                        {ev.ngo?.name && <p className="by-text">by {ev.ngo.name}</p>}
                        <p className="meta-text">
                          📅 {new Date(ev.date).toLocaleDateString()} &nbsp;
                          📍 {ev.location}
                          {ev.volunteersNeeded && ` &nbsp; 👥 ${ev.volunteersNeeded} needed`}
                        </p>
                        {ev.skillsRequired?.length > 0 && (
                          <p className="meta-text">🏷️ {ev.skillsRequired.join(", ")}</p>
                        )}
                      </div>
                      <button
                        className="blue-btn"
                        disabled={alreadyApplied || applyingId === ev._id}
                        onClick={() => handleApply(ev._id)}
                        style={{
                          opacity: alreadyApplied ? 0.6 : 1,
                          cursor: alreadyApplied ? 'default' : 'pointer',
                          flexShrink: 0
                        }}
                      >
                        {alreadyApplied ? "✓ Applied" : applyingId === ev._id ? "Applying..." : "Apply"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── NGO DIRECTORY TAB ───────────────────────── */}
          {activeTab === "directory" && (
            <div className="directory-section">
              <div className="section-header">
                <h2>NGO Directory</h2>
              </div>

              {eventsLoading && <p style={{ padding: '20px', textAlign: 'center' }}>Loading...</p>}

              {!eventsLoading && ngoDirectory.length === 0 && (
                <p style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>No NGOs have posted events yet.</p>
              )}

              <div className="list-container">
                {ngoDirectory.map((ngo) => (
                  <div key={ngo._id} className="horizontal-card">
                    <div className="card-info">
                      <h3>{ngo.name}</h3>
                      <p className="meta-text">✉️ {ngo.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default VolunteerDashboard;
