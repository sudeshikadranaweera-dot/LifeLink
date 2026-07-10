import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where,
  doc, updateDoc, addDoc, serverTimestamp }
  from "firebase/firestore";
import HospitalNavbar from "./HospitalNavbar";

function HospitalResponses() {
  const user = auth.currentUser;
  const [responses, setResponses] = useState([]);
  const [requests, setRequests] = useState([]);
  const [filterRequest, setFilterRequest] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const reqSnap = await getDocs(
        query(collection(db, "donationRequests"),
          where("hospitalId", "==", user?.uid))
      );
      const reqList = [];
      reqSnap.forEach(d => reqList.push({
        id: d.id, ...d.data()
      }));
      setRequests(reqList);
      const reqIds = reqList.map(r => r.id);
      const resSnap = await getDocs(
        collection(db, "responses")
      );
      const resList = [];
      resSnap.forEach(d => resList.push({
        id: d.id, ...d.data()
      }));
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

  const getHospitalName = (requestId) => {
    const request = requests.find(r => r.id === requestId);
    return request?.hospitalName || "the hospital";
  };

  const getDonationType = (requestId) => {
    const request = requests.find(r => r.id === requestId);
    return request?.donationType || "Donation";
  };

  const getLocation = (requestId) => {
    const request = requests.find(r => r.id === requestId);
    return request?.location || request?.district || "";
  };

  const handleAccept = async (response) => {
    try {
      await updateDoc(
        doc(db, "responses", response.id),
        { status: "accepted" }
      );
      await addDoc(collection(db, "notifications"), {
        userId: response.donorId,
        title: "Your donation offer was accepted!",
        message: `${getHospitalName(response.requestId)} has accepted your offer to donate. Please contact them directly to arrange the donation.`,
        type: "accepted",
        read: false,
        createdAt: serverTimestamp()
      });
      setSuccess("Donor accepted! A notification has been sent to the donor.");
      setTimeout(() => setSuccess(""), 4000);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (response) => {
    try {
      await updateDoc(
        doc(db, "responses", response.id),
        { status: "rejected" }
      );
      await addDoc(collection(db, "notifications"), {
        userId: response.donorId,
        title: "Donation offer update",
        message: `Thank you for your willingness to donate. Unfortunately ${getHospitalName(response.requestId)} has found a suitable donor for this request. Thank you for your kindness.`,
        type: "rejected",
        read: false,
        createdAt: serverTimestamp()
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = async (requestId) => {
    try {
      await updateDoc(
        doc(db, "donationRequests", requestId),
        { status: "Closed" }
      );
      const pendingResponses = responses.filter(r =>
        r.requestId === requestId &&
        (!r.status || r.status === "pending")
      );
      for (const response of pendingResponses) {
        await updateDoc(
          doc(db, "responses", response.id),
          { status: "rejected" }
        );
        await addDoc(collection(db, "notifications"), {
          userId: response.donorId,
          title: "Donation request closed",
          message: "The donation request you responded to has been closed. Thank you for your willingness to help!",
          type: "closed",
          read: false,
          createdAt: serverTimestamp()
        });
      }
      setSuccess("Request closed and donors notified!");
      setTimeout(() => setSuccess(""), 4000);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getFilteredResponses = () => {
    let filtered = responses;
    if (filterRequest !== "All") {
      filtered = filtered.filter(r =>
        r.requestId === filterRequest);
    }
    if (filterStatus !== "All") {
      filtered = filtered.filter(r => {
        if (filterStatus === "Pending")
          return !r.status || r.status === "pending";
        return r.status === filterStatus.toLowerCase();
      });
    }
    return filtered;
  };

  const stats = {
    total: responses.length,
    pending: responses.filter(r =>
      !r.status || r.status === "pending").length,
    accepted: responses.filter(r =>
      r.status === "accepted").length,
    rejected: responses.filter(r =>
      r.status === "rejected").length,
  };

  return (
    <div className="app-layout">
      <HospitalNavbar />
      <div className="main-content">
        <div className="top-bar">
          <div className="top-bar-title">
            <h2>Donor Responses</h2>
            <p>Manage responses to your donation requests</p>
          </div>
        </div>
        <div className="page-content">

          {/* STATS */}
          <div className="stats-grid"
            style={{gridTemplateColumns:"repeat(4,1fr)",
            marginBottom:"24px"}}>
            <div className="stat-card">
              <p className="stat-card-label">Total Responses</p>
              <p className="stat-card-number">{stats.total}</p>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Pending Review</p>
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
              <p className="stat-card-label">Rejected</p>
              <p className="stat-card-number red">
                {stats.rejected}
              </p>
            </div>
          </div>

          {success && (
            <div className="alert-success">
              ✅ {success}
            </div>
          )}

          {/* FILTERS */}
          <div className="filter-bar">
            <div style={{display:"flex",
              alignItems:"center", gap:"8px"}}>
              <label>Filter by Request:</label>
              <select className="form-select"
                style={{width:"auto", padding:"8px 12px"}}
                value={filterRequest}
                onChange={e =>
                  setFilterRequest(e.target.value)}>
                <option value="All">All Requests</option>
                {requests.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.donationType} — {r.location || r.district}
                  </option>
                ))}
              </select>
            </div>
            <div style={{display:"flex",
              alignItems:"center", gap:"8px"}}>
              <label>Status:</label>
              <select className="form-select"
                style={{width:"auto", padding:"8px 12px"}}
                value={filterStatus}
                onChange={e =>
                  setFilterStatus(e.target.value)}>
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* ACTIVE REQUESTS */}
          {requests.filter(r =>
            r.status === "approved").length > 0 && (
            <div className="form-card"
              style={{marginBottom:"24px"}}>
              <h3 style={{fontSize:"15px",
                fontWeight:"700", marginBottom:"8px"}}>
                Active Requests
              </h3>
              <p style={{fontSize:"13px",
                color:"var(--gray-500)",
                marginBottom:"12px"}}>
                Close a request when you have found
                enough donors
              </p>
              <div style={{display:"flex",
                flexDirection:"column", gap:"8px"}}>
                {requests.filter(r =>
                  r.status === "approved").map(r => (
                  <div key={r.id} style={{
                    display:"flex",
                    justifyContent:"space-between",
                    alignItems:"center",
                    padding:"12px 16px",
                    background:"var(--gray-100)",
                    borderRadius:"var(--radius)"}}>
                    <div>
                      <p style={{fontWeight:"600",
                        fontSize:"14px"}}>
                        {r.donationType} Donation
                        {r.organNeeded
                          ? ` — ${r.organNeeded}` : ""}
                        {r.bloodGroup &&
                          r.donationType === "Blood"
                          ? ` — ${r.bloodGroup}` : ""}
                      </p>
                      <p style={{fontSize:"12px",
                        color:"var(--gray-500)"}}>
                        {responses.filter(res =>
                          res.requestId === r.id &&
                          res.status === "accepted"
                        ).length} accepted donors
                      </p>
                    </div>
                    <button className="btn-danger"
                      style={{padding:"8px 16px",
                        fontSize:"12px"}}
                      onClick={() => handleClose(r.id)}>
                      Close Request
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RESPONSES LIST */}
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : getFilteredResponses().length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-emoji">💬</span>
              <h3>No responses found</h3>
              <p>Donors will respond to your requests here</p>
            </div>
          ) : (
            <div style={{display:"flex",
              flexDirection:"column", gap:"16px"}}>
              {getFilteredResponses().map(r => (
                <div key={r.id} className="form-card">

                  {/* REQUEST INFO */}
                  <div style={{
                    background:"var(--primary-light)",
                    padding:"8px 12px",
                    borderRadius:"8px",
                    marginBottom:"14px",
                    fontSize:"12px",
                    color:"var(--primary)",
                    fontWeight:"600"}}>
                    Response to: {getDonationType(r.requestId)}
                    {" "}Request — {getLocation(r.requestId)}
                  </div>

                  {/* DONOR INFO */}
                  <div style={{display:"grid",
                    gridTemplateColumns:"1fr 1fr",
                    gap:"12px", marginBottom:"14px"}}>
                    <div>
                      <p style={{fontSize:"16px",
                        fontWeight:"700",
                        marginBottom:"4px"}}>
                        👤 {r.donorName ||
                          r.donorEmail?.split("@")[0]}
                      </p>
                      <p style={{fontSize:"13px",
                        color:"var(--gray-500)"}}>
                        📧 {r.donorEmail}
                      </p>
                      <p style={{fontSize:"13px",
                        color:"var(--gray-500)"}}>
                        📞 {r.donorContact || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p style={{fontSize:"13px",
                        marginBottom:"4px"}}>
                        <strong>Blood Group:</strong>{" "}
                        {r.donorBloodGroup || "Not specified"}
                      </p>
                      <p style={{fontSize:"13px",
                        marginBottom:"4px"}}>
                        <strong>Donation Type:</strong>{" "}
                        {r.donationType || "Not specified"}
                      </p>
                      <p style={{fontSize:"13px"}}>
                        <strong>Responded:</strong>{" "}
                        {r.respondedAt?.toDate
                          ? r.respondedAt.toDate()
                            .toLocaleDateString()
                          : "Recently"}
                      </p>
                    </div>
                  </div>

                  {/* MESSAGE */}
                  {r.message && (
                    <div style={{
                      background:"var(--gray-100)",
                      padding:"12px 16px",
                      borderRadius:"var(--radius)",
                      marginBottom:"14px",
                      fontSize:"13px",
                      color:"var(--gray-700)",
                      fontStyle:"italic"}}>
                      💬 "{r.message}"
                    </div>
                  )}

                  {/* ACTIONS */}
                  {r.status === "accepted" ? (
                    <div style={{
                      background:"#d4edda",
                      padding:"12px 16px",
                      borderRadius:"var(--radius)",
                      color:"#155724",
                      fontSize:"13px",
                      fontWeight:"600"}}>
                      ✅ You accepted this donor.
                      Please contact them to arrange
                      the donation.
                    </div>
                  ) : r.status === "rejected" ? (
                    <div style={{
                      background:"#f8d7da",
                      padding:"12px 16px",
                      borderRadius:"var(--radius)",
                      color:"#721c24",
                      fontSize:"13px",
                      fontWeight:"600"}}>
                      ❌ You declined this donor response.
                    </div>
                  ) : (
                    <div style={{display:"flex",
                      gap:"10px"}}>
                      <button className="btn-success"
                        style={{flex:1, padding:"12px",
                          fontSize:"14px"}}
                        onClick={() => handleAccept(r)}>
                        ✅ Accept Donor
                      </button>
                      <button className="btn-danger"
                        style={{flex:1, padding:"12px",
                          fontSize:"14px"}}
                        onClick={() => handleReject(r)}>
                        ❌ Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HospitalResponses;