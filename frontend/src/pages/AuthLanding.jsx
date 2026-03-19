import RoleCard from "../components/RoleCard";
import "../styles/auth.css";
import bg from "../assets/home-bg.jpg";

function AuthLanding() {

return (

<div className="landing" style={{backgroundImage:`url(${bg})`}}>

<div className="overlay"/>

<div className="landing-content">

<h1 className="title">NGOConnect</h1>

<p className="tagline">
Building trust. Enabling collaboration. Creating impact together.
</p>

<div className="cards">

<RoleCard role="ngo" title="NGO"
desc="Organize initiatives and manage volunteers"/>

<RoleCard role="volunteer" title="Volunteer"
desc="Support NGOs and contribute your time"/>

<RoleCard role="donor" title="Donor"
desc="Fund impactful causes and communities"/>

</div>

</div>

</div>

)

}

export default AuthLanding