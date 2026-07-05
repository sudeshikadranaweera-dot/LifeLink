import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Navbar from "./Navbar";

function ViewRequests() {
  const [requests, setRequests] = useState([]);
  const [bloodFilter, setBloodFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const q = query(
        collection(db, "donationRequests"),
        where("status", "==", "approved")
      );
      const querySnapshot = await getDocs(q);
      const requestsList = [];
      querySnapshot.forEach((doc) => {
        requestsList.push({ id: doc.id, ...doc.data() });
      });
      setRequests(requestsList);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const filteredRequests = bloodFilter === "All"
    ? requests
    : requests.filter((r) => r.bloodGroup === bloodFilter);

  return (
    <div>
      <Navbar />
      <div className="requests-container">
        <h2>Donation Requests</h2>
        <div className="filter-section">
          <label>Filter by Blood Type: </label>
          <select
            value={bloodFilter}
            onChange={(e) => setBloodFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>
        {loading ? (
          <p>Loading requests...</p>
        ) : filteredRequests.length === 0 ? (
          <p>No donation requests found.</p>
        ) : (
          <div className="requests-grid">
            {filteredRequests.map((request) => (
              <div key={request.id} className="request-card">
                <h3>{request.hospitalName}</h3>
                <p><strong>Blood Type:</strong> {request.bloodGroup}</p>
                <p><strong>Urgency:</strong> {request.urgency}</p>
                <p><strong>Location:</strong> {request.location}</p>
                <p><strong>Contact:</strong> {request.contact}</p>
                <p><strong>Details:</strong> {request.details}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewRequests;

import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import Navbar from "./Navbar";

function ViewRequests() {
  const [requests, setRequests] = useState([]);
  const [donationFilter, setDonationFilter] = useState("All");
  const [districtFilter, setDistrictFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [bloodFilter, setBloodFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [respondSuccess, setRespondSuccess] = useState("");

  const districts = [
    "All", "Colombo", "Kandy", "Galle", "Jaffna", "Matara",
    "Kurunegala", "Ratnapura", "Badulla", "Anuradhapura",
    "Trincomalee", "Batticaloa", "Negombo", "Hambantota",
    "Polonnaruwa", "Ampara", "Kegalle", "Kalutara"
  ];

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const q = query(
        collection(db, "donationRequests"),
        where("status", "==", "approved")
      );
      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setRequests(list);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleRespond = async (request) => {
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, "responses"), {
        requestId: request.id,
        hospitalName: request.hospitalName,
        donorId: user.uid,
        donorEmail: user.email,
        donationType: request.donationType,
        respondedAt: new Date()
      });
      setRespondSuccess("✅ Response sent! The hospital will contact you soon.");
      setTimeout(() => setRespondSuccess(""), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (donationFilter !== "All" && r.donationType !== donationFilter) return false;
    if (districtFilter !== "All" && r.location !== districtFilter) return false;
    if (priorityFilter !== "All" && (r.urgency || r.priority) !== priorityFilter) return false;
    if (donationFilter === "Blood" && bloodFilter !== "All" && r.bloodGroup !== bloodFilter) return false;
    return true;
  });

  const getTypeIcon = (type) => {
    if (type === "Blood") return { emoji: "🩸", class: "type-blood" };
    if (type === "Organ") return { emoji: "🫀", class: "type-organ" };
    if (type === "Hair") return { emoji: "✂️", class: "type-hair" };
    if (type === "Eye") return { emoji: "👁️", class: "type-eye" };
    return { emoji: "💊", class: "type-other" };
  };

  const getPriorityBadge = (priority) => {
    const p = priority || "Normal";
    if (p === "Emergency") return <span className="badge-emergency">🔴 Emergency</span>;
    if (p === "Urgent") return <span className="badge-urgent">🟡 Urgent</span>;
    return <span className="badge-normal">🟢 Normal</span>;
  };

  return (
    <div className="app-layout">
      <Navbar />
      <div className="main-content">
        <div className="top-bar">
          <div className="top-bar-title">
            <h2>All Donation Requests</h2>
            <p>{filteredRequests.length} requests found</p>
          </div>
        </div>
        <div className="page-content">
          {respondSuccess && (
            <div className="alert-success">{respondSuccess}</div>
          )}

          {/* FILTER BAR */}
          <div className="filter-bar">
            <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
              <label>Type:</label>
              <select
                className="form-select"
                style={{width:"auto", padding:"8px 12px"}}
                value={donationFilter}
                onChange={e => setDonationFilter(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="Blood">🩸 Blood</option>
                <option value="Organ">🫀 Organ</option>
                <option value="Hair">✂️ Hair</option>
                <option value="Eye">👁️ Eye</option>
              </select>
            </div>
            {donationFilter === "Blood" && (
              <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
                <label>Blood:</label>
                <select
                  className="form-select"
                  style={{width:"auto", padding:"8px 12px"}}
                  value={bloodFilter}
                  onChange={e => setBloodFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            )}
            <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
              <label>District:</label>
              <select
                className="form-select"
                style={{width:"auto", padding:"8px 12px"}}
                value={districtFilter}
                onChange={e => setDistrictFilter(e.target.value)}
              >
                {districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
              <label>Priority:</label>
              <select
                className="form-select"
                style={{width:"auto", padding:"8px 12px"}}
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Emergency">🔴 Emergency</option>
                <option value="Urgent">🟡 Urgent</option>
                <option value="Normal">🟢 Normal</option>
              </select>
            </div>
          </div>

          {/* REQUESTS + DETAIL */}
          <div className={`requests-layout ${selectedRequest ? "with-detail" : ""}`}>
            {/* REQUEST LIST */}
            <div style={{display:"flex", flexDirection:"column", gap:"12px"}}>
              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>Loading requests...</p>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state-emoji">📋</span>
                  <h3>No requests found</h3>
                  <p>Try changing your filters</p>
                </div>
              ) : (
                filteredRequests.map(request => {
                  const typeInfo = getTypeIcon(request.donationType);
                  return (
                    <div
                      key={request.id}
                      className="request-card"
                      onClick={() => setSelectedRequest(request)}
                      style={{
                        border: selectedRequest?.id === request.id
                          ? "2px solid var(--primary)"
                          : "1px solid var(--gray-200)"
                      }}
                    >
                      <div className="request-card-row">
                        <div className={`request-type-icon ${typeInfo.class}`}>
                          {typeInfo.emoji}
                        </div>
                        <div className="request-card-info">
                          <h4>{request.donationType} Donation</h4>
                          <p>{request.hospitalName} · {request.location}</p>
                        </div>
                        <div className="request-card-right">
                          {getPriorityBadge(request.urgency || request.priority)}
                          <button
                            className="btn-primary"
                            style={{fontSize:"12px", padding:"6px 14px"}}
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedRequest(request);
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* DETAIL PANEL */}
            {selectedRequest && (
              <div className="detail-panel">
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px"}}>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    style={{background:"none", border:"none", cursor:"pointer", fontSize:"20px", color:"var(--gray-500)"}}
                  >
                    ←
                  </button>
                  {getPriorityBadge(selectedRequest.urgency || selectedRequest.priority)}
                </div>
                <h3 style={{fontSize:"20px", fontWeight:"700", marginBottom:"6px"}}>
                  {selectedRequest.donationType} Donation
                </h3>
                <p style={{color:"var(--gray-500)", marginBottom:"20px"}}>
                  {selectedRequest.hospitalName}
                </p>
                <div className="detail-info-grid">
                  <div className="detail-info-item">
                    <label>Donation Type</label>
                    <span>{selectedRequest.donationType}</span>
                  </div>
                  <div className="detail-info-item">
                    <label>District</label>
                    <span>{selectedRequest.location}</span>
                  </div>
                  <div className="detail-info-item">
                    <label>Hospital</label>
                    <span>{selectedRequest.hospitalName}</span>
                  </div>
                  <div className="detail-info-item">
                    <label>Contact</label>
                    <span>{selectedRequest.contact}</span>
                  </div>
                  {selectedRequest.bloodGroup && (
                    <div className="detail-info-item">
                      <label>Blood Group</label>
                      <span>{selectedRequest.bloodGroup}</span>
                    </div>
                  )}
                  {selectedRequest.organType && (
                    <div className="detail-info-item">
                      <label>Organ Type</label>
                      <span>{selectedRequest.organType}</span>
                    </div>
                  )}
                  <div className="detail-info-item">
                    <label>Priority</label>
                    <span>{selectedRequest.urgency || selectedRequest.priority}</span>
                  </div>
                </div>
                {selectedRequest.details && (
                  <p style={{
                    background:"var(--gray-100)",
                    padding:"14px",
                    borderRadius:"var(--radius)",
                    fontSize:"13px",
                    color:"var(--gray-700)",
                    marginBottom:"20px"
                  }}>
                    {selectedRequest.details}
                  </p>
                )}
                <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
                  <button
                    className="btn-primary"
                    style={{width:"100%", padding:"14px", justifyContent:"center"}}
                    onClick={() => handleRespond(selectedRequest)}
                  >
                    ❤️ I Want to Help
                  </button>
                  <button
                    className="btn-secondary"
                    style={{width:"100%", padding:"14px", justifyContent:"center"}}
                    onClick={() => window.open(`tel:${selectedRequest.contact}`)}
                  >
                    📞 Contact Hospital
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewRequests;


