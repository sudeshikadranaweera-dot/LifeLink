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