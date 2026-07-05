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

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function Navbar() {
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
    { path: "/home", emoji: "🏠", label: "Dashboard" },
    { path: "/nearby-requests", emoji: "📍", label: "Nearby Requests" },
    { path: "/requests", emoji: "📋", label: "All Requests" },
    { path: "/my-responses", emoji: "💬", label: "My Responses" },
    { path: "/profile", emoji: "👤", label: "My Profile" },
    { path: "/availability", emoji: "✅", label: "My Availability" },
    { path: "/notifications", emoji: "🔔", label: "Notifications" },
  ];

  return (
    <div className="sidebar">

      {/* LOGO */}
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

      {/* USER INFO */}
      <div className="sidebar-user">
        <div className="sidebar-avatar">
          {profile?.name?.charAt(0).toUpperCase() ||
            user?.email?.charAt(0).toUpperCase()}
        </div>
        <div style={{overflow:"hidden"}}>
          <p className="sidebar-user-name">
            {profile?.name || "Donor"}
          </p>
          <p className="sidebar-user-email">{user?.email}</p>
          {profile?.availability === "Available" && (
            <span style={{
              fontSize:"10px",
              background:"#dcfce7",
              color:"var(--normal)",
              padding:"2px 8px",
              borderRadius:"99px",
              fontWeight:"600"
            }}>
              ● Available
            </span>
          )}
        </div>
      </div>

      {/* NAV LINKS */}
      <div className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.path}
            className={`sidebar-nav-item
              ${isActive(item.path) ? "active" : ""}`}
            onClick={() => navigate(item.path)}>
            {item.emoji} {item.label}
          </button>
        ))}
      </div>

      {/* LOGOUT */}
      <div className="sidebar-bottom">
        <button
          className="sidebar-nav-item logout"
          onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

    </div>
  );
}
