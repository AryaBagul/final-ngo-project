import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../api/axios";
import bgImage from "../assets/home-bg.jpg";
import "../styles/auth.css";

function RoleAuth() {

  const { role } = useParams();
  console.log("Current Role:", role);

  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    contactNumber: "",
    birthdate: "",
    address: "",
    ngoDetails: {
      organizationName: "",
      description: "",
      location: ""
    }
  });


  /* LOGIN */

  const handleLogin = async () => {

    if (!loginData.email || !loginData.password) {
      alert("Please enter email and password");
      return;
    }

    try {

      console.log("Login Request:", {
        email: loginData.email,
        password: loginData.password,
        role
      });

      const res = await API.post("/auth/login", {
        email: loginData.email,
        password: loginData.password,
        role
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userName", res.data.name);
      localStorage.setItem("userEmail", loginData.email);
     localStorage.setItem("userId", res.data.id);
      if(res.data.contactNumber) localStorage.setItem("contactNumber", res.data.contactNumber);
      if(res.data.birthdate) localStorage.setItem("birthdate", res.data.birthdate);
      if(res.data.address) localStorage.setItem("address", res.data.address);
      if(res.data.ngoDetails) localStorage.setItem("ngoDetails", JSON.stringify(res.data.ngoDetails));

      alert("Login successful");

      navigate(`/${role}-dashboard`);

    } catch (err) {

      console.error("Login Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Login failed");

    }
  };


  /* REGISTER */

  const handleRegister = async () => {

    if (!registerData.name || !registerData.email || !registerData.password) {
      alert("Please fill all required fields (Name, Email, Password)");
      return;
    }

    try {
      const payload = {
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        role,
        contactNumber: registerData.contactNumber,
        birthdate: registerData.birthdate,
        address: registerData.address
      };

      if (role === "ngo") {
        payload.ngoDetails = registerData.ngoDetails;
      }

      console.log("Register Request:", payload);

      await API.post("/auth/register", payload);

      alert("Registration successful. Please login.");

      setIsLogin(true);

    } catch (err) {

      console.error("Registration Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Registration failed");

    }
  };


  return (
    <div
      className={`auth-page ${role}`}
      style={{ backgroundImage: `url(${bgImage})` }}
    >

      <div className="overlay"></div>

      <div className="auth-wrapper">

        {isLogin ? (

          <div className="auth-box">
            <h2>Login</h2>

            <input
              placeholder="Email"
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Password"
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
            />

            <button onClick={handleLogin}>Login</button>

            <p className="switch">
              Don't have an account?
              <span onClick={() => setIsLogin(false)}> Register</span>
            </p>
          </div>

        ) : (

          <div className="auth-box" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <h2>Register</h2>

            <input
              placeholder="Full Name *"
              value={registerData.name}
              onChange={(e) =>
                setRegisterData({ ...registerData, name: e.target.value })
              }
            />

            <input
              placeholder="Email *"
              type="email"
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({ ...registerData, email: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Password *"
              value={registerData.password}
              onChange={(e) =>
                setRegisterData({ ...registerData, password: e.target.value })
              }
            />

            <input
              placeholder="Contact Number"
              value={registerData.contactNumber}
              onChange={(e) =>
                setRegisterData({ ...registerData, contactNumber: e.target.value })
              }
            />

            {/* Use an input group to add a label for Birthdate */}
            <div style={{ width: '100%', marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'white', marginBottom: '5px' }}>Birthdate</label>
              <input
                type="date"
                style={{ width: '100%', padding: '10px' }}
                value={registerData.birthdate}
                onChange={(e) =>
                  setRegisterData({ ...registerData, birthdate: e.target.value })
                }
              />
            </div>

            <input
              placeholder="Address"
              value={registerData.address}
              onChange={(e) =>
                setRegisterData({ ...registerData, address: e.target.value })
              }
            />

            {role === "ngo" && (
              <>
                <hr style={{ width: '100%', margin: '15px 0', borderColor: 'rgba(255,255,255,0.3)' }} />
                <h4 style={{ alignSelf: 'flex-start', marginBottom: '10px', color: 'white' }}>NGO Details</h4>
                <input
                  placeholder="Organization Name"
                  value={registerData.ngoDetails.organizationName}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, ngoDetails: { ...registerData.ngoDetails, organizationName: e.target.value } })
                  }
                />
                <input
                  placeholder="Organization Description"
                  value={registerData.ngoDetails.description}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, ngoDetails: { ...registerData.ngoDetails, description: e.target.value } })
                  }
                />
                <input
                  placeholder="Organization Location"
                  value={registerData.ngoDetails.location}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, ngoDetails: { ...registerData.ngoDetails, location: e.target.value } })
                  }
                />
              </>
            )}

            <button onClick={handleRegister}>Register</button>

            <p className="switch">
              Already have an account?
              <span onClick={() => setIsLogin(true)}> Login</span>
            </p>
          </div>

        )}

        <button className="back" onClick={() => navigate("/")}>
          Back to Home
        </button>

      </div>
    </div>
  );

}

export default RoleAuth;