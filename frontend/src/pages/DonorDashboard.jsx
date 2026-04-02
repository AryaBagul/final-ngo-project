import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function DonorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  // State
  const [ngos, setNgos] = useState([]);
  const [donations, setDonations] = useState([]);
  const [donateForm, setDonateForm] = useState({
    ngo: "",
    type: "money",
    amount: "",
    items: "",
    paymentMethod: "online",
  });

  const userName = localStorage.getItem("userName") || "Sarah Johnson";
  const userEmail = localStorage.getItem("userEmail") || "sarah.johnson@email.com";
  const userId = localStorage.getItem("userId");

  const userContact = localStorage.getItem("contactNumber") || "Not provided";
  const userAddress = localStorage.getItem("address") || "Not provided";
  const rawBirthdate = localStorage.getItem("birthdate");
  const userBirthdate = rawBirthdate ? new Date(rawBirthdate).toLocaleDateString() : "Not provided";

  // Initializeials from name
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : "SJ";
  };

  useEffect(() => {
    fetchNGOs();
    fetchDonations();
  }, [activeTab]); // Refetch when tabs change to keep data fresh

  const fetchNGOs = async () => {
    try {
      const res = await API.get("/auth/ngos");
      if (res.data.success) {
        setNgos(res.data.ngos);
      }
    } catch (err) {
      console.error("Failed to fetch NGOs:", err);
    }
  };

  const fetchDonations = async () => {
    try {
      const res = await API.get("/donations");
      if (res.data.success) {
        // Filter donations for the current donor
        const userDonations = res.data.donations.filter(
          (d) => d.donor && d.donor._id === userId
        );
        setDonations(userDonations);
      }
    } catch (err) {
      console.error("Failed to fetch donations:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleDonateChange = (e) => {
    setDonateForm({ ...donateForm, [e.target.name]: e.target.value });
  };
  const handleOnlinePayment = async () => {
  try {
    // 1. Create order
    const { data: order } = await API.post("/payment/create-order", {
      amount: donateForm.amount,
    });

    // 2. Open Razorpay popup
    const options = {
      key: "rzp_test_SYZv5gFi6ABefY", // 🔴 replace with your key
      amount: order.amount,
      currency: "INR",
      name: "NGOConnect",
      description: "Donation",
      order_id: order.id,

      handler: async function (response) {
        // 3. Verify payment
        const verifyRes = await API.post("/payment/verify", {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          ngoId: donateForm.ngo,
          amount: donateForm.amount,
        });

        if (verifyRes.data.success) {
          alert("Payment Successful 🎉");

          setDonateForm({
            ngo: "",
            type: "money",
            amount: "",
            items: "",
            paymentMethod: "online",
          });

          setActiveTab("history");
          fetchDonations();
        } else {
          alert("Payment verification failed");
        }
      },

      theme: {
        color: "#3E5C76",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (err) {
    console.error(err);
    alert("Payment failed");
  }
};
  const handleDonateSubmit = async (e) => {
  e.preventDefault();

  if (!donateForm.ngo) {
    alert("Please select an NGO");
    return;
  }

  // 💰 MONEY → Razorpay
  if (donateForm.type === "money") {
    if (!donateForm.amount) {
      alert("Enter amount");
      return;
    }

    await handleOnlinePayment();
    return;
  }

  // 📦 ITEMS → normal API
  if (donateForm.type === "items") {
    if (!donateForm.items) {
      alert("Enter items");
      return;
    }

    try {
      const payload = {
        donor: userId,
        ngo: donateForm.ngo,
        type: "items",
        items: donateForm.items,
        paymentMethod: "cash",
      };

      const res = await API.post("/donations", payload);

      if (res.data.success) {
        alert("Item donation recorded!");
        setActiveTab("history");
        fetchDonations();
      }
    } catch (err) {
      console.error(err);
    }
  }
};
      
  const menuItems = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "directory", label: "NGO Directory", icon: "🏢" },
    { id: "donate", label: "Donate", icon: "💰" },
    { id: "history", label: "Donation History", icon: "🕒" },
  ];

  // Calculate total contributions
  const totalContributions = donations
    .filter(d => d.type === "money" && d.status === "completed")
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  return (
    <div className="dashboard-wrapper">
      {/* GREEN SIDEBAR */}
      <div className="sidebar donor-sidebar">
        <div className="sidebar-brand">
          <span style={{ fontSize: '24px' }}>💚</span>
          <h2>Donor Panel</h2>
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

      {/* MAIN CONTENT Area */}
      <div className="main-content">
        <header className="content-header">
          <h1>Donor Dashboard</h1>
          <div className="user-avatar-circle donor-avatar">{getInitials(userName)}</div>
        </header>

        <div className="dashboard-card">
          {activeTab === "profile" && (
            <div className="profile-section">
              <div className="section-header"><h2>Donor Profile</h2></div>
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
                <div className="info-item">
                  <label>🏷️ Preferred Donation Type</label>
                  <p>Online</p>
                </div>
                <div className="info-item-wide">
                  <label>📍 Address</label>
                  <p>{userAddress}</p>
                </div>
                <div className="info-item">
                  <label>📈 Total Completed Money Contributions</label>
                  <p style={{ color: '#3E5C76', fontSize: '1.5rem' }}>₹{totalContributions}</p>
                </div>
                <div className="info-item">
                  <label>📦 Total Item Donations</label>
                  <p style={{ color: '#3E5C76', fontSize: '1.5rem' }}>
                    {donations.filter(d => d.type === "items").length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "directory" && (
            <div className="directory-section">
              <div className="section-header">
                <h2>NGO Directory</h2>
                <input type="text" placeholder="Filter by location" className="filter-input" />
              </div>
              <div className="list-container">
                {ngos.length > 0 ? ngos.map((ngo, idx) => (
                  <div key={ngo._id || idx} className="horizontal-card">
                    <div className="card-info">
                      <h3>{ngo.name}</h3>
                      <p className="meta-text">✉️ {ngo.email}</p>
                      {ngo.ngoDetails && (
                        <p className="meta-text">
                          {ngo.ngoDetails.organizationName && `🏢 ${ngo.ngoDetails.organizationName} `}
                          {ngo.ngoDetails.location && `📍 ${ngo.ngoDetails.location}`}
                        </p>
                      )}
                      {ngo.ngoDetails?.description && <p className="desc-text">{ngo.ngoDetails.description}</p>}
                    </div>
                    <button className="green-btn" onClick={() => {
                        setDonateForm({ ...donateForm, ngo: ngo._id });
                        setActiveTab("donate");
                    }}>Donate Now</button>
                  </div>
                )) : (
                  <p>No NGOs found.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "donate" && (
            <div className="donate-section">
              <div className="section-header"><h2>Make a Donation</h2></div>
              <form className="dashboard-form" onSubmit={handleDonateSubmit}>
                <div className="input-group">
                  <label>Select NGO *</label>
                  <select 
                    className="auth-select" 
                    name="ngo"
                    value={donateForm.ngo}
                    onChange={handleDonateChange}
                    required
                  >
                    <option value="">Choose an NGO</option>
                    {ngos.map(n => (
                      <option key={n._id} value={n._id}>
                        {n.ngoDetails?.organizationName || n.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Donation Type *</label>
                  <select 
                    className="auth-select"
                    name="type"
                    value={donateForm.type}
                    onChange={handleDonateChange}
                  >
                    <option value="money">Money</option>
                    <option value="items">Kind (Goods/Materials)</option>
                  </select>
                </div>

                {donateForm.type === "money" ? (
                  <div className="input-group">
                    <label>Amount (₹) *</label>
                    <input 
                      type="number" 
                      name="amount"
                      placeholder="Enter amount" 
                      value={donateForm.amount}
                      onChange={handleDonateChange}
                      min="1"
                    />
                  </div>
                ) : (
                  <div className="input-group">
                    <label>Items Description *</label>
                    <textarea 
                      name="items"
                      placeholder="E.g., 50 Blankets, 20 Books" 
                      className="dashboard-textarea"
                      value={donateForm.items}
                      onChange={handleDonateChange}
                    ></textarea>
                  </div>
                )}
                
                <div className="input-group">
                  <label>Payment Method</label>
                  <select 
                    className="auth-select"
                    name="paymentMethod"
                    value={donateForm.paymentMethod}
                    onChange={handleDonateChange}
                  >
                    <option value="online">Online Payment</option>
                    <option value="cash">Cash / Offline</option>
                  </select>
                </div>
                
                <button type="submit" className="green-btn-wide">Complete Donation</button>
              </form>
            </div>
          )}

          {activeTab === "history" && (
            <div className="history-section">
              <div className="section-header"><h2>Donation History</h2></div>
              <div className="list-container">
                {donations.length > 0 ? donations.map((item, idx) => (
                  <div key={item._id || idx} className="horizontal-card">
                    <div className="card-info">
                      <h3>{item.ngo?.name || "Unknown NGO"}</h3>
                      <p className="meta-text">
                        {item.type === "money" ? `💰 ₹${item.amount}` : `📦 Items: ${item.items}`} 
                        &nbsp; 📅 {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                      <p className={`status-text ${item.status}`}>
                        Status: <span style={{ textTransform: 'capitalize', fontWeight: 'bold', color: item.status === 'completed' ? 'green' : 'orange' }}>{item.status}</span>
                      </p>
                    </div>
                    <button className="green-outline-btn">View Details</button>
                  </div>
                )) : (
                  <p>No donations yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DonorDashboard;