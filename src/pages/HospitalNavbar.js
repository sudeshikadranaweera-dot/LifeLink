import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function HospitalNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = auth.currentUser;
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) setProfile(docSnap.data());
      }
    };
    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/hospital/dashboard", emoji: "🏥", label: "Dashboard" },
    { path: "/post-request", emoji: "➕", label: "Create Request" },
    { path: "/hospital/requests", emoji: "📋", label: "My Requests" },
    { path: "/hospital/responses", emoji: "💬", label: "Responses" },
    { path: "/notifications", emoji: "🔔", label: "Notifications" },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <img src="/logo.jpg" alt="LifeLink"
            style={{width:"36px", height:"36px",
            objectFit:"contain", borderRadius:"8px"}} />
        </div>
        <div>
          <div className="sidebar-logo-text">Life Link</div>
          <div style={{fontSize:"10px", color:"var(--gray-500)"}}>
            Donate Today, Save Tomorrow
          </div>
        </div>
      </div>
      <div className="sidebar-user">
        <div className="sidebar-avatar">
          {profile?.name?.charAt(0).toUpperCase() || "H"}
        </div>
        <div style={{overflow:"hidden"}}>
          <p className="sidebar-user-name">
            {profile?.name || "Hospital"}
          </p>
          <p className="sidebar-user-email">{user?.email}</p>
          <span style={{fontSize:"10px",
            background:"var(--primary-light)",
            color:"var(--primary)", padding:"2px 8px",
            borderRadius:"99px", fontWeight:"600"}}>
            🏥 Hospital
          </span>
        </div>
      </div>
      <div className="sidebar-nav">
        {navItems.map(item => (
          <button key={item.path}
            className={`sidebar-nav-item
              ${isActive(item.path) ? "active" : ""}`}
            onClick={() => navigate(item.path)}>
            {item.emoji} {item.label}
          </button>
        ))}
      </div>
      <div className="sidebar-bottom">
        <button className="sidebar-nav-item logout"
          onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

export default HospitalNavbar;
