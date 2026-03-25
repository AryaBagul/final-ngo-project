import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import ChatContainer from "../components/chat/ChatContainer";

function NgoDashboard() {
const navigate = useNavigate();
const [activeTab, setActiveTab] = useState("profile");

const userName = localStorage.getItem("userName") || "NGO";
const userEmail = localStorage.getItem("userEmail") || "";
const initials = userName.slice(0, 2).toUpperCase();

const userContact = localStorage.getItem("contactNumber") || "Not provided";
const userAddress = localStorage.getItem("address") || "Not provided";
const rawBirthdate = localStorage.getItem("birthdate");
const userBirthdate = rawBirthdate
? new Date(rawBirthdate).toLocaleDateString()
: "Not provided";

const [events, setEvents] = useState([]);
const [eventsLoading, setEventsLoading] = useState(false);
const [eventError, setEventError] = useState("");

const [needs, setNeeds] = useState([]);
const [needsLoading, setNeedsLoading] = useState(false);
const [needError, setNeedError] = useState("");

const handleLogout = () => {
localStorage.clear();
navigate("/");
};

const fetchEvents = async () => {
setEventsLoading(true);
try {
const res = await API.get("/events/my-events");
setEvents(res.data);
} catch (err) {
setEventError("Failed to load events");
} finally {
setEventsLoading(false);
}
};

const fetchNeeds = async () => {
setNeedsLoading(true);
try {
const res = await API.get("/urgent/my-needs");
setNeeds(res.data);
} catch (err) {
setNeedError("Failed to load urgent needs");
} finally {
setNeedsLoading(false);
}
};

useEffect(() => {
if (activeTab === "calendar") fetchEvents();
if (activeTab === "needs") fetchNeeds();
}, [activeTab]);

const menuItems = [
{ id: "profile", label: "Profile", icon: "👤" },
{ id: "calendar", label: "Event Calendar", icon: "📅" },
{ id: "applications", label: "Applications", icon: "📋" },
{ id: "needs", label: "Urgent Needs", icon: "❗" },
{ id: "chat", label: "Connect with NGOs", icon: "💬" },
];

return ( <div className="dashboard-wrapper">
{/* SIDEBAR */} <div className="sidebar"> <div className="sidebar-brand">
<span style={{ fontSize: "28px" }}>🏢</span> <h2>NGO Panel</h2> </div>


    <nav className="sidebar-menu">
      {menuItems.map((item) => (
        <button
          key={item.id}
          className={`menu-item ${
            activeTab === item.id ? "active" : ""
          }`}
          onClick={() => setActiveTab(item.id)}
        >
          <span className="menu-icon">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>

    <button className="logout-btn-sidebar" onClick={handleLogout}>
      ↪️ Logout
    </button>
  </div>

  {/* MAIN CONTENT */}
  <div className="main-content">
    <header className="content-header">
      <h1>NGO Dashboard</h1>
      <div className="user-avatar-circle">{initials}</div>
    </header>

    <div className="dashboard-card">
      {/* PROFILE */}
      {activeTab === "profile" && (
        <div>
          <h2>Profile</h2>
          <p>{userName}</p>
          <p>{userEmail}</p>
        </div>
      )}

      {/* EVENTS */}
      {activeTab === "calendar" && (
        <div>
          <h2>Events</h2>
          {events.map((e) => (
            <p key={e._id}>{e.title}</p>
          ))}
        </div>
      )}

      {/* NEEDS */}
      {activeTab === "needs" && (
        <div>
          <h2>Urgent Needs</h2>
          {needs.map((n) => (
            <p key={n._id}>{n.title}</p>
          ))}
        </div>
      )}

      {/* CHAT */}
      {activeTab === "chat" && (
        <div style={{ height: "80vh" }}>
          <h2>Connect with Other NGOs</h2>
          <ChatContainer />
        </div>
      )}
    </div>
  </div>
</div>


);
}

export default NgoDashboard;
