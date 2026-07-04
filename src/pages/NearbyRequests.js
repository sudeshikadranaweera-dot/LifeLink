import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "./Navbar";

function NearbyRequests() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [typeFilter, setTypeFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = requests;
    if (typeFilter !== "All")
      result = result.filter(r => r.donationType === typeFilter);
    if (priorityFilter !== "All")
      result = result.filter(r =>
        (r.priority || r.urgency) === priorityFilter);
    setFiltered(result);
  }, [typeFilter, priorityFilter, requests]);

  const fetchData = async () => {
    try {
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const profileData = docSnap.data();
          setProfile(profileData);
          const q = query(
            collection(db, "donationRequests"),
            where("status", "==", "approved"),
            where("location", "==", profileData.district)
          );
          const snapshot = await getDocs(q);
          const list = [];
          snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
          setRequests(list);
          setFiltered(list);
        }
      }
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
        <div className="top-bar">
          <div className="top-bar-title">
            <h2>Nearby Requests</h2>
            <p>Requests in your district: {profile?.district}</p>
          </div>
        </div>
        <div className="page-content">
          <div className="alert-info" style={{marginBottom:"20px"}}>
            📍 Showing requests near <strong>{profile?.district}</strong>.
            Update your district in My Profile to see different results.
          </div>
          <div className="filter-bar">
            <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
              <label>Type:</label>
              <select className="form-select"
                style={{width:"auto", padding:"8px 12px"}}
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}>
                <option value="All">All Types</option>
                <option value="Blood">🩸 Blood</option>
                <option value="Organ">💚 Organ</option>
                <option value="Hair">✂️ Hair</option>
                <option value="Eye">👁️ Eye</option>
              </select>
            </div>
            <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
              <label>Priority:</label>
              <select className="form-select"
                style={{width:"auto", padding:"8px 12px"}}
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}>
                <option value="All">All Priorities</option>
                <option value="Emergency">🔴 Emergency</option>
                <option value="Urgent">🟡 Urgent</option>
                <option value="Normal">🟢 Normal</option>
              </select>
            </div>
          </div>
          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-emoji">📍</span>
              <h3>No requests in your district yet</h3>
              <p>Check back later or browse all requests</p>
              <button className="btn-primary"
                style={{marginTop:"16px"}}
                onClick={() => navigate("/requests")}>
                View all requests from Sri Lanka →
              </button>
            </div>
          ) : (
            <div style={{display:"flex", flexDirection:"column", gap:"12px"}}>
              {filtered.map(r => {
                const typeInfo = getTypeInfo(r.donationType);
                const priority = r.priority || r.urgency;
                return (
                  <div key={r.id} className="request-card"
                    onClick={() => navigate("/requests")}>
                    <div className="request-card-row">
                      <div className={`request-type-icon ${typeInfo.class}`}>
                        {typeInfo.emoji}
                      </div>
                      <div className="request-card-info">
                        <h4>{r.donationType} Donation</h4>
                        <p>{r.hospitalName} · {r.location}</p>
                      </div>
                      <div className="request-card-right">
                        {getPriorityBadge(priority)}
                        <button className="btn-primary"
                          style={{fontSize:"12px", padding:"6px 14px"}}>
                          View Details
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

export default NearbyRequests;