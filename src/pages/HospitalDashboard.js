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
      const resSnap = await getDocs(collection(db, "responses"));
      const resList = [];
      resSnap.forEach(d => resList.push({ id: d.id, ...d.data() }));
      const myResponses = resList.filter(r =>
        reqList.some(req => req.id === r.requestId)
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
      r.status === "approved" || r.status === "Open").length,
    emergency: requests.filter(r =>
      (r.priority || r.urgency) === "Emergency").length,
    responses: responses.length
  };

  return (
    <div className="app-layout">
      <HospitalNavbar />
      <div className="main-content">
        <div className="top-bar">
          <div className="top-bar-title">
            <h2>Hospital Dashboard</h2>
            <p>Manage your donation requests</p>
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
          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-card-label">Active Requests</p>
              <p className="stat-card-number">{stats.active}</p>
              <button className="stat-card-link"
                onClick={() => navigate("/hospital/requests")}>
                View All →
              </button>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Emergency Requests</p>
              <p className="stat-card-number red">{stats.emergency}</p>
              <button className="stat-card-link"
                onClick={() => navigate("/hospital/requests")}>
                View All →
              </button>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Total Responses</p>
              <p className="stat-card-number green">{stats.responses}</p>
              <button className="stat-card-link"
                onClick={() => navigate("/hospital/responses")}>
                View All →
              </button>
            </div>
            <div className="stat-card">
              <h3 style={{fontSize:"14px", fontWeight:"700",
                marginBottom:"12px"}}>Quick Actions</h3>
              <button className="btn-primary"
                style={{width:"100%", padding:"10px",
                  justifyContent:"center", marginBottom:"8px",
                  fontSize:"13px"}}
                onClick={() => navigate("/post-request")}>
                ➕ Create Request
              </button>
              <button className="btn-secondary"
                style={{width:"100%", padding:"10px",
                  justifyContent:"center", fontSize:"13px"}}
                onClick={() => navigate("/hospital/requests")}>
                📋 View Requests
              </button>
            </div>
          </div>
          <div className="dashboard-grid">
            <div>
              <div style={{display:"flex",
                justifyContent:"space-between",
                alignItems:"center", marginBottom:"16px"}}>
                <h3 style={{fontSize:"16px", fontWeight:"700"}}>
                  Recent Requests
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
                  <button className="btn-primary"
                    style={{marginTop:"16px"}}
                    onClick={() => navigate("/post-request")}>
                    Create First Request
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
                              ? ` - ${r.organNeeded}` : ""}
                          </h4>
                          <p>Blood Group: {r.bloodGroup || "Any"}
                            • Patients: {r.patients || 1}
                          </p>
                          <p>{responses.filter(res =>
                            res.requestId === r.id).length} Responses
                          </p>
                        </div>
                        <div className="request-card-right">
                          {getPriorityBadge(r.priority || r.urgency)}
                          <span style={{fontSize:"11px",
                            background:"var(--primary-light)",
                            color:"var(--primary)",
                            padding:"2px 8px", borderRadius:"99px",
                            fontWeight:"600"}}>
                            {r.status || "Open"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h3 style={{fontSize:"16px", fontWeight:"700",
                marginBottom:"16px"}}>Recent Activity</h3>
              <div className="form-card">
                {requests.slice(0, 3).map(r => (
                  <div key={r.id} style={{display:"flex",
                    gap:"10px", padding:"10px 0",
                    borderBottom:"1px solid var(--gray-200)"}}>
                    <span>🔴</span>
                    <div>
                      <p style={{fontSize:"13px", fontWeight:"600"}}>
                        New {r.priority || r.urgency} Request
                      </p>
                      <p style={{fontSize:"12px",
                        color:"var(--gray-500)"}}>
                        {r.donationType} Donation
                      </p>
                    </div>
                  </div>
                ))}
                {requests.length === 0 && (
                  <p style={{fontSize:"13px",
                    color:"var(--gray-500)",
                    textAlign:"center", padding:"20px"}}>
                    No recent activity
                  </p>
                )}
              </div>
              <div style={{
                background:"linear-gradient(135deg, var(--primary), var(--accent))",
                borderRadius:"var(--radius-lg)",
                padding:"24px", marginTop:"16px",
                color:"white", textAlign:"center"}}>
                <p style={{fontSize:"24px", marginBottom:"8px"}}>🎧</p>
                <h3 style={{fontWeight:"700", marginBottom:"6px"}}>
                  Need Help?
                </h3>
                <p style={{fontSize:"13px", opacity:"0.85",
                  marginBottom:"14px"}}>
                  Contact support anytime.
                </p>
                <button style={{background:"transparent",
                  border:"1.5px solid white", color:"white",
                  padding:"8px 20px", borderRadius:"99px",
                  cursor:"pointer", fontSize:"13px",
                  fontWeight:"600",
                  fontFamily:"'Poppins', sans-serif"}}>
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HospitalDashboard;
