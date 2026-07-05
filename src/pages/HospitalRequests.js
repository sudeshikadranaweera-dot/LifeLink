import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where,
  doc, updateDoc, deleteDoc } from "firebase/firestore";
import HospitalNavbar from "./HospitalNavbar";

function HospitalRequests() {
  const user = auth.currentUser;
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [tab, setTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (tab === "All") setFiltered(requests);
    else if (tab === "Open") setFiltered(requests.filter(r =>
      r.status === "approved" || r.status === "Open"
        || r.status === "pending"));
    else if (tab === "Closed") setFiltered(requests.filter(r =>
      r.status === "Closed" || r.status === "rejected"));
    else if (tab === "Emergency") setFiltered(requests.filter(r =>
      (r.priority || r.urgency) === "Emergency"));
  }, [tab, requests]);

  const fetchRequests = async () => {
    try {
      const q = query(
        collection(db, "donationRequests"),
        where("hospitalId", "==", user?.uid)
      );
      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
      setRequests(list);
      setFiltered(list);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleClose = async (id) => {
    await updateDoc(doc(db, "donationRequests", id),
      { status: "Closed" });
    fetchRequests();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "donationRequests", id));
    setConfirmDelete(null);
    fetchRequests();
  };

  const getPriorityBadge = (p) => {
    if (p === "Emergency")
      return <span className="badge-emergency">Emergency</span>;
    if (p === "Urgent")
      return <span className="badge-urgent">Urgent</span>;
    return <span className="badge-normal">Normal</span>;
  };

  const getStatusBadge = (status) => {
    if (status === "approved")
      return <span className="badge-normal">Approved</span>;
    if (status === "pending")
      return <span className="badge-urgent">Pending</span>;
    return <span className="badge-emergency">Closed</span>;
  };

  return (
    <div className="app-layout">
      <HospitalNavbar />
      <div className="main-content">
        <div className="top-bar">
          <div className="top-bar-title">
            <h2>My Requests</h2>
            <p>{filtered.length} requests posted</p>
          </div>
        </div>
        <div className="page-content">
          <div className="tab-buttons">
            {["All","Open","Closed","Emergency"].map(t => (
              <button key={t}
                className={`tab-btn ${tab === t ? "active" : ""}`}
                onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : filtered.length === 0 ? (
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
                    <th>Details</th>
                    <th>District</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id}>
                      <td>
                        {r.donationType === "Blood" ? "🩸" :
                         r.donationType === "Organ" ? "💚" :
                         r.donationType === "Hair" ? "✂️" : "👁️"}
                        {" "}{r.donationType}
                      </td>
                      <td>{r.bloodGroup || r.organNeeded
                        || r.donationType}</td>
                      <td>{r.location || r.district}</td>
                      <td>{getPriorityBadge(
                        r.priority || r.urgency)}</td>
                      <td>{getStatusBadge(r.status)}</td>
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
                          <div style={{display:"flex", gap:"6px"}}>
                            <button className="btn-secondary"
                              style={{padding:"5px 10px",
                                fontSize:"12px"}}
                              onClick={() => handleClose(r.id)}>
                              Close
                            </button>
                            <button className="btn-danger"
                              style={{padding:"5px 10px",
                                fontSize:"12px"}}
                              onClick={() => setConfirmDelete(r.id)}>
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HospitalRequests;
