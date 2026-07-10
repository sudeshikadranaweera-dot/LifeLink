
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import HospitalNavbar from "./HospitalNavbar";

function PostRequest() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState("");
  const [donationType, setDonationType] = useState("Blood");
  const [priority, setPriority] = useState("Emergency");
  const [bloodGroup, setBloodGroup] = useState("Any");
  const [organNeeded, setOrganNeeded] = useState("Kidney");
  const [patients, setPatients] = useState(1);
  const [district, setDistrict] = useState("Colombo");
  const [hospitalName, setHospitalName] = useState("");
  const [contact, setContact] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const districts = [
    "Colombo","Kandy","Galle","Jaffna","Matara",
    "Kurunegala","Ratnapura","Badulla","Anuradhapura",
    "Trincomalee","Batticaloa","Negombo","Hambantota",
    "Polonnaruwa","Ampara","Kegalle","Kalutara",
    "Matale","Nuwara Eliya","Monaragala","Vavuniya",
    "Mullaitivu","Kilinochchi","Mannar","Puttalam"
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile(data);
          setRole(data.role);
          setHospitalName(data.name || "");
          setContact(data.phone || "");
          setDistrict(data.district || "Colombo");
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hospitalName) {
      setError("Please enter hospital name!");
      return;
    }
    if (!contact) {
      setError("Please enter contact number!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await addDoc(collection(db, "donationRequests"), {
        donationType,
        priority,
        urgency: priority,
        bloodGroup: donationType === "Blood"
          ? bloodGroup : null,
        organNeeded: donationType === "Organ"
          ? organNeeded : null,
        patients: Number(patients),
        location: district,
        district,
        hospitalName,
        hospital: hospitalName,
        hospitalId: user?.uid,
        contact,
        details,
        status: "pending",
        createdAt: serverTimestamp()
      });
      setSuccess("Request posted successfully! It will be visible to donors after admin approves it.");
      setDetails("");
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to submit. Please try again.");
      setLoading(false);
    }
  };

  if (role === "donor") {
    return (
      <div className="app-layout">
        <HospitalNavbar />
        <div className="main-content">
          <div className="page-content">
            <div style={{
              textAlign:"center",
              padding:"80px 20px",
              display:"flex",
              flexDirection:"column",
              alignItems:"center",
              gap:"16px"
            }}>
              <span style={{fontSize:"60px"}}>🚫</span>
              <h2 style={{fontSize:"24px", fontWeight:"700"}}>
                Access Denied
              </h2>
              <p style={{fontSize:"15px",
                color:"var(--gray-500)"}}>
                Only hospital accounts can post
                donation requests.
              </p>
              <button className="btn-primary"
                style={{marginTop:"8px"}}
                onClick={() => navigate("/requests")}>
                Browse Donation Requests →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <HospitalNavbar />
      <div className="main-content">
        <div className="top-bar">
          <div className="top-bar-title">
            <h2>Create New Request</h2>
            <p>Post a donation request for your patients</p>
          </div>
        </div>
        <div className="page-content">
          <div style={{maxWidth:"700px", margin:"0 auto"}}>
            <div className="form-card">

              {error && (
                <div className="alert-error">{error}</div>
              )}
              {success && (
                <div className="alert-success">
                  ✅ {success}
                </div>
              )}

              {success ? (
                <div style={{textAlign:"center",
                  padding:"20px 0"}}>
                  <p style={{fontSize:"48px",
                    marginBottom:"16px"}}>🎉</p>
                  <h3 style={{fontSize:"18px",
                    fontWeight:"700",
                    marginBottom:"8px"}}>
                    Request Submitted!
                  </h3>
                  <p style={{fontSize:"14px",
                    color:"var(--gray-500)",
                    marginBottom:"24px"}}>
                    Your request is pending admin approval.
                    Once approved it will be visible
                    to donors.
                  </p>
                  <div style={{display:"flex",
                    gap:"12px", justifyContent:"center"}}>
                    <button className="btn-primary"
                      onClick={() => {
                        setSuccess("");
                        setDonationType("Blood");
                        setPriority("Emergency");
                        setBloodGroup("Any");
                        setPatients(1);
                        setDetails("");
                      }}>
                      Post Another Request
                    </button>
                    <button className="btn-secondary"
                      onClick={() =>
                        navigate("/hospital/requests")}>
                      View My Requests
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>

                  {/* DONATION TYPE */}
                  <div className="form-group">
                    <label>Donation Type</label>
                    <div className="donation-type-selector">
                      {[
                        {value:"Blood", emoji:"🩸",
                          label:"Blood"},
                        {value:"Organ", emoji:"💚",
                          label:"Organ"},
                        {value:"Hair", emoji:"✂️",
                          label:"Hair"},
                        {value:"Eye", emoji:"👁️",
                          label:"Eye"}
                      ].map(type => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() =>
                            setDonationType(type.value)}
                          style={{
                            padding:"14px 10px",
                            border: donationType === type.value
                              ? "2px solid var(--primary)"
                              : "2px solid var(--gray-200)",
                            borderRadius:"var(--radius)",
                            background:
                              donationType === type.value
                                ? "var(--primary-light)"
                                : "white",
                            cursor:"pointer",
                            fontSize:"13px",
                            fontWeight: donationType === type.value
                              ? "700" : "500",
                            color: donationType === type.value
                              ? "var(--primary)"
                              : "var(--gray-700)",
                            fontFamily:"'Poppins', sans-serif",
                            textAlign:"center",
                            display:"flex",
                            flexDirection:"column",
                            alignItems:"center",
                            gap:"6px",
                            transform:
                              donationType === type.value
                                ? "scale(1.05)" : "scale(1)",
                            boxShadow:
                              donationType === type.value
                                ? "0 4px 12px rgba(26,122,74,0.2)"
                                : "none",
                            transition:"all 0.2s"
                          }}>
                          <span style={{fontSize:"24px"}}>
                            {type.emoji}
                          </span>
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
                        {value:"Emergency",
                          label:"🔴 Emergency",
                          activeColor:"#dc3545",
                          activeBg:"#ffe0e3"},
                        {value:"Urgent",
                          label:"🟡 Urgent",
                          activeColor:"#fd7e14",
                          activeBg:"#fff0e0"},
                        {value:"Normal",
                          label:"🟢 Normal",
                          activeColor:"#28a745",
                          activeBg:"#e0f5e9"}
                      ].map(p => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setPriority(p.value)}
                          style={{
                            padding:"10px 18px",
                            border: priority === p.value
                              ? `2px solid ${p.activeColor}`
                              : "2px solid var(--gray-200)",
                            borderRadius:"var(--radius)",
                            background: priority === p.value
                              ? p.activeBg : "white",
                            cursor:"pointer",
                            fontSize:"13px",
                            fontWeight: priority === p.value
                              ? "700" : "500",
                            color: priority === p.value
                              ? p.activeColor
                              : "var(--gray-700)",
                            fontFamily:"'Poppins', sans-serif",
                            transform: priority === p.value
                              ? "scale(1.05)" : "scale(1)",
                            transition:"all 0.2s"
                          }}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* BLOOD FIELDS */}
                  {donationType === "Blood" && (
                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Blood Group Required</label>
                        <select className="form-select"
                          value={bloodGroup}
                          onChange={e =>
                            setBloodGroup(e.target.value)}>
                          <option value="Any">Any</option>
                          {["A+","A-","B+","B-","O+","O-",
                            "AB+","AB-"].map(b => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Number of Patients</label>
                        <input className="form-input"
                          type="number" min="1"
                          value={patients}
                          onChange={e =>
                            setPatients(e.target.value)} />
                      </div>
                    </div>
                  )}

                  {/* ORGAN FIELDS */}
                  {donationType === "Organ" && (
                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Organ Required</label>
                        <select className="form-select"
                          value={organNeeded}
                          onChange={e =>
                            setOrganNeeded(e.target.value)}>
                          {["Kidney","Liver","Heart",
                            "Lung","Cornea","Other"].map(o => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Number of Patients</label>
                        <input className="form-input"
                          type="number" min="1"
                          value={patients}
                          onChange={e =>
                            setPatients(e.target.value)} />
                      </div>
                    </div>
                  )}

                  {/* HAIR OR EYE */}
                  {(donationType === "Hair" ||
                    donationType === "Eye") && (
                    <div className="form-group">
                      <label>Number of Patients</label>
                      <input className="form-input"
                        type="number" min="1"
                        value={patients}
                        onChange={e =>
                          setPatients(e.target.value)} />
                    </div>
                  )}

                  {/* DISTRICT AND CONTACT */}
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>District</label>
                      <select className="form-select"
                        value={district}
                        onChange={e =>
                          setDistrict(e.target.value)}>
                        {districts.map(d => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Contact Number</label>
                      <input className="form-input"
                        type="text"
                        placeholder="07X XXX XXXX"
                        value={contact}
                        onChange={e =>
                          setContact(e.target.value)}
                        required />
                    </div>
                  </div>

                  {/* HOSPITAL NAME */}
                  <div className="form-group">
                    <label>Hospital Name</label>
                    <input className="form-input"
                      type="text"
                      placeholder="Enter hospital name"
                      value={hospitalName}
                      onChange={e =>
                        setHospitalName(e.target.value)}
                      required />
                  </div>

                  {/* DETAILS */}
                  <div className="form-group">
                    <label>Additional Details</label>
                    <textarea className="form-textarea"
                      placeholder="Enter details about the patient condition, urgency and any specific requirements..."
                      value={details}
                      onChange={e =>
                        setDetails(e.target.value)} />
                  </div>

                  {/* BUTTONS */}
                  <div style={{display:"flex",
                    gap:"12px", justifyContent:"flex-end"}}>
                    <button type="button"
                      className="btn-secondary"
                      onClick={() =>
                        navigate("/hospital/dashboard")}>
                      Cancel
                    </button>
                    <button type="submit"
                      className="btn-primary"
                      disabled={loading}>
                      {loading
                        ? "Submitting..."
                        : "Submit Request ✅"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostRequest;