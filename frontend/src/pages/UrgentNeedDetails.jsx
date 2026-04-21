import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function UrgentNeedDetails() {
  const { id } = useParams();
  const [need, setNeed] = useState(null);

  useEffect(() => {
    fetch(`https://ngoconnect-backend-xnyv.onrender.com/api/urgent/${id}`)
      .then(res => res.json())
      .then(data => setNeed(data))
      .catch(err => console.error(err));
  }, [id]);

  if (!need) return <p style={{ padding: "20px" }}>Loading...</p>;

 return (
  <div style={{ padding: "40px", background: "#f5f7fb", minHeight: "100vh" }}>
    <div
      style={{
        maxWidth: "700px",
        margin: "auto",
        background: "#ffffff",
        padding: "30px",
        borderRadius: "14px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        borderTop: "6px solid #1890ff", // 🔵 BLUE BORDER
      }}
    >
      <h2 style={{ marginBottom: "15px", color: "#1f2937" }}>
        🚨 Urgent Need Details
      </h2>

      <h3 style={{ color: "#1890ff", marginBottom: "15px" }}>
        {need?.ngo?.ngoDetails?.organizationName ||
          need?.ngo?.name ||
          "NGO"}
      </h3>

      <div style={{ marginBottom: "12px" }}>
        <strong style={{ color: "#374151" }}>📍 Location:</strong>{" "}
        <span style={{ color: "#555" }}>{need?.location}</span>
      </div>

      <div style={{ marginBottom: "12px" }}>
        <strong style={{ color: "#374151" }}>Description:</strong>
        <p style={{ marginTop: "5px", color: "#555", lineHeight: "1.6" }}>
          {need?.description}
        </p>
      </div>

      <div style={{ marginBottom: "12px" }}>
        <strong style={{ color: "#374151" }}>Items Needed:</strong>
        <p style={{ marginTop: "5px", color: "#555" }}>
          {need?.itemsNeeded?.join(", ")}
        </p>
      </div>

      {/* 🔥 OPTIONAL BUTTON */}
      <button
        style={{
          marginTop: "15px",
          padding: "10px 18px",
          background: "#1890ff",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          transition: "0.2s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "#1677cc")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "#1890ff")
        }
      >
        Donate Now
      </button>
    </div>
  </div>
);
}
export default UrgentNeedDetails;