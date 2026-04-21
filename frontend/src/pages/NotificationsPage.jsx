import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://ngoconnect-backend-xnyv.onrender.com/api/notifications", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(res => res.json())
      .then(data => setNotifications(data));
  }, []);

  const markAsRead = async (id) => {
    await fetch(`https://ngoconnect-backend-xnyv.onrender.com/api/notifications/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  };

  return (
    <div style={{ padding: "30px", background: "#f5f7fb", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: "10px" }}>🔔 Notifications</h2>

      {/* Count */}
      <p style={{ color: "#666", marginBottom: "20px" }}>
        {notifications.length} total notifications
      </p>

      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <>
          {notifications.map((n) => {
            const ngoName =
              n.referenceId?.ngo?.ngoDetails?.organizationName ||
              n.referenceId?.ngo?.name ||
              "NGO";

            // 🎨 COLOR LOGIC
            let borderColor = "#ccc";
            let bgColor = "#fff";

            if (!n.isRead) {
              if (n.type === "urgent_need") {
                borderColor = "#ff4d4f";     // red
                bgColor = "#fff1f0";
              } else if (n.type === "donation") {
                borderColor = "#52c41a";     // green
                bgColor = "#f6ffed";
              } else {
                borderColor = "#1890ff";     // blue
                bgColor = "#e6f7ff";
              }
            }

            return (
              <div
                key={n._id}
                onClick={() => {
                  markAsRead(n._id);
                  navigate(`/urgent-need/${n.referenceId?._id}`);
                }}
                style={{
                  background: bgColor,
                  padding: "18px",
                  marginBottom: "15px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  cursor: "pointer",
                  borderLeft: `6px solid ${borderColor}`,
                  transition: "0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.01)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <h3 style={{ margin: 0 }}>{ngoName}</h3>

                <p style={{ margin: "8px 0", color: "#555" }}>
                  📍 {n.referenceId?.location}
                </p>

                <small style={{ color: "#888" }}>
                  {new Date(n.createdAt).toLocaleString()}
                </small>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default NotificationsPage;