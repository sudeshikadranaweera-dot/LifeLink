import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [verifyTab, setVerifyTab] = useState("Pending");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const snapshot = await getDocs(collection(db, "donationRequests"));
      const list = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setRequests(list);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    await updateDoc(doc(db, "donationRequests", id), { status: "approved" });
    fetchRequests();
  };

  const handleReject = async (id) => {
    await updateDoc(doc(db, "donationRequests", id), { status: "rejected" });
    fetchRequests();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "donationRequests", id));
    setConfirmDelete(null);
    fetchRequests();
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin");
  };

  const stats = {
    total: requests.length,
    emergency: requests.filter(r => (r.urgency || r.priority) === "Emergency").length,
    urgent: requests.filter(r => (r.urgency || r.priority) === "Urgent").length,
    normal: requests.filter(r => (r.urgency || r.priority) === "Normal").length,
  };

  const getPriorityBadge = (priority) => {
    const p = priority || "Normal";
    if (p === "Emergency") return <span className="badge-emergency">🔴 Emergency</span>;
    if (p === "Urgent") return <span className="badge-urgent">🟡 Urgent</span>;
    return <span className="badge-normal">🟢 Normal</span>;
  };

  const getTypeEmoji = (type) => {
    if (type === "Blood") return "🩸";
    if (type === "Organ") return "🫀";
    if (type === "Hair") return "✂️";
    if (type === "Eye") return "👁️";
    return "💊";
  };

  const navItems = ["Dashboard", "Requests", "Verifications", "Reports", "Settings"];

  const renderContent = () => {
    if (activeTab === "Dashboard") return (
      <div>
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-card-label">Total Requests</p>
            <p className="stat-card-number">{stats.total}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Emergency</p>
            <p className="stat-card-number red">{stats.emergency}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Urgent</p>
            <p className="stat-card-number orange">{stats.urgent}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Normal</p>
            <p className="stat-card-number green">{stats.normal}</p>
          </div>
        </div>
        <div className="form-card">
          <h3 style={{fontSize:"16px", fontWeight:"700", marginBottom:"16px"}}>
            Recent Requests
          </h3>
          {requests.slice(0, 5).map(r => (
            <div key={r.id} style={{
              display:"flex", alignItems:"center", gap:"12px",
              padding:"12px 0", borderBottom:"1px solid var(--gray-200)"
            }}>
              <span style={{fontSize:"24px"}}>{getTypeEmoji(r.donationType)}</span>
              <div style={{flex:1}}>
                <p style={{fontWeight:"600", fontSize:"14px"}}>{r.hospitalName}</p>
                <p style={{fontSize:"12px", color:"var(--gray-500)"}}>
                  {r.location} · {r.donationType}
                </p>
              </div>
              {getPriorityBadge(r.urgency || r.priority)}
            </div>
          ))}
        </div>
      </div>
    );

    if (activeTab === "Requests") return (
      <div className="form-card" style={{overflowX:"auto"}}>
        <h3 style={{fontSize:"16px", fontWeight:"700", marginBottom:"16px"}}>
          All Requests
        </h3>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Hospital</th>
                <th>District</th>
                <th>Contact</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id}>
                  <td>{getTypeEmoji(r.donationType)} {r.donationType}</td>
                  <td>{r.hospitalName}</td>
                  <td>{r.location}</td>
                  <td>{r.contact}</td>
                  <td>{getPriorityBadge(r.urgency || r.priority)}</td>
                  <td>
                    <span className={`badge-${r.status === "approved" ? "normal" : r.status === "rejected" ? "emergency" : "urgent"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {confirmDelete === r.id ? (
                      <div style={{display:"flex", gap:"6px"}}>
                        <button className="btn-danger" style={{padding:"6px 12px", fontSize:"12px"}} onClick={() => handleDelete(r.id)}>Confirm</button>
                        <button className="btn-success" style={{padding:"6px 12px", fontSize:"12px"}} onClick={() => setConfirmDelete(null)}>Cancel</button>
                      </div>
                    ) : (
                      <button className="btn-danger" style={{padding:"6px 12px", fontSize:"12px"}} onClick={() => setConfirmDelete(r.id)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );

    if (activeTab === "Verifications") return (
      <div>
        <div className="tab-buttons">
          {["Pending", "Approved", "Rejected"].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${verifyTab === tab ? "active" : ""}`}
              onClick={() => setVerifyTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div style={{display:"flex", flexDirection:"column", gap:"12px"}}>
          {requests
            .filter(r => r.status === verifyTab.toLowerCase())
            .length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-emoji">📋</span>
              <h3>No {verifyTab} requests</h3>
              <p>There are no {verifyTab.toLowerCase()} requests at the moment</p>
            </div>
          ) : (
            requests
              .filter(r => r.status === verifyTab.toLowerCase())
              .map(r => (
                <div key={r.id} className="request-card">
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                    <div>
                      <h4 style={{fontWeight:"700"}}>{r.hospitalName}</h4>
                      <p style={{fontSize:"13px", color:"var(--gray-500)"}}>
                        {getTypeEmoji(r.donationType)} {r.donationType} · {r.location}
                      </p>
                    </div>
                    <div style={{display:"flex", gap:"8px", alignItems:"center"}}>
                      {getPriorityBadge(r.urgency || r.priority)}
                      {verifyTab === "Pending" && (
                        <>
                          <button className="btn-success" style={{padding:"7px 14px", fontSize:"12px"}} onClick={() => handleApprove(r.id)}>✅ Approve</button>
                          <button className="btn-danger" style={{padding:"7px 14px", fontSize:"12px"}} onClick={() => handleReject(r.id)}>❌ Reject</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    );

    if (activeTab === "Reports") return (
      <div>
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-card-label">Total Requests</p>
            <p className="stat-card-number">{stats.total}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Approved</p>
            <p className="stat-card-number green">
              {requests.filter(r => r.status === "approved").length}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Pending</p>
            <p className="stat-card-number orange">
              {requests.filter(r => r.status === "pending").length}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Rejected</p>
            <p className="stat-card-number red">
              {requests.filter(r => r.status === "rejected").length}
            </p>
          </div>
        </div>
        <div className="alert-info">
          📊 Detailed analytics and charts will be available in the next version of LifeLink.
        </div>
      </div>
    );

    if (activeTab === "Settings") return (
      <div className="form-card" style={{maxWidth:"500px"}}>
        <h3 style={{fontSize:"16px", fontWeight:"700", marginBottom:"20px"}}>
          System Settings
        </h3>
        <div className="form-group">
          <label>Admin Email</label>
          <input className="form-input" value={auth.currentUser?.email || ""} readOnly />
        </div>
        <div className="form-group">
          <label>System Name</label>
          <input className="form-input" value="LifeLink — Donation Management System" readOnly />
        </div>
        <div className="form-group">
          <label>Version</label>
          <input className="form-input" value="v1.0.0" readOnly />
        </div>
        <div className="form-group">
          <label>Country</label>
          <input className="form-input" value="Sri Lanka 🇱🇰" readOnly />
        </div>
      </div>
    );
  };

  return (
    <div className="app-layout">
      {/* ADMIN SIDEBAR */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <img src="/logo.jpg" alt="LifeLink Logo" style={{width:"36px", height:"36px", objectFit:"contain", borderRadius:"8px"}} />
          <span>Life Link</span>
        </div>
        <div className="admin-sidebar-nav">
          {navItems.map(item => (
            <button
              key={item}
              className={`admin-nav-item ${activeTab === item ? "active" : ""}`}
              onClick={() => setActiveTab(item)}
            >
              {item === "Dashboard" && "📊"}
              {item === "Requests" && "📋"}
              {item === "Verifications" && "✅"}
              {item === "Reports" && "📈"}
              {item === "Settings" && "⚙️"}
              {" "}{item}
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <button className="admin-nav-item logout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        <div className="admin-top-bar">
          <h2 style={{fontSize:"20px", fontWeight:"700"}}>Admin Dashboard</h2>
          <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
            <div style={{textAlign:"right"}}>
              <p style={{fontSize:"14px", fontWeight:"600"}}>Admin User</p>
              <p style={{fontSize:"12px", color:"var(--gray-500)"}}>Administrator</p>
            </div>
            <div className="top-bar-avatar">A</div>
          </div>
        </div>
        <div className="page-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;