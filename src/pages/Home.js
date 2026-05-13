javascriptimport { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

function Home() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="home-container">
      <h1>Welcome to LifeLink 💉</h1>
      <p>Connecting donors and hospitals across Sri Lanka</p>
      <div className="home-buttons">
        <button onClick={() => navigate("/view-requests")}>
          View Donation Requests
        </button>
        <button onClick={() => navigate("/post-request")}>
          Post Donation Request
        </button>
        <button onClick={() => navigate("/admin")}>
          Admin Panel
        </button>
        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Home;