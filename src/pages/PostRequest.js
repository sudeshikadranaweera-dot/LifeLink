import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function PostRequest() {
  const navigate = useNavigate();
  const [donationType, setDonationType] = useState("Blood");
  const [priority, setPriority] = useState("Emergency");
  const [bloodGroup, setBloodGroup] = useState("A+");
  const [organType, setOrganType] = useState("Kidney");
  const [district, setDistrict] = useState("Colombo");
  const [hospitalName, setHospitalName] = useState("");
  const [contact, setContact] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const districts = [
    "Colombo", "Kandy", "Galle", "Jaffna", "Matara",
    "Kurunegala", "Ratnapura", "Badulla", "Anuradhapura",
    "Trincomalee", "Batticaloa", "Negombo", "Hambantota",
    "Polonnaruwa", "Ampara", "Kegalle", "Kalutara",
    "Matale", "Nuwara Eliya", "Monaragala", "Vavuniya",
    "Mullaitivu", "Kilinochchi", "Mannar", "Puttalam"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "donationRequests"), {
        donationType,
        priority,
        urgency: priority,
        bloodGroup: donationType === "Blood" ? bloodGroup : null,
        organType: donationType === "Organ" ? organType : null,
        location: district,
        hospitalName,
        contact,
        details,
        status: "pending",
        createdAt: new Date()
      });
      setSuccess("✅ Request posted successfully! Waiting for admin approval.");
      setHospitalName("");
      setContact("");
      setDetails("");
      setLoading(false);
    } catch (err) {
      setError("Failed to submit. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Navbar />
      <div className="main-content">
        <div className="top-bar">
          <div className="top-bar-title">
            <h2>Post Donation Request</h2>
            <p>Submit a new donation request for approval</p>
          </div>
        </div>
        <div className="page-content">
          <div style={{maxWidth:"700px", margin:"0 auto"}}>
            <div className="form-card">

              {error && <div className="alert-error">{error}</div>}
              {success && <div className="alert-success">{success}</div>}

              <form onSubmit={handleSubmit}>
                {/* DONATION TYPE */}
                <div className="form-group">
                  <label>Donation Type</label>
                  <div className="donation-type-selector">
                    {[
                      {value:"Blood", emoji:"🩸", label:"Blood"},
                      {value:"Organ", emoji:"🫀", label:"Organ"},
                      {value:"Hair", emoji:"✂️", label:"Hair"},
                      {value:"Eye", emoji:"👁️", label:"Eye"}
                    ].map(type => (
                      <button
                        key={type.value}
                        type="button"
                        className={`donation-type-btn ${donationType === type.value ? "active" : ""}`}
                        onClick={() => setDonationType(type.value)}
                      >
                        <span>{type.emoji}</span>
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PRIORITY */}
                <div className="form-group">
                  <label>Priority Level</label>
                  <div className="priority-selector">
                    {[
                      {value:"Emergency", label:"🔴 Emergency"},
                      {value:"Urgent", label:"🟡 Urgent"},
                      {value:"Normal", label:"🟢 Normal"}
                    ].map(p => (
                      <button
                        key={p.value}
                        type="button"
                        className={`priority-radio ${priority === p.value ? `active-${p.value.toLowerCase()}` : ""}`}
                        onClick={() => setPriority(p.value)}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CONDITIONAL FIELDS */}
                {donationType === "Blood" && (
                  <div className="form-group">
                    <label>Blood Group Required</label>
                    <select
                      className="form-select"
                      value={bloodGroup}
                      onChange={e => setBloodGroup(e.target.value)}
                    >
                      {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                )}

                {donationType === "Organ" && (
                  <div className="form-group">
                    <label>Organ Type Required</label>
                    <select
                      className="form-select"
                      value={organType}
                      onChange={e => setOrganType(e.target.value)}
                    >
                      {["Kidney","Liver","Heart","Lung","Cornea","Bone Marrow","Pancreas"].map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* MAIN FIELDS */}
                <div className="form-row-2">
                  <div className="form-group">
                    <label>District</label>
                    <select
                      className="form-select"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                    >
                      {districts.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Contact Number</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="07X XXX XXXX"
                      value={contact}
                      onChange={e => setContact(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Hospital / Organization Name</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Enter hospital or organization name"
                    value={hospitalName}
                    onChange={e => setHospitalName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Additional Details</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Any additional information about the request..."
                    value={details}
                    onChange={e => setDetails(e.target.value)}
                  />
                </div>

                <div style={{display:"flex", gap:"12px", justifyContent:"flex-end"}}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => navigate("/home")}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostRequest;
