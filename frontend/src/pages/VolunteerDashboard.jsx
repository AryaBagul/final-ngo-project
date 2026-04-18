import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function VolunteerDashboard() {
  const [notifications, setNotifications] = useState([]);
const [showDropdown, setShowDropdown] = useState(false);
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
  const [applications, setApplications] = useState([]);
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
  const fetchApplications = async () => {
    try {
      const res = await API.get("/applications/my");
      setApplications(res.data);
    } catch (err) {
      console.error("Failed to fetch applications");
    }
  };
  // ── Apply to an Event ─────────────────────────────────
  const handleApply = async (eventId) => {
    setApplyingId(eventId);
    try {
      await API.post(`/applications/apply/${eventId}`);

      alert("Application submitted successfully!");

      fetchApplications(); // ✅ fetch real data from DB

    } catch (err) {
      alert(err.response?.data?.message || "Failed to apply");
    } finally {
      setApplyingId(null);
    }
  };
  useEffect(() => {
    if (activeTab === "calendar" || activeTab === "directory") fetchEvents();
  }, [activeTab]);
  useEffect(() => { 
    fetchApplications();
  }, []);
   useEffect(() => {
  fetchNotifications();
}, []);
useEffect(() => {
  const handleClickOutside = () => {
    setShowDropdown(false);
  };

  document.addEventListener("click", handleClickOutside);

  return () => {
    document.removeEventListener("click", handleClickOutside);
  };
}, []);
  const fetchNotifications = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/notifications", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();
    setNotifications(data);
  } catch (err) {
    console.error(err);
  }
 
};
  // ── Derive unique NGOs from events list ───────────────
  const ngoDirectory = events.reduce((acc, ev) => {
    if (ev.ngo && ev.ngo._id) {
      const existing = acc.find((n) => n._id === ev.ngo._id);
      if (!existing) {
        acc.push({
          _id: ev.ngo._id,
          name: ev.ngo.name,
          email: ev.ngo.email,
          ngoDetails: ev.ngo.ngoDetails, // ✅ ADD THIS
        });
      }
    }
    return acc;
  }, []);

  const menuItems = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "calendar", label: "Event Calendar", icon: "📅" },
    { id: "directory", label: "NGO Directory", icon: "🏢" },
  ];
const markAsRead = async (id) => {
  try {
    await fetch(`http://localhost:5000/api/notifications/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    setNotifications((prev) =>
      prev.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      )
    );
  } catch (err) {
    console.error(err);
  }
};
const unreadCount = (notifications || []).filter(function(n) {
  return !n.isRead;
}).length;
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
        <header className="content-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

  <h1>Volunteer Dashboard</h1>

  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>

    <div
  onClick={(e) => {
    e.stopPropagation();
    setShowDropdown(prev => !prev);
  }}
  style={{ position: "relative", cursor: "pointer", fontSize: "20px" }}
>
  🔔 {unreadCount}
      {showDropdown && (
  <div
    style={{
      position: "absolute",
      right: 0,
      top: "30px",
      width: "280px",
      background: "#fff",
      border: "1px solid #ddd",
      borderRadius: "8px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
      zIndex: 1000
    }}
  >
    {notifications.length === 0 ? (
      <p style={{ padding: "10px" }}>No notifications</p>
    ) : (
      notifications.map((n) => (
        <div
          key={n._id}
          onClick={(e) => {
            e.stopPropagation();
            markAsRead(n._id);
            setShowDropdown(false);

            if (n.referenceId?._id) {
              navigate(`/urgent-need/${n.referenceId._id}`);
            }
          }}
          style={{
            padding: "10px",
            borderBottom: "1px solid #eee",
            background: n.isRead ? "#f9f9f9" : "#e6f7ff",
            cursor: "pointer"
          }}
        >
          {n.message}
        </div>
      ))
    )}

    {/* ✅ VIEW ALL BUTTON */}
    <div
      onClick={(e) => {
        e.stopPropagation();
        setShowDropdown(false);
        navigate("/notifications");
      }}
      style={{
        padding: "10px",
        textAlign: "center",
        cursor: "pointer",
        fontWeight: "bold",
        borderTop: "1px solid #eee"
      }}
    >
      View All Notifications
    </div>
  </div>
)}
    </div>

    <div className="user-avatar-circle volunteer-avatar">{initials}</div>

  </div>
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
                  const application = applications.find(
                    (app) => app?.event?._id === ev._id
                  );

                  const alreadyApplied = !!application;
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
                      {application ? (
                        <span
                          style={{
                            fontWeight: "bold",
                            padding: "8px 14px",
                            borderRadius: "8px",
                            backgroundColor:
                              application.status === "approved"
                                ? "#d4edda"
                                : application.status === "rejected"
                                  ? "#f8d7da"
                                  : "#fff3cd",
                            color:
                              application.status === "approved"
                                ? "green"
                                : application.status === "rejected"
                                  ? "red"
                                  : "orange",
                          }}
                        >
                          {application.status.toUpperCase()}
                        </span>
                      ) : (
                        <button
                          className="blue-btn"
                          disabled={applyingId === ev._id}
                          onClick={() => handleApply(ev._id)}
                        >
                          {applyingId === ev._id ? "Applying..." : "Apply"}
                        </button>
                      )}
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
                      {/* 1. Organization & Location */}
                      {ngo.ngoDetails && (
                        <p className="meta-text">
                          {ngo.ngoDetails.organizationName && `🏢 ${ngo.ngoDetails.organizationName} `}
                          {ngo.ngoDetails.location && `📍 ${ngo.ngoDetails.location}`}
                        </p>
                      )}

                      {/* 2. Description */}
                      {ngo.ngoDetails?.description && (
                        <p className="desc-text">{ngo.ngoDetails.description}</p>
                      )}

                      {/* 3. Social Links */}
                      {ngo.ngoDetails && (
                        <div style={{ marginTop: "8px" }}>
                          {ngo.ngoDetails.website && (
                            <p>
                              🌐{" "}
                              <a href={ngo.ngoDetails.website} target="_blank" rel="noreferrer">
                                {ngo.ngoDetails.website}
                              </a>
                            </p>
                          )}

                          {ngo.ngoDetails.instagram && (
                            <p>
                              📸{" "}
                              <a href={ngo.ngoDetails.instagram} target="_blank" rel="noreferrer">
                                Instagram
                              </a>
                            </p>
                          )}

                          {ngo.ngoDetails.facebook && (
                            <p>
                              📘{" "}
                              <a href={ngo.ngoDetails.facebook} target="_blank" rel="noreferrer">
                                Facebook
                              </a>
                            </p>
                          )}

                          {/* (End of LinkedIn link) */}
                          {ngo.ngoDetails.linkedin && (
                            <p>
                              💼{" "}
                              <a href={ngo.ngoDetails.linkedin} target="_blank" rel="noreferrer">
                                LinkedIn
                              </a>
                            </p>
                          )}
                        </div>
                      )}
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

