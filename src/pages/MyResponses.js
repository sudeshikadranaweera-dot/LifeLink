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
      snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
      setResponses(list);
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

  const stats = {
    total: responses.length,
    pending: responses.filter(r =>
      !r.status || r.status === "pending").length,
    completed: responses.filter(r =>
      r.status === "completed").length
  };

  return (
    <div className="app-layout">
      <Navbar />
      <div className="main-content">
        <div className="top-bar">
          <div className="top-bar-title">
            <h2>My Responses</h2>
            <p>Your donation history</p>
          </div>
        </div>
        <div className="page-content">
          <div className="stats-grid"
            style={{gridTemplateColumns:"repeat(3,1fr)",
            marginBottom:"24px"}}>
            <div className="stat-card">
              <p className="stat-card-label">Total Responses</p>
              <p className="stat-card-number">{stats.total}</p>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Pending</p>
              <p className="stat-card-number orange">{stats.pending}</p>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Completed</p>
              <p className="stat-card-number green">{stats.completed}</p>
            </div>
          </div>
          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
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
            <div style={{display:"flex", flexDirection:"column", gap:"12px"}}>
              {responses.map(r => {
                const typeInfo = getTypeInfo(r.donationType);
                return (
                  <div key={r.id} className="request-card">
                    <div className="request-card-row">
                      <div className={`request-type-icon ${typeInfo.class}`}>
                        {typeInfo.emoji}
                      </div>
                      <div className="request-card-info">
                        <h4>{r.donationType} Donation</h4>
                        <p>{r.hospitalName}</p>
                        <p style={{fontSize:"11px",
                          color:"var(--gray-500)"}}>
                          Responded on: {r.respondedAt?.toDate
                            ? r.respondedAt.toDate().toLocaleDateString()
                            : "Recently"}
                        </p>
                        {r.message && (
                          <p style={{fontSize:"12px",
                            color:"var(--gray-700)", marginTop:"4px"}}>
                            Your message: "{r.message}"
                          </p>
                        )}
                      </div>
                      <div className="request-card-right">
                        <span className="badge-urgent">Pending</span>
                        <button className="btn-secondary"
                          style={{fontSize:"12px", padding:"6px 14px"}}
                          onClick={() => navigate("/requests")}>
                          View Request
                        </button>
                      </div>
                    </div>
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