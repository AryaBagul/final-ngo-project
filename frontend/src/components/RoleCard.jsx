import { useNavigate } from "react-router-dom";

import ngoIcon from "../assets/icons/ngo.jpg";
import volunteerIcon from "../assets/icons/volunteer.jpg";
import donorIcon from "../assets/icons/donor.jpg";

function RoleCard({ role, title, desc }) {

  const navigate = useNavigate();

  const icons = {
    ngo: ngoIcon,
    volunteer: volunteerIcon,
    donor: donorIcon
  };

  return (
    <div
      className={`role-card ${role}`}
     onClick={() => {
  navigate(`/auth/${role}`);
}}
    >

      <img
        src={icons[role]}
        className="role-icon"
        alt={title}
      />

      <h2>{title}</h2>
      <p>{desc}</p>

    </div>
  );
}

export default RoleCard;