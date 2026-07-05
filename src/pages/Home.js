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

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "./Navbar";

function Home() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ total: 0, emergency: 0, responses: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) setProfile(docSnap.data());
      }
      const q = query(collection(db, "donationRequests"),
        where("status", "==", "approved"));
      const snapshot = await getDocs(q);
      const requests = [];
      snapshot.forEach(d => requests.push({ id: d.id, ...d.data() }));
      const emergency = requests.filter(r =>
        (r.priority || r.urgency) === "Emergency").length;
      const responsesSnap = await getDocs(
        query(collection(db, "responses"),
        where("donorId", "==", user?.uid))
      );
      setStats({
        total: requests.length,
        emergency,
        responses: responsesSnap.size
      });
      setRecentRequests(requests.slice(0, 5));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const getTypeInfo = (type) => {
    if (type === "Blood") return { emoji: "🩸", class: "type-blood" };
    if (type === "Organ") return { emoji: "💚", class: "type-organ" };
    if (type === "Hair") return { emoji: "✂️", class: "type-hair" };
    return { emoji: "👁️", class: "type-eye" };
  };

  const getPriorityBadge = (p) => {
    if (p === "Emergency")
      return <span className="badge-emergency">Emergency</span>;
    if (p === "Urgent")
      return <span className="badge-urgent">Urgent</span>;
    return <span className="badge-normal">Normal</span>;
  };

  return (
    <div className="app-layout">
      <Navbar />
      <div className="main-content">

        {/* TOP BAR */}
        <div className="top-bar">
          <div className="top-bar-title">
            <h2>Donor Dashboard</h2>
            <p>Welcome back, {profile?.name ||
              user?.email?.split("@")[0]} 👋</p>
          </div>
          <div className="top-bar-user">
            <button style={{background:"none", border:"none",
              fontSize:"24px", cursor:"pointer"}}
              onClick={() => navigate("/notifications")}>
              🔔
            </button>
            <div className="top-bar-user-info">
              <p className="top-bar-user-name">{profile?.name}</p>
              <p className="top-bar-user-role">Donor</p>
            </div>
            <div className="top-bar-avatar">
              {profile?.name?.charAt(0).toUpperCase() || "D"}
            </div>
          </div>
        </div>

        <div className="page-content">

          {/* STATS ROW — 3 cards only */}
          <div className="stats-grid"
            style={{gridTemplateColumns:"repeat(3, 1fr)"}}>
            <div className="stat-card">
              <p className="stat-card-label">Active Requests</p>
              <p className="stat-card-number">{stats.total}</p>
              <button className="stat-card-link"
                onClick={() => navigate("/requests")}>
                View All →
              </button>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Emergency Requests</p>
              <p className="stat-card-number red">{stats.emergency}</p>
              <button className="stat-card-link"
                onClick={() => navigate("/requests")}>
                View All →
              </button>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">My Responses</p>
              <p className="stat-card-number green">{stats.responses}</p>
              <button className="stat-card-link"
                onClick={() => navigate("/my-responses")}>
                View All →
              </button>
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="dashboard-grid">

            {/* LEFT — Recent Requests */}
            <div>
              <div style={{display:"flex",
                justifyContent:"space-between",
                alignItems:"center", marginBottom:"16px"}}>
                <h3 style={{fontSize:"16px", fontWeight:"700"}}>
                  Donation Requests Near You
                </h3>
                <button className="stat-card-link"
                  onClick={() => navigate("/nearby-requests")}>
                  View All →
                </button>
              </div>
              <div style={{display:"flex",
                flexDirection:"column", gap:"12px"}}>
                {loading ? (
                  <div className="loading">
                    <div className="spinner"></div>
                  </div>
                ) : recentRequests.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-state-emoji">📋</span>
                    <h3>No requests yet</h3>
                    <p>Check back later</p>
                  </div>
                ) : (
                  recentRequests.map(r => {
                    const typeInfo = getTypeInfo(r.donationType);
                    const priority = r.priority || r.urgency;
                    return (
                      <div key={r.id} className="request-card"
                        onClick={() => navigate("/requests")}>
                        <div className="request-card-row">
                          <div className={`request-type-icon
                            ${typeInfo.class}`}>
                            {typeInfo.emoji}
                          </div>
                          <div className="request-card-info">
                            <h4>{r.donationType} Donation</h4>
                            <p>{r.hospitalName} ·
                              {r.location || r.district}</p>
                          </div>
                          <div className="request-card-right">
                            {getPriorityBadge(priority)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT — My Availability */}
            <div>
              <div className="form-card">
                <h3 style={{fontSize:"16px", fontWeight:"700",
                  marginBottom:"20px"}}>
                  My Availability
                </h3>

                {/* Availability Status */}
                <div style={{
                  display:"flex", alignItems:"center",
                  justifyContent:"space-between",
                  padding:"16px",
                  background:"var(--primary-light)",
                  borderRadius:"var(--radius)",
                  marginBottom:"16px"
                }}>
                  <div>
                    <p style={{fontWeight:"700", fontSize:"15px",
                      color: profile?.availability === "Available"
                        ? "var(--normal)" : "var(--gray-500)"}}>
                      {profile?.availability === "Available"
                        ? "● Available" : "○ Not Available"}
                    </p>
                    <p style={{fontSize:"12px",
                      color:"var(--gray-500)", marginTop:"4px"}}>
                      {profile?.availability === "Available"
                        ? "Hospitals can find you"
                        : "Hidden from hospitals"}
                    </p>
                  </div>
                  <span style={{
                    fontSize:"32px"
                  }}>
                    {profile?.availability === "Available"
                      ? "✅" : "⭕"}
                  </span>
                </div>

                {/* Donor Info */}
                <div style={{display:"flex",
                  flexDirection:"column", gap:"10px",
                  marginBottom:"20px"}}>
                  <div style={{display:"flex",
                    justifyContent:"space-between",
                    padding:"10px 14px",
                    background:"var(--gray-100)",
                    borderRadius:"var(--radius)"}}>
                    <span style={{fontSize:"13px",
                      color:"var(--gray-500)"}}>
                      Blood Group
                    </span>
                    <span style={{fontSize:"13px",
                      fontWeight:"700",
                      color:"var(--emergency)"}}>
                      🩸 {profile?.bloodGroup || "Not set"}
                    </span>
                  </div>
                  <div style={{display:"flex",
                    justifyContent:"space-between",
                    padding:"10px 14px",
                    background:"var(--gray-100)",
                    borderRadius:"var(--radius)"}}>
                    <span style={{fontSize:"13px",
                      color:"var(--gray-500)"}}>
                      District
                    </span>
                    <span style={{fontSize:"13px",
                      fontWeight:"700",
                      color:"var(--primary)"}}>
                      📍 {profile?.district || "Not set"}
                    </span>
                  </div>
                  <div style={{display:"flex",
                    justifyContent:"space-between",
                    padding:"10px 14px",
                    background:"var(--gray-100)",
                    borderRadius:"var(--radius)"}}>
                    <span style={{fontSize:"13px",
                      color:"var(--gray-500)"}}>
                      Can Donate
                    </span>
                    <span style={{fontSize:"13px",
                      fontWeight:"700",
                      color:"var(--primary)"}}>
                      {profile?.donationTypes?.join(", ")
                        || "Not set"}
                    </span>
                  </div>
                  <div style={{display:"flex",
                    justifyContent:"space-between",
                    padding:"10px 14px",
                    background:"var(--gray-100)",
                    borderRadius:"var(--radius)"}}>
                    <span style={{fontSize:"13px",
                      color:"var(--gray-500)"}}>
                      Available Days
                    </span>
                    <span style={{fontSize:"13px",
                      fontWeight:"700",
                      color:"var(--primary)"}}>
                      {profile?.availableDays?.join(", ")
                        || "Not set"}
                    </span>
                  </div>
                </div>

                {/* Update Availability Button */}
                <button
                  className="btn-primary"
                  style={{width:"100%", padding:"14px",
                    justifyContent:"center", fontSize:"14px"}}
                  onClick={() => navigate("/availability")}>
                  ✅ Update Availability
                </button>

                {/* Motivational Card */}
                <div className="motivation-card"
                  style={{marginTop:"16px"}}>
                  <span className="emoji">❤️</span>
                  <h3>Every Donation Makes a Difference</h3>
                  <p>Your contribution can save lives today</p>
                  <button
                    onClick={() => navigate("/requests")}
                    style={{marginTop:"14px",
                      background:"transparent",
                      border:"1.5px solid white",
                      color:"white", padding:"10px 24px",
                      borderRadius:"99px", cursor:"pointer",
                      fontSize:"13px", fontWeight:"600",
                      fontFamily:"'Poppins', sans-serif"}}>
                    Start Donating →
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
