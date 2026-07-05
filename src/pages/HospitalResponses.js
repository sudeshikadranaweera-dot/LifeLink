import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where,
  doc, updateDoc } from "firebase/firestore";
import HospitalNavbar from "./HospitalNavbar";

function HospitalResponses() {
  const user = auth.currentUser;
  const [responses, setResponses] = useState([]);
  const [requests, setRequests] = useState([]);
  const [filterRequest, setFilterRequest] = useState("All");
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

  const handleAccept = async (responseId) => {
    await updateDoc(doc(db, "responses", responseId),
      { status: "accepted" });
    setSuccess("✅ Response accepted! Donor has been notified.");
    setTimeout(() => setSuccess(""), 3000);
    fetchData();
  };

  const handleReject = async (responseId) => {
    await updateDoc(doc(db, "responses", responseId),
      { status: "rejected" });
    fetchData();
  };

  const filteredResponses = filterRequest === "All"
    ? responses
    : responses.filter(r => r.requestId === filterRequest);

  return (
    <div className="app-layout">
      <HospitalNavbar />
      <div className="main-content">
        <div className="top-bar">
          <div className="top-bar-title">
            <h2>Donor Responses</h2>
            <p>Manage responses to your requests</p>
          </div>
        </div>
        <div className="page-content">
          {success && <div className="alert-success">{success}</div>}
          <div className="filter-bar" style={{marginBottom:"24px"}}>
            <label>Filter by request:</label>
            <select className="form-select"
              style={{width:"auto", padding:"8px 12px"}}
              value={filterRequest}
              onChange={e => setFilterRequest(e.target.value)}>
              <option value="All">All Requests</option>
              {requests.map(r => (
                <option key={r.id} value={r.id}>
                  {r.donationType} - {r.location || r.district}
                </option>
              ))}
            </select>
          </div>
          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : filteredResponses.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-emoji">💬</span>
              <h3>No responses yet</h3>
              <p>Donors will respond to your requests here</p>
            </div>
          ) : (
            <div style={{display:"flex",
              flexDirection:"column", gap:"16px"}}>
              {filteredResponses.map(r => (
                <div key={r.id} className="form-card">
                  <p style={{fontSize:"12px",
                    color:"var(--gray-500)",
                    marginBottom:"14px", fontWeight:"600"}}>
                    Response to: {requests.find(
                      req => req.id === r.requestId
                    )?.donationType || "Donation"} Request
                  </p>
                  <div style={{display:"grid",
                    gridTemplateColumns:"1fr 1fr",
                    gap:"12px", marginBottom:"14px"}}>
                    <div>
                      <p style={{fontSize:"16px", fontWeight:"700"}}>
                        👤 {r.donorName ||
                          r.donorEmail?.split("@")[0]}
                      </p>
                      <p style={{fontSize:"13px",
                        color:"var(--gray-500)"}}>
                        {r.donorEmail}
                      </p>
                      <p style={{fontSize:"13px",
                        color:"var(--gray-500)"}}>
                        {r.donorContact}
                      </p>
                    </div>
                    <div>
                      <p style={{fontSize:"13px"}}>
                        <strong>Blood Group:</strong>{" "}
                        {r.donorBloodGroup || "Not specified"}
                      </p>
                    </div>
                  </div>
                  {r.message && (
                    <div style={{background:"var(--gray-100)",
                      padding:"12px 16px",
                      borderRadius:"var(--radius)",
                      marginBottom:"14px",
                      fontSize:"13px",
                      color:"var(--gray-700)"}}>
                      "{r.message}"
                    </div>
                  )}
                  <p style={{fontSize:"12px",
                    color:"var(--gray-500)", marginBottom:"14px"}}>
                    Received: {r.respondedAt?.toDate
                      ? r.respondedAt.toDate().toLocaleString()
                      : "Recently"}
                  </p>
                  {r.status === "accepted" ? (
                    <span className="badge-normal">✅ Accepted</span>
                  ) : r.status === "rejected" ? (
                    <span className="badge-emergency">
                      ❌ Rejected
                    </span>
                  ) : (
                    <div style={{display:"flex", gap:"10px"}}>
                      <button className="btn-success"
                        style={{flex:1, padding:"10px"}}
                        onClick={() => handleAccept(r.id)}>
                        ✅ Accept
                      </button>
                      <button className="btn-danger"
                        style={{flex:1, padding:"10px"}}
                        onClick={() => handleReject(r.id)}>
                        ❌ Reject
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
