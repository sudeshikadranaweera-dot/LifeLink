import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate("/home")}>
        LifeLink 💉
      </div>
      <div className="navbar-links">
        <button onClick={() => navigate("/home")}>Home</button>
        <button onClick={() => navigate("/view-requests")}>
          View Requests
        </button>
        <button onClick={() => navigate("/post-request")}>
          Post Request
        </button>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;