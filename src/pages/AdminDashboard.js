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
  const [donors, setDonors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filterType, setFilterType] = useState("All");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const snapshot = await getDocs(collection(db, "donationRequests"));
      const list = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setRequests(list);

      const usersSnap = await getDocs(collection(db, "users"));
      const donorList = [];
      const hospitalList = [];
      usersSnap.forEach(doc => {
        const data = { id: doc.id, ...doc.data() };
        if (data.role === "donor") donorList.push(data);
        if (data.role === "hospital") hospitalList.push(data);
      });
      setDonors(donorList);
      setHospitals(hospitalList);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    await updateDoc(doc(db, "donationRequests", id),
      { status: "approved" });
    setSuccess("✅ Request approved successfully!");
    setTimeout(() => setSuccess(""), 3000);
    fetchData();
  };

  const handleReject = async (id) => {
    await updateDoc(doc(db, "donationRequests", id),
      { status: "rejected" });
    fetchData();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "donationRequests", id));
    setConfirmDelete(null);
    fetchData();
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin");
  };

  const stats = {
    total: requests.length,
    emergency: requests.filter(r =>
      (r.urgency || r.priority) === "Emergency").length,
    urgent: requests.filter(r =>
      (r.urgency || r.priority) === "Urgent").length,
    normal: requests.filter(r =>
      (r.urgency || r.priority) === "Normal").length,
    approved: requests.filter(r => r.status === "approved").length,
    pending: requests.filter(r => r.status === "pending").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  const getPriorityBadge = (p) => {
    const priority = p || "Normal";
    if (priority === "Emergency")
      return <span className="badge-emergency">Emergency</span>;
    if (priority === "Urgent")
      return <span className="badge-urgent">Urgent</span>;
    return <span className="badge-normal">Normal</span>;
  };

  const getTypeEmoji = (type) => {
    if (type === "Blood") return "🩸";
    if (type === "Organ") return "💚";
    if (type === "Hair") return "✂️";
    if (type === "Eye") return "👁️";
    return "💊";
  };

  const getFilteredRequests = () => {
    if (filterType === "All") return requests;
    if (filterType === "Emergency") return requests.filter(r =>
      (r.urgency || r.priority) === "Emergency");
    if (filterType === "Urgent") return requests.filter(r =>
      (r.urgency || r.priority) === "Urgent");
    if (filterType === "Normal") return requests.filter(r =>
      (r.urgency || r.priority) === "Normal");
    return requests;
  };

  const navItems = [
    { id: "Dashboard", emoji: "📊" },
    { id: "Users", emoji: "👥" },
    { id: "Hospitals", emoji: "🏥" },
    { id: "Requests", emoji: "📋" },
    { id: "Verifications", emoji: "✅" },
    { id: "Reports", emoji: "📈" },
    { id: "Settings", emoji: "⚙️" },
  ];

  const renderContent = () => {

    if (activeTab === "Dashboard") return (
      <div>
        {success && <div className="alert-success">{success}</div>}

        {/* STATS GRID */}
        <div className="stats-grid">
          <div className="stat-card" style={{cursor:"pointer"}}
            onClick={() => {
              setFilterType("All");
              setActiveTab("Requests");
            }}>
            <p className="stat-card-label">Total Requests</p>
            <p className="stat-card-number">{stats.total}</p>
            <button className="stat-card-link">View All →</button>
          </div>
          <div className="stat-card" style={{cursor:"pointer"}}
            onClick={() => {
              setFilterType("Emergency");
              setActiveTab("Requests");
            }}>
            <p className="stat-card-label">Emergency</p>
            <p className="stat-card-number red">{stats.emergency}</p>
            <button className="stat-card-link">View All →</button>
          </div>
          <div className="stat-card" style={{cursor:"pointer"}}
            onClick={() => {
              setFilterType("Urgent");
              setActiveTab("Requests");
            }}>
            <p className="stat-card-label">Urgent</p>
            <p className="stat-card-number orange">{stats.urgent}</p>
            <button className="stat-card-link">View All →</button>
          </div>
          <div className="stat-card" style={{cursor:"pointer"}}
            onClick={() => {
              setFilterType("Normal");
              setActiveTab("Requests");
            }}>
            <p className="stat-card-label">Normal</p>
            <p className="stat-card-number green">{stats.normal}</p>
            <button className="stat-card-link">View All →</button>
          </div>
        </div>

        {/* SECOND STATS ROW */}
        <div className="stats-grid" style={{marginTop:"16px"}}>
          <div className="stat-card">
            <p className="stat-card-label">Total Donors</p>
            <p className="stat-card-number green">{donors.length}</p>
            <button className="stat-card-link"
              onClick={() => setActiveTab("Users")}>
              View All →
            </button>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Total Hospitals</p>
            <p className="stat-card-number">{hospitals.length}</p>
            <button className="stat-card-link"
              onClick={() => setActiveTab("Hospitals")}>
              View All →
            </button>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Approved</p>
            <p className="stat-card-number green">{stats.approved}</p>
            <button className="stat-card-link"
              onClick={() => setActiveTab("Verifications")}>
              View All →
            </button>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Pending</p>
            <p className="stat-card-number orange">{stats.pending}</p>
            <button className="stat-card-link"
              onClick={() => {
                setVerifyTab("Pending");
                setActiveTab("Verifications");
              }}>
              View All →
            </button>
          </div>
        </div>

        {/* RECENT REQUESTS */}
        <div className="form-card" style={{marginTop:"24px"}}>
          <h3 style={{fontSize:"16px", fontWeight:"700",
            marginBottom:"16px"}}>
            Recent Requests
          </h3>
          {requests.slice(0, 5).map(r => (
            <div key={r.id} style={{
              display:"flex", alignItems:"center",
              gap:"12px", padding:"12px 0",
              borderBottom:"1px solid var(--gray-200)"}}>
              <span style={{fontSize:"24px"}}>
                {getTypeEmoji(r.donationType)}
              </span>
              <div style={{flex:1}}>
                <p style={{fontWeight:"600", fontSize:"14px"}}>
                  {r.hospitalName}
                </p>
                <p style={{fontSize:"12px",
                  color:"var(--gray-500)"}}>
                  {r.location || r.district} · {r.donationType}
                </p>
              </div>
              <div style={{display:"flex",
                alignItems:"center", gap:"8px"}}>
                {getPriorityBadge(r.urgency || r.priority)}
                <span className={`badge-${
                  r.status === "approved" ? "normal" :
                  r.status === "rejected" ? "emergency" : "urgent"
                }`}>
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    if (activeTab === "Users") return (
      <div className="form-card">
        <h3 style={{fontSize:"16px", fontWeight:"700",
          marginBottom:"16px"}}>
          Registered Donors ({donors.length})
        </h3>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : donors.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-emoji">👥</span>
            <h3>No donors registered yet</h3>
          </div>
        ) : (
          <div style={{overflowX:"auto"}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>District</th>
                  <th>Blood Group</th>
                  <th>Can Donate</th>
                  <th>Availability</th>
                </tr>
              </thead>
              <tbody>
                {donors.map(d => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>{d.email}</td>
                    <td>{d.district}</td>
                    <td>{d.bloodGroup}</td>
                    <td>{d.donationTypes?.join(", ") || "Not set"}</td>
                    <td>
                      <span className={`badge-${
                        d.availability === "Available"
                          ? "normal" : "urgent"}`}>
                        {d.availability || "Available"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );

    if (activeTab === "Hospitals") return (
      <div className="form-card">
        <h3 style={{fontSize:"16px", fontWeight:"700",
          marginBottom:"16px"}}>
          Registered Hospitals ({hospitals.length})
        </h3>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : hospitals.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-emoji">🏥</span>
            <h3>No hospitals registered yet</h3>
          </div>
        ) : (
          <div style={{overflowX:"auto"}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Hospital Name</th>
                  <th>Email</th>
                  <th>District</th>
                  <th>Phone</th>
                  <th>Reg Number</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {hospitals.map(h => (
                  <tr key={h.id}>
                    <td>{h.name}</td>
                    <td>{h.email}</td>
                    <td>{h.district}</td>
                    <td>{h.phone}</td>
                    <td>{h.registrationNumber || "Not provided"}</td>
                    <td>
                      <span className={`badge-${
                        h.verified ? "normal" : "urgent"}`}>
                        {h.verified ? "✅ Verified" : "⏳ Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );

    if (activeTab === "Requests") return (
      <div className="form-card">
        <div style={{display:"flex", justifyContent:"space-between",
          alignItems:"center", marginBottom:"16px"}}>
          <h3 style={{fontSize:"16px", fontWeight:"700"}}>
            All Requests
          </h3>
          <select className="form-select"
            style={{width:"auto", padding:"8px 12px"}}
            value={filterType}
            onChange={e => setFilterType(e.target.value)}>
            <option value="All">All Priorities</option>
            <option value="Emergency">🔴 Emergency</option>
            <option value="Urgent">🟡 Urgent</option>
            <option value="Normal">🟢 Normal</option>
          </select>
        </div>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : getFilteredRequests().length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-emoji">📋</span>
            <h3>No requests found</h3>
          </div>
        ) : (
          <div style={{overflowX:"auto"}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Hospital</th>
                  <th>District</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredRequests().map(r => (
                  <tr key={r.id}>
                    <td>{getTypeEmoji(r.donationType)} {r.donationType}</td>
                    <td>{r.hospitalName}</td>
                    <td>{r.location || r.district}</td>
                    <td>{getPriorityBadge(r.urgency || r.priority)}</td>
                    <td>
                      <span className={`badge-${
                        r.status === "approved" ? "normal" :
                        r.status === "rejected" ? "emergency" : "urgent"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td>{r.createdAt?.toDate
                      ? r.createdAt.toDate().toLocaleDateString()
                      : "Recently"}</td>
                    <td>
                      {confirmDelete === r.id ? (
                        <div style={{display:"flex", gap:"6px"}}>
                          <button className="btn-danger"
                            style={{padding:"5px 10px",
                              fontSize:"12px"}}
                            onClick={() => handleDelete(r.id)}>
                            Confirm
                          </button>
                          <button className="btn-success"
                            style={{padding:"5px 10px",
                              fontSize:"12px"}}
                            onClick={() => setConfirmDelete(null)}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button className="btn-danger"
                          style={{padding:"5px 10px",
                            fontSize:"12px"}}
                          onClick={() => setConfirmDelete(r.id)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );

    if (activeTab === "Verifications") return (
      <div>
        <div className="tab-buttons">
          {["Pending","Approved","Rejected"].map(tab => (
            <button key={tab}
              className={`tab-btn ${verifyTab === tab ? "active" : ""}`}
              onClick={() => setVerifyTab(tab)}>
              {tab}
            </button>
          ))}
        </div>
        {success && <div className="alert-success">{success}</div>}
        <div style={{display:"flex",
          flexDirection:"column", gap:"16px"}}>
          {requests
            .filter(r => r.status === verifyTab.toLowerCase())
            .length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-emoji">📋</span>
              <h3>No {verifyTab} requests</h3>
            </div>
          ) : (
            requests
              .filter(r => r.status === verifyTab.toLowerCase())
              .map(r => (
                <div key={r.id} className="form-card">
                  <div style={{display:"flex",
                    justifyContent:"space-between",
                    alignItems:"center",
                    marginBottom:"16px",
                    paddingBottom:"12px",
                    borderBottom:"1px solid var(--gray-200)"}}>
                    <div>
                      <h3 style={{fontSize:"16px",
                        fontWeight:"700"}}>
                        {r.hospitalName}
                      </h3>
                      <p style={{fontSize:"13px",
                        color:"var(--gray-500)"}}>
                        Posted: {r.createdAt?.toDate
                          ? r.createdAt.toDate().toLocaleDateString()
                          : "Recently"}
                      </p>
                    </div>
                    {getPriorityBadge(r.urgency || r.priority)}
                  </div>
                  <div style={{display:"grid",
                    gridTemplateColumns:"1fr 1fr",
                    gap:"12px", marginBottom:"16px"}}>
                    <div style={{background:"var(--gray-100)",
                      padding:"12px",
                      borderRadius:"var(--radius)"}}>
                      <p style={{fontSize:"11px",
                        color:"var(--gray-500)",
                        fontWeight:"600", marginBottom:"4px"}}>
                        DONATION TYPE
                      </p>
                      <p style={{fontSize:"14px", fontWeight:"700"}}>
                        {getTypeEmoji(r.donationType)} {r.donationType}
                      </p>
                    </div>
                    <div style={{background:"var(--gray-100)",
                      padding:"12px",
                      borderRadius:"var(--radius)"}}>
                      <p style={{fontSize:"11px",
                        color:"var(--gray-500)",
                        fontWeight:"600", marginBottom:"4px"}}>
                        DISTRICT
                      </p>
                      <p style={{fontSize:"14px", fontWeight:"700"}}>
                        📍 {r.location || r.district}
                      </p>
                    </div>
                    <div style={{background:"var(--gray-100)",
                      padding:"12px",
                      borderRadius:"var(--radius)"}}>
                      <p style={{fontSize:"11px",
                        color:"var(--gray-500)",
                        fontWeight:"600", marginBottom:"4px"}}>
                        {r.donationType === "Blood"
                          ? "BLOOD GROUP" : "ORGAN NEEDED"}
                      </p>
                      <p style={{fontSize:"14px", fontWeight:"700"}}>
                        {r.bloodGroup || r.organNeeded || "Not specified"}
                      </p>
                    </div>
                    <div style={{background:"var(--gray-100)",
                      padding:"12px",
                      borderRadius:"var(--radius)"}}>
                      <p style={{fontSize:"11px",
                        color:"var(--gray-500)",
                        fontWeight:"600", marginBottom:"4px"}}>
                        PATIENTS
                      </p>
                      <p style={{fontSize:"14px", fontWeight:"700"}}>
                        {r.patients || 1} Patient(s)
                      </p>
                    </div>
                    <div style={{background:"var(--gray-100)",
                      padding:"12px",
                      borderRadius:"var(--radius)"}}>
                      <p style={{fontSize:"11px",
                        color:"var(--gray-500)",
                        fontWeight:"600", marginBottom:"4px"}}>
                        CONTACT
                      </p>
                      <p style={{fontSize:"14px", fontWeight:"700"}}>
                        📞 {r.contact || "Not provided"}
                      </p>
                    </div>
                    <div style={{background:"var(--gray-100)",
                      padding:"12px",
                      borderRadius:"var(--radius)"}}>
                      <p style={{fontSize:"11px",
                        color:"var(--gray-500)",
                        fontWeight:"600", marginBottom:"4px"}}>
                        PRIORITY
                      </p>
                      <p style={{fontSize:"14px", fontWeight:"700"}}>
                        {r.urgency || r.priority}
                      </p>
                    </div>
                  </div>
                  {r.details && (
                    <div style={{
                      background:"var(--primary-light)",
                      padding:"12px 16px",
                      borderRadius:"var(--radius)",
                      marginBottom:"16px"}}>
                      <p style={{fontSize:"11px",
                        color:"var(--primary)",
                        fontWeight:"600", marginBottom:"4px"}}>
                        ADDITIONAL DETAILS
                      </p>
                      <p style={{fontSize:"13px",
                        color:"var(--gray-700)"}}>
                        {r.details}
                      </p>
                    </div>
                  )}
                  {verifyTab === "Pending" && (
                    <div style={{display:"flex", gap:"10px"}}>
                      <button className="btn-success"
                        style={{flex:1, padding:"12px",
                          fontSize:"14px"}}
                        onClick={() => handleApprove(r.id)}>
                        ✅ Approve Request
                      </button>
                      <button className="btn-danger"
                        style={{flex:1, padding:"12px",
                          fontSize:"14px"}}
                        onClick={() => handleReject(r.id)}>
                        ❌ Reject Request
                      </button>
                    </div>
                  )}
                  {verifyTab === "Approved" && (
                    <span className="badge-normal">✅ Approved</span>
                  )}
                  {verifyTab === "Rejected" && (
                    <span className="badge-emergency">❌ Rejected</span>
                  )}
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
            <p className="stat-card-number green">{stats.approved}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Pending</p>
            <p className="stat-card-number orange">{stats.pending}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Rejected</p>
            <p className="stat-card-number red">{stats.rejected}</p>
          </div>
        </div>
        <div className="stats-grid" style={{marginTop:"16px"}}>
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
          <div className="stat-card">
            <p className="stat-card-label">Total Donors</p>
            <p className="stat-card-number">{donors.length}</p>
          </div>
        </div>
        <div className="form-card" style={{marginTop:"24px"}}>
          <h3 style={{fontSize:"16px", fontWeight:"700",
            marginBottom:"16px"}}>
            Donation Type Breakdown
          </h3>
          {["Blood","Organ","Hair","Eye"].map(type => {
            const count = requests.filter(r =>
              r.donationType === type).length;
            const percentage = requests.length > 0
              ? Math.round((count / requests.length) * 100) : 0;
            return (
              <div key={type} style={{marginBottom:"12px"}}>
                <div style={{display:"flex",
                  justifyContent:"space-between",
                  marginBottom:"4px"}}>
                  <span style={{fontSize:"13px", fontWeight:"600"}}>
                    {getTypeEmoji(type)} {type}
                  </span>
                  <span style={{fontSize:"13px",
                    color:"var(--gray-500)"}}>
                    {count} requests ({percentage}%)
                  </span>
                </div>
                <div style={{background:"var(--gray-200)",
                  borderRadius:"99px", height:"8px"}}>
                  <div style={{
                    background:"var(--primary)",
                    borderRadius:"99px",
                    height:"8px",
                    width:`${percentage}%`,
                    transition:"width 0.3s"
                  }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );

    if (activeTab === "Settings") return (
      <div className="form-card" style={{maxWidth:"500px"}}>
        <h3 style={{fontSize:"16px", fontWeight:"700",
          marginBottom:"20px"}}>
          System Settings
        </h3>
        <div className="form-group">
          <label>Admin Email</label>
          <input className="form-input"
            value={auth.currentUser?.email || ""}
            readOnly />
        </div>
        <div className="form-group">
          <label>System Name</label>
          <input className="form-input"
            value="LifeLink — Donation Management System"
            readOnly />
        </div>
        <div className="form-group">
          <label>Database</label>
          <input className="form-input"
            value="Firebase Firestore (asia-south1)"
            readOnly />
        </div>
        <div className="form-group">
          <label>Hosting</label>
          <input className="form-input"
            value="Firebase Hosting"
            readOnly />
        </div>
        <div className="form-group">
          <label>Live URL</label>
          <input className="form-input"
            value="https://lifelink-5d0c4.web.app"
            readOnly />
        </div>
        <div className="form-group">
          <label>Version</label>
          <input className="form-input"
            value="v1.0.0 — CIT310 Group Project — SLTC"
            readOnly />
        </div>
      </div>
    );
  };

  return (
    <div className="app-layout">
      <div className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <img src="/logo.jpg" alt="LifeLink"
            style={{width:"36px", height:"36px",
            objectFit:"contain", borderRadius:"8px"}} />
          <span>Life Link</span>
        </div>
        <div style={{padding:"16px"}}>
          <div style={{
            display:"flex", alignItems:"center",
            gap:"10px", padding:"12px",
            background:"var(--primary-light)",
            borderRadius:"var(--radius)",
            marginBottom:"8px"}}>
            <div style={{
              width:"36px", height:"36px",
              background:"var(--primary)",
              borderRadius:"50%",
              display:"flex", alignItems:"center",
              justifyContent:"center",
              color:"white", fontWeight:"700"}}>
              A
            </div>
            <div>
              <p style={{fontSize:"13px", fontWeight:"600"}}>
                Admin User
              </p>
              <p style={{fontSize:"11px",
                color:"var(--gray-500)"}}>
                Administrator
              </p>
            </div>
          </div>
        </div>
        <div className="admin-sidebar-nav">
          {navItems.map(item => (
            <button key={item.id}
              className={`admin-nav-item
                ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}>
              {item.emoji} {item.id}
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <button className="admin-nav-item logout"
            onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>
      <div className="main-content">
        <div className="admin-top-bar">
          <div>
            <h2 style={{fontSize:"20px", fontWeight:"700"}}>
              {activeTab}
            </h2>
            <p style={{fontSize:"13px", color:"var(--gray-500)"}}>
              LifeLink Admin Panel
            </p>
          </div>
          <div style={{display:"flex",
            alignItems:"center", gap:"10px"}}>
            <div style={{textAlign:"right"}}>
              <p style={{fontSize:"14px", fontWeight:"600"}}>
                Admin User
              </p>
              <p style={{fontSize:"12px",
                color:"var(--gray-500)"}}>
                Administrator
              </p>
            </div>
            <div className="top-bar-avatar">A</div>
          </div>
        </div>
        <div className="page-content">
          {loading && activeTab === "Dashboard" ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
