import { useState, useEffect } from "react";
import RoleCard from "../components/RoleCard";
import "../styles/auth.css";
import bg from "../assets/home-bg.jpg";
import axios from "axios";

function AuthLanding() {
    const [totalUsers, setTotalUsers] = useState(0);

    // --- DRAGGABLE STATE ---
    const [position, setPosition] = useState({ x: window.innerWidth - 180, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const res = await axios.get(""https://ngoconnect-backend-xnyv.onrender.com/api/auth/user-count"");
                setTotalUsers(res.data.count);
            } catch (err) {
                console.error("Failed to fetch user count", err);
            }
        };
        fetchCount();
    }, []);

    // --- DRAG LOGIC ---
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    return (
        <div className="landing" style={{ backgroundImage: `url(${bg})` }}>
            <div className="overlay" />

            <div className="landing-content">

                {/* --- MOVABLE DRAGGABLE CARD --- */}
                <div
                    onMouseDown={handleMouseDown}
                    style={{
                        position: "fixed", // Changed to fixed so it stays relative to screen
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                        cursor: isDragging ? "grabbing" : "grab",
                        background: "#FFFFFF",
                        padding: "15px 20px",
                        borderRadius: "20px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                        border: "1px solid #eee",
                        zIndex: 1000,
                        minWidth: "140px",
                        userSelect: "none", // Prevents text selection while dragging
                        transition: isDragging ? "none" : "all 0.1s ease-out" // Smoothness
                    }}
                >
                    <div style={{ fontSize: "1.2rem", marginBottom: "5px" }}>🛡️</div>
                    <h2 style={{ fontSize: "1.8rem", margin: 0, color: "#2D3436", fontWeight: "800" }}>
                        {totalUsers}+
                    </h2>
                    <p style={{ fontSize: "0.85rem", margin: "5px 0 0 0", color: "#636E72", fontWeight: "600" }}>
                        trusted users
                    </p>
                    <div style={{ width: "30px", height: "3px", background: "#00b894", marginTop: "10px" }} />
                </div>

                <h1 className="title">NGOConnect</h1>
                <p className="tagline">
                    Building trust. Enabling collaboration. Creating impact together.
                </p>

                <div className="cards">
                    <RoleCard role="ngo" title="NGO" desc="Organize initiatives and manage volunteers" />
                    <RoleCard role="volunteer" title="Volunteer" desc="Support NGOs and contribute your time" />
                    <RoleCard role="donor" title="Donor" desc="Fund impactful causes and communities" />
                </div>
            </div>
        </div>
    );
}

export default AuthLanding;
