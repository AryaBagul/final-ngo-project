import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import ChatContainer from "../components/chat/ChatContainer"; 
function NgoDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [donations, setDonations] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);
const [notifications, setNotifications] = useState([]);
const [formLinks, setFormLinks] = useState({
  website: "",
  instagram: "",
  facebook: "",
  linkedin: ""
});

const [socialLinks, setSocialLinks] = useState({
  website: "",
  instagram: "",
  facebook: "",
  linkedin: ""
});

  // Profile info from localStorage
  const userName = localStorage.getItem("userName") || "NGO";
  const userEmail = localStorage.getItem("userEmail") || "";
  const initials = userName.slice(0, 2).toUpperCase();

  const userContact = localStorage.getItem("contactNumber") || "Not provided";
  const userAddress = localStorage.getItem("address") || "Not provided";
  const rawBirthdate = localStorage.getItem("birthdate");
  const userBirthdate = rawBirthdate ? new Date(rawBirthdate).toLocaleDateString() : "Not provided";

  let ngoDetails = {};
  try {
    const storedNgoDetails = localStorage.getItem("ngoDetails");
    if (storedNgoDetails) ngoDetails = JSON.parse(storedNgoDetails);
  } catch (e) { }

  // ── Events State ──────────────────────────────────────
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({ title: "", description: "", location: "", date: "", time: "", skillsRequired: "", volunteersNeeded: "" });
  const [eventError, setEventError] = useState("");

  // ── Urgent Needs State ────────────────────────────────
  const [needs, setNeeds] = useState([]);
  const [needsLoading, setNeedsLoading] = useState(false);
  const [showNeedForm, setShowNeedForm] = useState(false);
  const [needForm, setNeedForm] = useState({ title: "", description: "", itemsNeeded: "", location: "" });
  const [needError, setNeedError] = useState("");

  // ── Applications State ────────────────────────────────
  const [applications, setApplications] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [appsLoading, setAppsLoading] = useState(false);
 
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };
  const fetchUnreadCount = async () => {
  try {
    const res = await API.get("/chat/messages/unread-count", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    setUnreadCount(res.data.count);
  } catch (err) {
    console.error("Failed to fetch unread count", err);
  }
};
  // ── Fetch Events ──────────────────────────────────────
  const fetchEvents = async () => {
    setEventsLoading(true);
    setEventError("");
    try {
      const res = await API.get("/events/my-events");
      setEvents(res.data);
    } catch (err) {
      setEventError(err.response?.data?.message || "Failed to load events");
    } finally {
      setEventsLoading(false);
    }
  };
 const fetchNotifications = async () => {
  try {
    const res = await API.get("/notifications", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    setNotifications(res.data);
  } catch (err) {
    console.error("Failed to fetch notifications", err);
  }
};

  // ── Fetch Urgent Needs ────────────────────────────────
  const fetchNeeds = async () => {
    setNeedsLoading(true);
    setNeedError("");
    try {
      const res = await API.get("/urgent/my-needs");
      setNeeds(res.data);
    } catch (err) {
      setNeedError(err.response?.data?.message || "Failed to load urgent needs");
    } finally {
      setNeedsLoading(false);
    }
  };

  // ── Fetch Applications for an Event ──────────────────
  const fetchApplications = async (eventId, eventTitle) => {
    setSelectedEvent(eventTitle);
    setAppsLoading(true);
    try {
      const res = await API.get(`/applications/event/${eventId}`);
      setApplications(res.data);
    } catch (err) {
      setApplications([]);
    } finally {
      setAppsLoading(false);
    }
  };

  // ── Update Application Status ─────────────────────────
  const updateAppStatus = async (appId, status) => {
    try {
      await API.put(`/applications/${appId}`, { status });
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status } : a))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  // ── Create Event ──────────────────────────────────────
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...eventForm,
        skillsRequired: eventForm.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean),
        volunteersNeeded: Number(eventForm.volunteersNeeded) || undefined,
      };
      await API.post("/events/create", payload);
      setShowEventForm(false);
      setEventForm({ title: "", description: "", location: "", date: "", time: "", skillsRequired: "", volunteersNeeded: "" });
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create event");
    }
  };

  // ── Delete Event ──────────────────────────────────────
  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await API.delete(`/events/${id}`);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete event");
    }
  };

  // ── Create Urgent Need ────────────────────────────────
  const handleCreateNeed = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...needForm,
        itemsNeeded: needForm.itemsNeeded.split(",").map((s) => s.trim()).filter(Boolean),
      };
      await API.post("/urgent/create", payload);
      setShowNeedForm(false);
      setNeedForm({ title: "", description: "", itemsNeeded: "", location: "" });
      fetchNeeds();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to post urgent need");
    }
  };
useEffect(() => {
  fetchUnreadCount();

  const interval = setInterval(() => {
    fetchUnreadCount();
  }, 5000);

  return () => clearInterval(interval);
}, [localStorage.getItem("token")]);


  // Load data when tab changes
useEffect(() => {
  try {
    const storedNgo = localStorage.getItem("ngoDetails");
    if (storedNgo) {
      const parsed = JSON.parse(storedNgo);
      setSocialLinks(parsed);
      setFormLinks(parsed);
    }
  } catch (e) {}

  if (activeTab === "calendar") fetchEvents();
  if (activeTab === "needs") fetchNeeds();
  if (activeTab === "applications") fetchEvents();
  if (activeTab === "donations") fetchDonations();
    fetchNotifications();
}, [activeTab]);
  

  const menuItems = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "calendar", label: "Event Calendar", icon: "📅" },
    { id: "applications", label: "Applications", icon: "📋" },
    { id: "needs", label: "Urgent Needs", icon: "❗" },
    { id: "donations", label: "Donations", icon: "💰" },
    { id: "chat", label: "Connect with NGOs", icon: "💬" }, // ✅ ADD THIS
    
  ];
  const handleSaveLinks = async () => {
  try {
    const res = await API.put("/auth/update-links", {
      ...formLinks,
      userId: localStorage.getItem("userId")
    });

    const updatedUser = res.data.user;

    setSocialLinks(updatedUser.ngoDetails);
    localStorage.setItem("ngoDetails", JSON.stringify(updatedUser.ngoDetails));

    setShowLinkForm(false);
  } catch (err) {
    console.error(err);
  }
};

const fetchDonations = async () => {
  try {
    const ngoId = localStorage.getItem("userId");

    const res = await API.get(`/donations/ngo/${ngoId}`);

    if (res.data.success) {
      setDonations(res.data.donations);
    }
  } catch (err) {
    console.error("Failed to fetch NGO donations", err);
  }
};

  return (
    <div className="dashboard-wrapper">
      {/* LEFT SIDEBAR PANEL */}
      <div className="sidebar">
        <div className="sidebar-brand">
          <span style={{ fontSize: '28px' }}>🏢</span>
          <h2>NGO Panel</h2>
        </div>
        <nav className="sidebar-menu">
    {menuItems.map((item) => (
  <button
    key={item.id}
    className={`menu-item ${activeTab === item.id ? "active" : ""}`}
    onClick={() => setActiveTab(item.id)}
    style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span className="menu-icon">{item.icon}</span>
      {item.label}
    </div>

    {/* ✅ ADD BADGE HERE */}
    {item.id === "chat" && unreadCount > 0 && (
      <span
        style={{
          background: "red",
          color: "white",
          borderRadius: "50%",
          padding: "2px 6px",
          fontSize: "12px",
        }}
      >
        {unreadCount}
      </span>
    )}
  </button>
))}
        </nav>
        <button className="logout-btn-sidebar" onClick={handleLogout}>
          <span className="menu-icon">↪️</span> Logout
        </button>
      </div>

      {/* RIGHT MAIN CONTENT */}
      <div className="main-content">
        <header className="content-header">
          <h1>NGO Dashboard</h1>
          <div className="user-avatar-circle">{initials}</div>
        </header>

        <div className="dashboard-card">

          {/* ── PROFILE TAB ─────────────────────────────── */}
          {activeTab === "profile" && (
            <div className="profile-section">
              {showLinkForm && (
  <div className="ngo-links-modal-overlay">
    <div className="ngo-links-modal-box">

      <h3>Add Social Links</h3>

      <input placeholder="Website" value={formLinks.website}
        onChange={(e) => setFormLinks({ ...formLinks, website: e.target.value })} />

      <input placeholder="Instagram" value={formLinks.instagram}
        onChange={(e) => setFormLinks({ ...formLinks, instagram: e.target.value })} />

      <input placeholder="Facebook" value={formLinks.facebook}
        onChange={(e) => setFormLinks({ ...formLinks, facebook: e.target.value })} />

      <input placeholder="LinkedIn" value={formLinks.linkedin}
        onChange={(e) => setFormLinks({ ...formLinks, linkedin: e.target.value })} />

      <div style={{ marginTop: "10px" }}>
        <button onClick={handleSaveLinks}>Save</button>
        <button onClick={() => setShowLinkForm(false)}>Cancel</button>
      </div>

    </div>
  </div>
)}
              <div className="section-header" style={{ display: "flex", justifyContent: "space-between" }}>
  <h2>NGO Profile</h2>

  <button
    onClick={() => setShowLinkForm(true)}
    style={{
      padding: "6px 12px",
      backgroundColor: "#4C7A7A",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer"
    }}
  >
    Add Links
  </button>
</div>
              <div className="profile-grid">
                <div className="info-item">
                  <label>🏢 NGO Name</label>
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
                  <label>🎂 Found Date / Birthdate</label>
                  <p>{userBirthdate}</p>
                </div>
                <div className="info-item-wide">
                  <label>📍 Address</label>
                  <p>{userAddress}</p>
                </div>

                {ngoDetails.organizationName && (
                  <div className="info-item-wide" style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px' }}>
                    <label>🔖 Extended Details</label>
                    <p style={{ marginTop: '5px' }}><strong>Organization:</strong> {ngoDetails.organizationName}</p>
                    {ngoDetails.description && <p><strong>Description:</strong> {ngoDetails.description}</p>}
                    {ngoDetails.location && <p><strong>Location:</strong> {ngoDetails.location}</p>}
                  </div>
                )}

                <div className="info-item">
                  <label>🔑 Role</label>
                  <p style={{ textTransform: 'capitalize' }}>NGO</p>
                </div>
                <div className="info-item">
                  <label>✅ Status</label>
                  <p style={{ color: '#4C7A7A' }}>Active</p>
                </div>
                {(socialLinks.website || socialLinks.instagram || socialLinks.facebook || socialLinks.linkedin) && (
  <div className="info-item-wide">
    <label>🌐 Social Links</label>

    {socialLinks.website && (
      <p>🌐 <a href={socialLinks.website} target="_blank" rel="noreferrer">Website</a></p>
    )}

    {socialLinks.instagram && (
      <p>📸 <a href={socialLinks.instagram} target="_blank">Instagram</a></p>
    )}

    {socialLinks.facebook && (
      <p>📘 <a href={socialLinks.facebook} target="_blank"  rel="noreferrer">Facebook</a></p>
    )}

    {socialLinks.linkedin && (
      <p>💼 <a href={socialLinks.linkedin} target="_blank">LinkedIn</a></p>
    )}
  </div>
)}
              </div>
            </div>
            
          )}

          {/* ── EVENT CALENDAR TAB ──────────────────────── */}
          {activeTab === "calendar" && (
            <div>
              <div className="section-header">
                <h2>My Events</h2>
                <button className="action-btn" onClick={() => setShowEventForm(!showEventForm)}>
                  {showEventForm ? "✕ Cancel" : "＋ New Event"}
                </button>
              </div>

              {showEventForm && (
                <form onSubmit={handleCreateEvent} className="dashboard-form" style={{ marginBottom: '20px' }}>
                  <div className="input-group">
                    <label>Title *</label>
                    <input required value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} placeholder="Event title" />
                  </div>
                  <div className="input-group">
                    <label>Description</label>
                    <textarea className="dashboard-textarea" value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} placeholder="Describe the event" />
                  </div>
                  <div className="input-group">
                    <label>Location *</label>
                    <input required value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} placeholder="Event location" />
                  </div>
                  <div className="input-group">
                    <label>Date *</label>
                    <input required type="date" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>Time</label>
                    <input type="time" value={eventForm.time} onChange={e => setEventForm({ ...eventForm, time: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>Skills Required (comma-separated)</label>
                    <input value={eventForm.skillsRequired} onChange={e => setEventForm({ ...eventForm, skillsRequired: e.target.value })} placeholder="e.g. Teaching, Healthcare" />
                  </div>
                  <div className="input-group">
                    <label>Volunteers Needed</label>
                    <input type="number" value={eventForm.volunteersNeeded} onChange={e => setEventForm({ ...eventForm, volunteersNeeded: e.target.value })} placeholder="Number of volunteers" />
                  </div>
                  <button type="submit" className="auth-btn" style={{ backgroundColor: '#4C7A7A', marginTop: '8px' }}>Create Event</button>
                </form>
              )}

              {eventsLoading && <p style={{ padding: '20px', textAlign: 'center' }}>Loading events...</p>}
              {eventError && <p style={{ color: 'red', padding: '10px' }}>{eventError}</p>}

              {!eventsLoading && events.length === 0 && (
                <p style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>No events yet. Create your first event!</p>
              )}

              <div className="list-container">
                {events.map((ev) => (
                  <div key={ev._id} className="horizontal-card">
                    <div className="card-info">
                      <h3>{ev.title}</h3>
                      <p className="meta-text">
                        📅 {new Date(ev.date).toLocaleDateString()} &nbsp;
                        📍 {ev.location} &nbsp;
                        {ev.volunteersNeeded && `👥 ${ev.volunteersNeeded} needed`}
                      </p>
                      {ev.skillsRequired?.length > 0 && (
                        <p className="meta-text">🏷️ {ev.skillsRequired.join(", ")}</p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button className="outline-action-btn" onClick={() => { setActiveTab("applications"); fetchApplications(ev._id, ev.title); }}>
                        Applicants
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(ev._id)}
                        style={{ padding: '8px 14px', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── APPLICATIONS TAB ────────────────────────── */}
          {activeTab === "applications" && (
            <div>
              <div className="section-header">
                <h2>Applications {selectedEvent ? `— ${selectedEvent}` : ""}</h2>
                {!selectedEvent && (
                  <p style={{ opacity: 0.6, fontSize: '0.9rem', margin: 0 }}>Click "Applicants" on an event to view applications</p>
                )}
              </div>

              {!selectedEvent && (
                <div style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>
                  <p>Go to Event Calendar → Click "Applicants" on any event to see applications here.</p>
                </div>
              )}

              {appsLoading && <p style={{ padding: '20px', textAlign: 'center' }}>Loading applications...</p>}

              {!appsLoading && selectedEvent && applications.length === 0 && (
                <p style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>No applications yet for this event.</p>
              )}

              <div className="list-container">
                {applications.map((app) => (
                  <div key={app._id} className="horizontal-card">
                    <div className="card-info">
                      <h3>{app.volunteer?.name || "Unknown Volunteer"}</h3>
                      <p className="meta-text">✉️ {app.volunteer?.email}</p>
                      <p className="meta-text">
                        Status: <span style={{ fontWeight: 700, color: app.status === 'approved' ? '#00C853' : app.status === 'rejected' ? '#ff4444' : '#4C7A7A', textTransform: 'capitalize' }}>{app.status}</span>
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={() => updateAppStatus(app._id, "approved")}
                        disabled={app.status === "approved"}
                        style={{ padding: '8px 14px', background: app.status === "approved" ? '#ccc' : '#00C853', color: '#fff', border: 'none', borderRadius: '8px', cursor: app.status === "approved" ? 'not-allowed' : 'pointer', fontWeight: '600' }}
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => updateAppStatus(app._id, "rejected")}
                        disabled={app.status === "rejected"}
                        style={{ padding: '8px 14px', background: app.status === "rejected" ? '#ccc' : '#ff4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: app.status === "rejected" ? 'not-allowed' : 'pointer', fontWeight: '600' }}
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === "chat" && (
  <div style={{ height: "80vh" }}>
    
 <ChatContainer refreshUnread={fetchUnreadCount} />
  </div>
)}

          {/* ── URGENT NEEDS TAB ────────────────────────── */}
          {activeTab === "needs" && (
            <div>
              <div className="section-header">
                <h2>Urgent Needs</h2>
                <button className="action-btn" onClick={() => setShowNeedForm(!showNeedForm)}>
                  {showNeedForm ? "✕ Cancel" : "＋ Post Need"}
                </button>
              </div>

              {showNeedForm && (
                <form onSubmit={handleCreateNeed} className="dashboard-form" style={{ marginBottom: '20px' }}>
                  <div className="input-group">
                    <label>Title *</label>
                    <input required value={needForm.title} onChange={e => setNeedForm({ ...needForm, title: e.target.value })} placeholder="e.g. Emergency Blankets Needed" />
                  </div>
                  <div className="input-group">
                    <label>Description *</label>
                    <textarea className="dashboard-textarea" required value={needForm.description} onChange={e => setNeedForm({ ...needForm, description: e.target.value })} placeholder="Describe the urgent need" />
                  </div>
                  <div className="input-group">
                    <label>Items Needed (comma-separated)</label>
                    <input value={needForm.itemsNeeded} onChange={e => setNeedForm({ ...needForm, itemsNeeded: e.target.value })} placeholder="e.g. Blankets, Food packets, Medicines" />
                  </div>
                  <div className="input-group">
                    <label>Location *</label>
                    <input required value={needForm.location} onChange={e => setNeedForm({ ...needForm, location: e.target.value })} placeholder="Location" />
                  </div>
                  <button type="submit" className="auth-btn" style={{ backgroundColor: '#4C7A7A', marginTop: '8px' }}>Post Urgent Need</button>
                </form>
              )}

              {needsLoading && <p style={{ padding: '20px', textAlign: 'center' }}>Loading...</p>}
              {needError && <p style={{ color: 'red', padding: '10px' }}>{needError}</p>}

              {!needsLoading && needs.length === 0 && (
                <p style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>No urgent needs posted yet.</p>
              )}

              <div className="list-container">
                {needs.map((need) => (
                  <div key={need._id} className="horizontal-card">
                    <div className="card-info">
                      <h3>{need.title}</h3>
                      <p className="by-text">{need.description}</p>
                      {need.itemsNeeded?.length > 0 && (
                        <p className="meta-text">📦 {need.itemsNeeded.join(", ")}</p>
                      )}
                      <p className="meta-text">📍 {need.location}</p>
                    </div>
                  </div>
                  
                ))}
                
              </div>
            </div>
          )}
          {activeTab === "donations" && (
  <div>
    <div className="section-header">
      <h2>Received Donations</h2>
    </div>

    <div className="list-container">
      {donations.length > 0 ? (
        donations.map((d) => (
          <div key={d._id} className="horizontal-card">
            <div className="card-info">
              
              <h3>{d.donor?.name || "Unknown Donor"}</h3>

              <p className="meta-text">
                {d.type === "money"
                  ? `💰 ₹${d.amount}`
                  : `📦 ${d.items}`}
              </p>

              <p className="meta-text">
                📅 {new Date(d.createdAt).toLocaleDateString()}
              </p>

              <p className="meta-text">
                Status:{" "}
                <span style={{
                  color: d.status === "completed" ? "green" : "orange",
                  fontWeight: "bold"
                }}>
                  {d.status}
                </span>
              </p>
            </div>

            {/* OPTIONAL: update status */}
   {d.status !== "completed" ? (
  <button
    onClick={async () => {
      try {
        await API.put(
          `/donations/${d._id}/status`,
          { status: "completed" },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        fetchDonations();
      } catch (err) {
        console.error(err);
      }
    }}
    className="green-btn"
  >
    Mark Completed
  </button>
) : (
  <button
    className="green-btn"
    style={{ backgroundColor: "#ccc", cursor: "not-allowed" }}
    disabled
  >
    Completed
  </button>
)}

          </div>
        ))
      ) : (
        <p>No donations received yet.</p>
      )}
    </div>
  </div>
)}

        </div>
      </div>
    </div>
  );
}

export default NgoDashboard;