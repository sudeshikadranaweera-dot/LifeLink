import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Navbar from "./Navbar";

function MyResponses() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      const q = query(
        collection(db, "responses"),
        where("donorId", "==", user?.uid)
      );
      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach(d => list.push({
        id: d.id, ...d.data()
      }));
      setResponses(list);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const getTypeInfo = (type) => {
    if (type === "Blood")
      return { emoji: "🩸", class: "type-blood" };
    if (type === "Organ")
      return { emoji: "💚", class: "type-organ" };
    if (type === "Hair")
      return { emoji: "✂️", class: "type-hair" };
    return { emoji: "👁️", class: "type-eye" };
  };

  const getStatusInfo = (status) => {
    if (status === "accepted") return {
      badge: "badge-normal",
      text: "✅ Accepted",
      message: "The hospital has accepted your offer! Please contact them directly to arrange your donation.",
      color: "#d4edda",
      textColor: "#155724"
    };
    if (status === "rejected") return {
      badge: "badge-emergency",
      text: "❌ Not Selected",
      message: "Thank you for your willingness to help. The hospital has found another donor for this request.",
      color: "#f8d7da",
      textColor: "#721c24"
    };
    return {
      badge: "badge-urgent",
      text: "⏳ Pending",
      message: "Your response is being reviewed by the hospital. You will be notified when they respond.",
      color: "#fff3cd",
      textColor: "#856404"
    };
  };

  const stats = {
    total: responses.length,
    pending: responses.filter(r =>
      !r.status || r.status === "pending").length,
    accepted: responses.filter(r =>
      r.status === "accepted").length,
    rejected: responses.filter(r =>
      r.status === "rejected").length
  };

  return (
    <div className="app-layout">
      <Navbar />
      <div className="main-content">
        <div className="top-bar">
          <div className="top-bar-title">
            <h2>My Responses</h2>
            <p>Track your donation offers and their status</p>
          </div>
        </div>
        <div className="page-content">

          {/* STATS */}
          <div className="stats-grid"
            style={{gridTemplateColumns:"repeat(4,1fr)",
            marginBottom:"24px"}}>
            <div className="stat-card">
              <p className="stat-card-label">Total Offers</p>
              <p className="stat-card-number">{stats.total}</p>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Pending</p>
              <p className="stat-card-number orange">
                {stats.pending}
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Accepted</p>
              <p className="stat-card-number green">
                {stats.accepted}
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Not Selected</p>
              <p className="stat-card-number red">
                {stats.rejected}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : responses.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-emoji">💬</span>
              <h3>You haven't responded to any requests yet</h3>
              <p>Browse requests and start donating</p>
              <button className="btn-primary"
                style={{marginTop:"16px"}}
                onClick={() => navigate("/requests")}>
                Browse Donation Requests →
              </button>
            </div>
          ) : (
            <div style={{display:"flex",
              flexDirection:"column", gap:"16px"}}>
              {responses.map(r => {
                const typeInfo = getTypeInfo(r.donationType);
                const statusInfo = getStatusInfo(r.status);
                return (
                  <div key={r.id} className="form-card">
                    <div style={{display:"flex",
                      alignItems:"center", gap:"14px",
                      marginBottom:"14px"}}>
                      <div className={`request-type-icon
                        ${typeInfo.class}`}>
                        {typeInfo.emoji}
                      </div>
                      <div style={{flex:1}}>
                        <h4 style={{fontSize:"15px",
                          fontWeight:"700",
                          marginBottom:"2px"}}>
                          {r.donationType} Donation
                        </h4>
                        <p style={{fontSize:"13px",
                          color:"var(--gray-500)"}}>
                          🏥 {r.hospitalName || "Hospital"}
                        </p>
                      </div>
                      <span className={statusInfo.badge}>
                        {statusInfo.text}
                      </span>
                    </div>

                    {/* STATUS MESSAGE */}
                    <div style={{
                      background: statusInfo.color,
                      padding:"12px 16px",
                      borderRadius:"var(--radius)",
                      marginBottom:"12px",
                      fontSize:"13px",
                      color: statusInfo.textColor,
                      fontWeight:"500"}}>
                      {statusInfo.message}
                    </div>

                    {/* DONOR INFO */}
                    <div style={{display:"flex",
                      justifyContent:"space-between",
                      fontSize:"12px",
                      color:"var(--gray-500)"}}>
                      <span>
                        Responded: {r.respondedAt?.toDate
                          ? r.respondedAt.toDate()
                            .toLocaleDateString()
                          : "Recently"}
                      </span>
                      {r.status === "accepted" && (
                        <span style={{
                          color:"var(--primary)",
                          fontWeight:"600"}}>
                          Contact hospital to arrange donation!
                        </span>
                      )}
                    </div>

                    {r.message && (
                      <div style={{
                        marginTop:"10px",
                        fontSize:"12px",
                        color:"var(--gray-500)",
                        fontStyle:"italic"}}>
                        Your message: "{r.message}"
                      </div>
                    )}

                    {(!r.status || r.status === "pending") && (
                      <button className="btn-secondary"
                        style={{
                          width:"100%",
                          padding:"10px",
                          justifyContent:"center",
                          fontSize:"13px",
                          marginTop:"12px"
                        }}
                        onClick={() => navigate("/requests")}>
                        Browse More Requests
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyResponses;
