import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import HospitalNavbar from "./HospitalNavbar";

function HospitalDashboard() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) setProfile(docSnap.data());
      }
      const reqSnap = await getDocs(
        query(collection(db, "donationRequests"),
          where("hospitalId", "==", user?.uid))
      );
      const reqList = [];
      reqSnap.forEach(d => reqList.push({ id: d.id, ...d.data() }));
      setRequests(reqList);
      const reqIds = reqList.map(r => r.id);
      const resSnap = await getDocs(collection(db, "responses"));
      const resList = [];
      resSnap.forEach(d => resList.push({ id: d.id, ...d.data() }));
      const myResponses = resList.filter(r =>
        reqIds.includes(r.requestId)
      );
      setResponses(myResponses);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const getTypeEmoji = (type) => {
    if (type === "Blood") return "🩸";
    if (type === "Organ") return "💚";
    if (type === "Hair") return "✂️";
    return "👁️";
  };

  const getPriorityBadge = (p) => {
    if (p === "Emergency")
      return <span className="badge-emergency">Emergency</span>;
    if (p === "Urgent")
      return <span className="badge-urgent">Urgent</span>;
    return <span className="badge-normal">Normal</span>;
  };

  const stats = {
    active: requests.filter(r =>
      r.status === "approved").length,
    pending: requests.filter(r =>
      r.status === "pending").length,
    emergency: requests.filter(r =>
      (r.priority || r.urgency) === "Emergency").length,
    responses: responses.length,
    accepted: responses.filter(r =>
      r.status === "accepted").length,
    pending_responses: responses.filter(r =>
      !r.status || r.status === "pending").length,
  };

  return (
    <div className="app-layout">
      <HospitalNavbar />
      <div className="main-content">
        <div className="top-bar">
          <div className="top-bar-title">
            <h2>Hospital Dashboard</h2>
            <p>Welcome, {profile?.name} 🏥</p>
          </div>
          <div className="top-bar-user">
            <div className="top-bar-user-info">
              <p className="top-bar-user-name">{profile?.name}</p>
              <p className="top-bar-user-role">Hospital</p>
            </div>
            <div className="top-bar-avatar">
              {profile?.name?.charAt(0).toUpperCase() || "H"}
            </div>
          </div>
        </div>
        <div className="page-content">

          {/* STATS ROW 1 */}
          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-card-label">Active Requests</p>
              <p className="stat-card-number green">
                {stats.active}
              </p>
              <button className="stat-card-link"
                onClick={() => navigate("/hospital/requests")}>
                View All →
              </button>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Pending Approval</p>
              <p className="stat-card-number orange">
                {stats.pending}
              </p>
              <button className="stat-card-link"
                onClick={() => navigate("/hospital/requests")}>
                View All →
              </button>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Emergency Requests</p>
              <p className="stat-card-number red">
                {stats.emergency}
              </p>
              <button className="stat-card-link"
                onClick={() => navigate("/hospital/requests")}>
                View All →
              </button>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Total Responses</p>
              <p className="stat-card-number">{stats.responses}</p>
              <button className="stat-card-link"
                onClick={() => navigate("/hospital/responses")}>
                View All →
              </button>
            </div>
          </div>

          {/* STATS ROW 2 */}
          <div className="stats-grid" style={{marginTop:"0"}}>
            <div className="stat-card">
              <p className="stat-card-label">Accepted Donors</p>
              <p className="stat-card-number green">
                {stats.accepted}
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Pending Responses</p>
              <p className="stat-card-number orange">
                {stats.pending_responses}
              </p>
              <button className="stat-card-link"
                onClick={() => navigate("/hospital/responses")}>
                Review →
              </button>
            </div>
            <div className="stat-card"
              style={{
                background:"var(--primary)",
                cursor:"pointer"
              }}
              onClick={() => navigate("/post-request")}>
              <p className="stat-card-label"
                style={{color:"rgba(255,255,255,0.8)"}}>
                Quick Action
              </p>
              <p style={{fontSize:"24px", margin:"8px 0"}}>➕</p>
              <p style={{color:"white", fontWeight:"700",
                fontSize:"14px"}}>
                Create New Request
              </p>
            </div>
            <div className="stat-card"
              style={{
                background:"var(--primary-light)",
                cursor:"pointer"
              }}
              onClick={() => navigate("/hospital/responses")}>
              <p className="stat-card-label">Quick Action</p>
              <p style={{fontSize:"24px", margin:"8px 0"}}>💬</p>
              <p style={{color:"var(--primary)",
                fontWeight:"700", fontSize:"14px"}}>
                View Responses
              </p>
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
                  My Recent Requests
                </h3>
                <button className="stat-card-link"
                  onClick={() => navigate("/hospital/requests")}>
                  View All →
                </button>
              </div>
              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                </div>
              ) : requests.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state-emoji">📋</span>
                  <h3>No requests yet</h3>
                  <p>Create your first donation request</p>
                  <button className="btn-primary"
                    style={{marginTop:"16px"}}
                    onClick={() => navigate("/post-request")}>
                    Create Request
                  </button>
                </div>
              ) : (
                <div style={{display:"flex",
                  flexDirection:"column", gap:"12px"}}>
                  {requests.slice(0, 5).map(r => (
                    <div key={r.id} className="request-card">
                      <div className="request-card-row">
                        <span style={{fontSize:"28px"}}>
                          {getTypeEmoji(r.donationType)}
                        </span>
                        <div className="request-card-info">
                          <h4>{r.donationType} Donation
                            {r.organNeeded
                              ? ` — ${r.organNeeded}` : ""}
                            {r.bloodGroup && r.donationType === "Blood"
                              ? ` — ${r.bloodGroup}` : ""}
                          </h4>
                          <p>📍 {r.location || r.district}</p>
                          <p style={{fontSize:"11px",
                            color:"var(--gray-500)"}}>
                            {responses.filter(res =>
                              res.requestId === r.id).length
                            } donor response(s)
                          </p>
                        </div>
                        <div className="request-card-right">
                          {getPriorityBadge(
                            r.priority || r.urgency)}
                          <span className={`badge-${
                            r.status === "approved"
                              ? "normal"
                              : r.status === "rejected"
                              ? "emergency"
                              : "urgent"
                          }`}>
                            {r.status === "approved"
                              ? "✅ Active"
                              : r.status === "rejected"
                              ? "❌ Rejected"
                              : "⏳ Pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT — Recent Responses */}
            <div>
              <div style={{display:"flex",
                justifyContent:"space-between",
                alignItems:"center", marginBottom:"16px"}}>
                <h3 style={{fontSize:"16px", fontWeight:"700"}}>
                  Recent Donor Responses
                </h3>
                <button className="stat-card-link"
                  onClick={() => navigate("/hospital/responses")}>
                  View All →
                </button>
              </div>
              {responses.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state-emoji">💬</span>
                  <h3>No responses yet</h3>
                  <p>Donors will respond to your requests here</p>
                </div>
              ) : (
                <div style={{display:"flex",
                  flexDirection:"column", gap:"12px"}}>
                  {responses.slice(0, 5).map(r => (
                    <div key={r.id} className="form-card"
                      style={{padding:"16px"}}>
                      <div style={{display:"flex",
                        justifyContent:"space-between",
                        alignItems:"center",
                        marginBottom:"8px"}}>
                        <p style={{fontWeight:"700",
                          fontSize:"14px"}}>
                          👤 {r.donorName ||
                            r.donorEmail?.split("@")[0]}
                        </p>
                        <span className={`badge-${
                          r.status === "accepted"
                            ? "normal"
                            : r.status === "rejected"
                            ? "emergency"
                            : "urgent"
                        }`}>
                          {r.status === "accepted"
                            ? "✅ Accepted"
                            : r.status === "rejected"
                            ? "❌ Rejected"
                            : "⏳ Pending"}
                        </span>
                      </div>
                      <p style={{fontSize:"12px",
                        color:"var(--gray-500)"}}>
                        {r.donorEmail}
                      </p>
                      <p style={{fontSize:"12px",
                        color:"var(--gray-500)"}}>
                        For: {requests.find(req =>
                          req.id === r.requestId
                        )?.donationType || "Donation"} Request
                      </p>
                      {!r.status || r.status === "pending" ? (
                        <button className="btn-primary"
                          style={{
                            width:"100%",
                            padding:"8px",
                            justifyContent:"center",
                            fontSize:"12px",
                            marginTop:"10px"
                          }}
                          onClick={() =>
                            navigate("/hospital/responses")}>
                          Review Response →
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}

              {/* HELP CARD */}
              <div style={{
                background:"linear-gradient(135deg, var(--primary), var(--accent))",
                borderRadius:"var(--radius-lg)",
                padding:"24px",
                marginTop:"16px",
                color:"white",
                textAlign:"center"
              }}>
                <p style={{fontSize:"24px",
                  marginBottom:"8px"}}>🎧</p>
                <h3 style={{fontWeight:"700",
                  marginBottom:"6px"}}>Need Help?</h3>
                <p style={{fontSize:"13px",
                  opacity:"0.85", marginBottom:"14px"}}>
                  Contact LifeLink support anytime
                </p>
                <p style={{fontSize:"13px",
                  fontWeight:"600"}}>
                  support@lifelink.lk
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HospitalDashboard;